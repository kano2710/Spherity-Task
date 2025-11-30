import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';
import { VerifiableCredential } from '../common/interface/verifiable-credential.interface';

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private readonly storagePath: string;
    private readonly credentialsFile: string;
    private readonly revocationsFile: string;

    constructor() {
        this.storagePath = path.join(process.cwd(), 'data');
        this.credentialsFile = path.join(this.storagePath, 'credentials.json');
        this.revocationsFile = path.join(this.storagePath, 'revocations.json');
    }

    async onModuleInit() {
        await this.initializeStorage();
    }

    private async initializeStorage() {
        try {
            await fs.mkdir(this.storagePath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                this.logger.error(`Failed to create data directory: ${error.message}`);
                throw error;
            }
        }

        try {
            await fs.access(this.credentialsFile);
        } catch {
            await fs.writeFile(this.credentialsFile, JSON.stringify([], null, 2));
        }

        try {
            await fs.access(this.revocationsFile);
        } catch {
            await fs.writeFile(this.revocationsFile, JSON.stringify([], null, 2));
        }
    }

    private async readCredentials(): Promise<VerifiableCredential[]> {
        try {
            const data = await fs.readFile(this.credentialsFile, 'utf-8');
            const parsed: unknown = JSON.parse(data);

            if (!Array.isArray(parsed)) {
                this.logger.error('Corrupted credentials file');
                return [];
            }

            return parsed as VerifiableCredential[];
        } catch (error) {
            if (error instanceof SyntaxError) {
                this.logger.error('Invalid JSON');
                return [];
            }
            this.logger.error(
                `Failed to read credentials file: ${error.message}`,
            );
            throw error;
        }
    }

    private async writeCredentials(credentials: VerifiableCredential[]): Promise<void> {
        try {
            await fs.writeFile(
                this.credentialsFile,
                JSON.stringify(credentials, null, 2),
            );
        } catch (error) {
            this.logger.error(
                `Failed to write credentials file: ${error.message}`,
            );
            throw error;
        }
    }

    async save(credential: VerifiableCredential): Promise<VerifiableCredential> {
            const credentials = await this.readCredentials();
            credentials.push(credential);
            await this.writeCredentials(credentials);
            return credential;
    }

    async findAll(): Promise<VerifiableCredential[]> {
            return await this.readCredentials();
    }

    async findById(id: string): Promise<VerifiableCredential | null> {
            const credentials = await this.readCredentials();
            return credentials.find((cred) => cred.id === id) || null;
    }

    async delete(id: string): Promise<boolean> {
      const credentials = await this.readCredentials();
      const initialLength = credentials.length;
      const filtered = credentials.filter((cred) => cred.id !== id);

      if (filtered.length < initialLength) {
        await this.writeCredentials(filtered);
        return true;
      }
      return false;
  }

  private async readRevocations(): Promise<string[]> {
    try {
      const data = await fs.readFile(this.revocationsFile, 'utf-8');
      const parsed: unknown = JSON.parse(data);

      if (!Array.isArray(parsed)) {
        this.logger.error('Corrupted revocations file');
        return [];
      }

      return parsed as string[];
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.logger.error('Invalid JSON');
        return [];
      }
      this.logger.error(`Failed to read revocations file: ${error.message}`);
      throw error;
    }
  }

  private async writeRevocations(revocations: string[]): Promise<void> {
    try {
      await fs.writeFile(
        this.revocationsFile,
        JSON.stringify(revocations, null, 2),
      );
    } catch (error) {
      this.logger.error(`Failed to write revocations file: ${error.message}`);
      throw error;
    }
  }

  async revoke(id: string): Promise<void> {
      const revocations = await this.readRevocations();
      if (!revocations.includes(id)) {
        revocations.push(id);
        await this.writeRevocations(revocations);
      }
  }

  async isRevoked(id: string): Promise<boolean> {
    const revocations = await this.readRevocations();
      return revocations.includes(id);
  }
}
