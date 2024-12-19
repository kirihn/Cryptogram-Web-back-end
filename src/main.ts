import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { join } from 'path';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors();
    app.use(cookieParser());

    const swaggerConfig = new DocumentBuilder()
        .setTitle('CryptogramWeb API')
        .setDescription('use this document to explore this API')
        .setVersion('1.0')
        .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('swagger', app, swaggerDocument);

    await app.listen(3000);
}
bootstrap();
