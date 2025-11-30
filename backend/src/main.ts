import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
    maxAge: 3600,
  });

  const config = new DocumentBuilder()
    .setTitle('Verifiable Credential API')
    .setDescription('W3C-compliant credential issuance, verification, and management system using EdDSA (Ed25519) signing')
    .setVersion('1.0')
    .addTag('credentials', 'Credential operations (issue, verify, manage)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
