import multer from 'multer';
import path from 'path';
import { Request } from 'express';

export const uploader = (directory: string, filePrefix?: string) => {
  // __dirname = pwd, dir file saat ini
  const defaultDirectory = path.join(__dirname, '../../public');
  const configureStoreFile = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
      const fileDestination = defaultDirectory + directory;
      console.log('destination file store:', fileDestination);

      callback(null, fileDestination);
    },
    filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
      const existName = file.originalname.split('.');
      console.log('original names', existName);

      const ext = existName[existName.length - 1];
      console.log('ext name', ext);

      if (filePrefix) {
        const newName = `${filePrefix}${Date.now()}.${ext}`;
        callback(null, newName);
      } else {
        callback(null, file.originalname);
      }
    },
  });

  return multer({ storage: configureStoreFile });
};

export const uploaderMemory = () => {
  return multer({ storage: multer.memoryStorage() });
};
