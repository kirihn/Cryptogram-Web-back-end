import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
// import { join } from 'path';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors();
    app.use(cookieParser());

    // app.use((req, res, next) => {
    //     console.log(1);

    //     if (!req.url.startsWith('/api')) {
    //         console.log(2);
    //         res.sendFile(
    //             join(__dirname, '..', 'reactBuild', 'dist', 'index.html'),
    //         );
    //     } else {
    //         console.log(3);

    //         next();
    //     }
    // });

    await app.listen(3000);
}
bootstrap();
