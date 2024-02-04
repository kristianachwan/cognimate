import AWS from "aws-sdk";

export async function uploadS3(file: File) {
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
    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };
    const upload = s3Client
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "pdf progress upload",
          parseInt(((evt.loaded * 100) / evt.total).toString()),
        ) + "%";
      })
      .promise();
    await upload.then((data) => {
      console.log("pdf upload success: ", file_key);
    });
    return Promise.resolve({
      file_key,
      file_name: file.name,
    });
  } catch (error) {}
}

export async function getPdfUrl(file_key: string) {
  const url = `https://'${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${file_key}`;
  return url;
}
