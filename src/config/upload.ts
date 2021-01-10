import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const storagePath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: storagePath,

  storage: multer.diskStorage({
    destination: storagePath,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};
