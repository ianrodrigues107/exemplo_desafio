import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: process.env.AWS_ENDPOINT,
  s3ForcePathStyle: true,
});

export const uploadFile = async (bucket: string, key: string, buffer: Buffer) => {
  return s3.upload({ Bucket: bucket, Key: key, Body: buffer }).promise();
};