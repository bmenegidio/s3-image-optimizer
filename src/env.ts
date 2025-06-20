import { z } from 'zod/v4';

const envSchema = z.object({
  S3_REGION: z.string().nonempty(),
  S3_TOKEN: z.string().nonempty(),
  S3_ACCESS_KEY: z.string().nonempty(),
  S3_SECRET_ACCESS_KEY: z.string().nonempty(),
  S3_ENDPOINT: z.string().nonempty(),
  S3_BUCKET_NAME: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);
