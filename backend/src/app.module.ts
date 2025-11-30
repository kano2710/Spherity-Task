import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptographyModule } from './cryptography/cryptography.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { CredentialsModule } from './credentials/credentials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CryptographyModule,
    StorageModule,
    CredentialsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
