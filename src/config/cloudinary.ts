import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export const cloudinaryUpload = (file: Express.Multer.File): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream((error, result: UploadApiResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
