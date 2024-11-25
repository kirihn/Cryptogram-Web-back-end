import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    async getHello() {
        return this.appService.getHello();
    }

    // @Get('*')
    // serveReactApp(@Res() res: Response) {
    //     const filePath = join(
    //         __dirname,
    //         '..',
    //         'reactBuild',
    //         'dist',
    //         'index.html',
    //     );
    //     res.sendFile(filePath); // Отправляем корректный путь
    // }
}
