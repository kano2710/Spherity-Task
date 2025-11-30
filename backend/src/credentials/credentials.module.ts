import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CryptographyModule } from 'src/cryptography/cryptography.module';
import { StorageModule } from 'src/storage/storage.module';
import { CredentialsService } from './credentials.service';

@Module({
  imports: [CryptographyModule, StorageModule],
  controllers: [CredentialsController],
  providers: [CredentialsService],
})
export class CredentialsModule {}
