import { join, dirname } from 'path';
import { createWriteStream, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable, PassThrough } from 'stream';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { s3ClientInstance } from './s3/client-instance';
import { env } from './env';
import { imageOptimizer } from './utils/image-optimizer';
import { OPTIMIZED_FILES_PATH, ORIGINAL_FILES_PATH } from './utils/constants';
import { safeOperation } from './utils/safe-operation';

(async () => {
  let optimizedImagesCount = 0;
  let continuationToken: string | undefined = undefined;

  mkdirSync(dirname(ORIGINAL_FILES_PATH), { recursive: true });
  mkdirSync(dirname(OPTIMIZED_FILES_PATH), { recursive: true });

  console.log('Backing up and optimizing...');
  do {
    const [listObjectsError, listObjectsResponse] = await safeOperation(() => {
      return s3ClientInstance.send(
        new ListObjectsV2Command({
          Bucket: env.S3_BUCKET_NAME,
          ContinuationToken: continuationToken,
        }),
      );
    });

    if (listObjectsError || !Array.isArray(listObjectsResponse?.Contents)) {
      throw new Error('Error listing objects!');
    }

    for (const object of listObjectsResponse.Contents) {
      const [getObjectError, getObjectResponse] = await safeOperation(() => {
        return s3ClientInstance.send(
          new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: object.Key,
          }),
        );
      });

      if (
        getObjectError ||
        !object.Key ||
        !getObjectResponse?.Body ||
        !(getObjectResponse.Body instanceof Readable)
      ) {
        throw new Error('Object body is invalid!');
      }

      const objectKey = object.Key;
      const originalFileDestination = createWriteStream(
        join(ORIGINAL_FILES_PATH, objectKey),
      );
      const optimizedFileDestination = createWriteStream(
        join(OPTIMIZED_FILES_PATH, objectKey),
      );

      const originalStream = new PassThrough();
      const optimizedStream = new PassThrough();

      getObjectResponse.Body.pipe(originalStream);
      getObjectResponse.Body.pipe(optimizedStream);

      const saveOriginal = pipeline(originalStream, originalFileDestination);

      const transformed = await imageOptimizer(optimizedStream);
      const optimizeAndSave = pipeline(transformed, optimizedFileDestination);

      await Promise.all([saveOriginal, optimizeAndSave]);

      optimizedImagesCount++;
    }

    continuationToken = listObjectsResponse.IsTruncated
      ? listObjectsResponse.NextContinuationToken
      : undefined;
  } while (continuationToken);

  console.log('Backup and optimization complete!');
  console.log(`Optimized images: ${optimizedImagesCount}`);
})();
