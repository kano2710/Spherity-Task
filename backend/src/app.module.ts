import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptographyService } from './cryptography/cryptography.service';
import { CryptographyModule } from './cryptography/cryptography.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CryptographyModule
  ],
  controllers: [AppController],
  providers: [AppService, CryptographyService],
})
export class AppModule { }
