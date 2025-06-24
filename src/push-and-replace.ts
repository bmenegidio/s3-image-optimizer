import { opendir } from 'fs/promises';
import { createReadStream } from 'fs';
import sharp, { Metadata } from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { OPTIMIZED_FILES_PATH } from './utils/constants';
import { safeOperation } from './utils/safe-operation';
import { s3ClientInstance } from './s3/client-instance';
import { env } from './env';

(async () => {
  let pushedImagesCount = 0;
  const dir = await opendir(OPTIMIZED_FILES_PATH);
  for await (const dirent of dir) {
    const fileName = dirent.name;
    const filePath = `${OPTIMIZED_FILES_PATH}/${fileName}`;
    const fileStream = createReadStream(filePath);
    const sharpImage = sharp();
    fileStream.pipe(sharpImage);

    const [metadataError, metadata] = await safeOperation<Metadata>(() => {
      return sharpImage.metadata();
    });
    if (metadataError || !metadata?.format) {
      console.log(`The file: "${fileName}" is not a valid image, skipping...`);
      continue;
    }

    const [bufferError, fileBuffer] = await safeOperation<Buffer>(() => {
      return sharpImage.toBuffer();
    });
    if (bufferError || fileBuffer === null) {
      console.log(`Error processing image "${fileName}", skipping...`);
      continue;
    }

    const [putObjectError, putObjectResponse] = await safeOperation(() => {
      return s3ClientInstance.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Body: fileBuffer,
          Key: fileName,
          ContentType: `image/${metadata?.format}`,
        }),
      );
    });
    if (putObjectError || putObjectResponse?.$metadata.httpStatusCode !== 200) {
      console.log(`Error uploading image "${fileName}", skipping...`);
      continue;
    }

    pushedImagesCount++;
  }

  console.log(`Pushed images: ${pushedImagesCount}`);
})();
