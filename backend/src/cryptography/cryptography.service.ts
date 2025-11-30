import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { exportJWK, generateKeyPair, importJWK, JWTPayload, jwtVerify, SignJWT } from 'jose';
import cryptography from 'crypto';

interface EncryptedData {
    iv: string;
    salt: string;
    authTag: string;
    encrypted: string;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = 'sha512';

@Injectable()
export class CryptographyService implements OnModuleInit {
    private readonly logger = new Logger(CryptographyService.name);
    private privateKey!: CryptoKey;
    private publicKey!: CryptoKey;

    async onModuleInit() {
        try {
            await this.loadOrGenerateKeys();
        } catch (error) {
            this.logger.fatal(`Failed to initialize cryptographic keys: ${error.message}`);
            throw error;
        }
    }

    private async loadOrGenerateKeys() {
        const keysDir = path.join(process.cwd(), 'keys');
        const privateKeyPath = path.join(keysDir, 'private.pem.enc');
        const publicKeyPath = path.join(keysDir, 'public.pem');
        const passphrase = this.getEncryptionKey();

        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
        }

        if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
            const encryptedPrivateKey = JSON.parse(fs.readFileSync(privateKeyPath, 'utf-8'));
            const plainPublicKey = JSON.parse(fs.readFileSync(publicKeyPath, 'utf-8'));

            if (passphrase) {
                const decryptedPrivate = this.decryptData(encryptedPrivateKey, passphrase);
                this.privateKey = (await importJWK(
                    JSON.parse(decryptedPrivate),
                    'EdDSA',
                    { extractable: false },
                )) as CryptoKey;
            } else {
                throw new Error('KEY_ENCRYPTION_PASSPHRASE not set');
            }

            this.publicKey = (await importJWK(plainPublicKey, 'EdDSA', {
                extractable: true,
            })) as CryptoKey;

            this.logger.log('Ed25519 keys loaded from separate files');
        } else {
            const { privateKey, publicKey } = await generateKeyPair('EdDSA', {
                extractable: true,
            });

            const privateJWK = await exportJWK(privateKey);
            const publicJWK = await exportJWK(publicKey);

            if (passphrase) {
                const encryptedPrivate = this.encryptData(JSON.stringify(privateJWK), passphrase);
                fs.writeFileSync(
                    privateKeyPath,
                    JSON.stringify(encryptedPrivate, null, 2),
                );

                fs.writeFileSync(
                    publicKeyPath,
                    JSON.stringify(publicJWK, null, 2),
                );

                this.privateKey = (await importJWK(privateJWK, 'EdDSA', {
                    extractable: false,
                })) as CryptoKey;

                this.publicKey = (await importJWK(publicJWK, 'EdDSA', {
                    extractable: true,
                })) as CryptoKey;

                this.logger.log('New Ed25519 keypair generated');
            } else {
                throw new Error('Passphrase required for key generation');
            }
        }
    }

    private getEncryptionKey(): string {
        const passphrase = process.env.KEY_ENCRYPTION_PASSPHRASE;
        if (!passphrase) {
            this.logger.warn('KEY_ENCRYPTION_PASSPHRASE not set!');
        }
        return passphrase || '';
    }

    private encryptData(data: string, passphrase: string): EncryptedData {
        const iv = cryptography.randomBytes(IV_LENGTH);
        const salt = cryptography.randomBytes(SALT_LENGTH);
        const key = cryptography.pbkdf2Sync(
            passphrase,
            salt,
            PBKDF2_ITERATIONS,
            KEY_LENGTH,
            PBKDF2_DIGEST,
        );

        const cipher = cryptography.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(data, 'utf8'),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            salt: salt.toString('hex'),
            authTag: authTag.toString('hex'),
            encrypted: encrypted.toString('hex'),
        };
    }

    private decryptData(encryptedData: EncryptedData, passphrase: string): string {
        const key = cryptography.pbkdf2Sync(
            passphrase,
            Buffer.from(encryptedData.salt, 'hex'),
            PBKDF2_ITERATIONS,
            KEY_LENGTH,
            PBKDF2_DIGEST,
        );

        const decipher = cryptography.createDecipheriv(
            ALGORITHM,
            key,
            Buffer.from(encryptedData.iv, 'hex'),
        );
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData.encrypted, 'hex')),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    }

    async signJWT(payload: JWTPayload): Promise<string> {
        const jwt = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'EdDSA' })
            .setIssuedAt()
            .sign(this.privateKey);

        return jwt;
    }

    async verifyJWT(
        token: string,
    ): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
        try {
            const { payload } = await jwtVerify(token, this.publicKey);
            return { valid: true, payload };
        } catch (error) {
            this.logger.error(`JWT verification failed: ${error.message}`);
            return { valid: false, error: 'Invalid or expired credential' };
        }
    }
}
