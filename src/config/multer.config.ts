import { diskStorage } from 'multer';

export const chatFileMulterOptions = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'userUploads/temp');
        },
        filename: (req, file, cb) => {
            const fixedName = Buffer.from(file.originalname, 'latin1').toString(
                'utf8',
            );
            const fileName = `Time-${Date.now()}EndTime-${fixedName}`;
            cb(null, fileName);
        },
    }),
};
