import { Injectable, Logger } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { VerifiableCredential } from 'src/common/interface/verifiable-credential.interface';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from 'src/storage/storage.service';
import { CryptographyService } from 'src/cryptography/cryptography.service';

@Injectable()
export class CredentialsService {
    private readonly logger = new Logger(CredentialsService.name);

    constructor(
        private readonly cryptographyService: CryptographyService,
        private readonly storageService: StorageService,
    ) { }

    async issueCredential(createCredentialDto: CreateCredentialDto): Promise<VerifiableCredential> {
        const { type, credentialSubject, issuer } = createCredentialDto;

        const credential: Omit<VerifiableCredential, 'proof'> = {
            '@context': ['https://www.w3.org/ns/credentials/v2'],
            id: `urn:uuid:${uuidv4()}`,
            type: ['VerifiableCredential', ...type],
            credentialSubject,
            issuer: issuer || 'did:example:issuer',
            issuanceDate: new Date().toISOString()
        };

        const proof = await this.cryptographyService.signJWT({ ...credential });
        const verifiableCredential: VerifiableCredential = {
            ...credential,
            proof,
        };

        await this.storageService.save(verifiableCredential);

        return verifiableCredential;
    }

    async findAll(): Promise<VerifiableCredential[]> {
        const allCredentials = await this.storageService.findAll();
        return allCredentials;
    }

    async findOne(id: string): Promise<VerifiableCredential | null> {
        return await this.storageService.findById(id);
    }

    async verify(token: string): Promise<{ valid: boolean; payload?: any; error?: string; revoked?: boolean }> {
    const result = await this.cryptographyService.verifyJWT(token);

    if (!result.valid) {
      this.logger.warn('Credential verification failed: invalid signature');
      return result;
    }

    const credentialId = result.payload?.id;
    if (credentialId && typeof credentialId === 'string') {
      const isRevoked = await this.storageService.isRevoked(credentialId);
      if (isRevoked) {
        this.logger.warn(`Credential is revoked: ${credentialId}`);
        return {
          valid: true,
          payload: result.payload,
          revoked: true,
          error: 'Credential has been revoked',
        };
      }
    }
    return { ...result, revoked: false };
  }

  async remove(id: string): Promise<boolean> {
    await this.storageService.revoke(id);
    const deleted = await this.storageService.delete(id);
    return deleted;
  }
}
