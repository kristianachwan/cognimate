"use server";
import AWS from "aws-sdk";
import fs from "fs";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export async function downloadS3(file_key: string) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });
    const s3Client = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      },
      region: "ap-southeast-1",
    });
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: file_key,
    };
    const obj = await s3Client.getObject(params).promise();
    const file_name = `/tmp/pdf-${Date.now().toString()}.pdf`;
    fs.writeFileSync(file_name, obj.Body as Buffer);
    return file_name;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function downloadPdfFromS3(file_key: string) {
  const file_name = await downloadS3(file_key);
  const loader = new PDFLoader(file_name!);
  const pages = await loader.load();
  console.log(pages);
  return pages;
}
