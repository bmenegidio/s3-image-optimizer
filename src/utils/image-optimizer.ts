import sharp, { Sharp } from 'sharp';
import { PassThrough } from 'stream';

const OPTIMIZE_IF_LARGER_THAN_KB = 500;

export async function imageOptimizer(input: PassThrough): Promise<Sharp> {
  let image = sharp();
  input.pipe(image);
  image.withMetadata();
  const metadata = await image.metadata();

  const shouldResize =
    (metadata.width ?? 0) > 1200 || (metadata.height ?? 0) > 1200;

  const shouldOptimize = metadata.size
    ? metadata.size > OPTIMIZE_IF_LARGER_THAN_KB * 1024
    : true;

  if (shouldResize) {
    image = image.resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (shouldOptimize) {
    switch (metadata.format) {
      case 'jpeg':
        image = image.jpeg({ quality: 80, mozjpeg: true });
        break;
      case 'png':
        image = image.png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          quality: 80,
        });
        break;
      case 'webp':
        image = image.webp({ quality: 80 });
        break;
      case 'avif':
        image = image.avif({ quality: 50 });
        break;
    }
  }

  return image;
}
