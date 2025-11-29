import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptographyService } from './cryptography/cryptography.service';
import { CryptographyModule } from './cryptography/cryptography.module';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage/storage.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CryptographyModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService, CryptographyService, StorageService],
})
export class AppModule { }
