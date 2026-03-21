import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  //Hotfix para serealizar BigInts en JSON
  ;(BigInt.prototype as any).toJSON = function () { return this.toString() }

  app.enableCors({
    origin: 'http://localhost:5173', // frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
