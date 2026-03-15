import { Storage } from '@google-cloud/storage';
import { env } from './env';

const storage = new Storage();

export function getBucket() {
  return storage.bucket(env.gcsBucketName);
}
