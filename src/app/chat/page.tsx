"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadS3 } from "../actions/s3";
import { api } from "~/trpc/react";

export default function ChatPage() {
  const { mutateAsync } = api.upload.create.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      uploadS3(file as unknown as File)
        .then((data) => {
          console.log(data);
          mutateAsync({
            fileKey: data?.file_key ?? "",
            fileName: data?.file_name ?? "",
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },
  });

  return (
    <>
      <div className="rounded-xl bg-white p-2">
        <div
          {...getRootProps({
            className:
              "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
          })}
        >
          <input {...getInputProps()} />
          <>drop pdf here</>
        </div>
      </div>
    </>
  );
}
