import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
};

export const s3Client = new AWS.S3(s3Config);

export const S3_BUCKET = process.env.S3_BUCKET || 'doc-management-bucket';

export const getSignedUrl = (key: string, expires: number = 3600): string => {
  return s3Client.getSignedUrl('getObject', {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: expires,
  });
};

export default s3Client;
