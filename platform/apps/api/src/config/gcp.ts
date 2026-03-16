import { Storage } from '@google-cloud/storage';
import { env } from './env';

const storage = new Storage();

export function getBucket() {
  if (!env.gcsBucketName) {
    throw new Error('GCS_BUCKET_NAME is required');
  }
  return storage.bucket(env.gcsBucketName);
}
