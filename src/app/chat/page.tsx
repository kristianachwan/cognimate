"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadS3 } from "../actions/s3";
import { api } from "~/trpc/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Card, CardContent } from "~/components/ui/card";

export default function ChatPage() {
  const { mutateAsync: uploadPdf, isLoading: isUploadLoading } =
    api.upload.create.useMutation();
  const { mutateAsync: summarizePdf, isLoading: isSummarizeLoading } =
    api.summarize.create.useMutation();
  const [response, setResponse] = useState<Record<string, string>>({});
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      uploadS3(file as unknown as File)
        .then(async (data) => {
          console.log(data);
          await uploadPdf({
            fileKey: data?.file_key ?? "",
            fileName: data?.file_name ?? "",
          });
          setResponse(
            JSON.parse(
              await summarizePdf({
                namespace: data?.file_name ?? "",
              }),
            ),
          );
          console.log();
        })
        .catch((error) => {
          console.error(error);
        });
    },
  });

  return (
    <>
      <div className="rounded-xl bg-white p-2">
        {Object.keys(response).length === 0 && (
          <div
            {...getRootProps({
              className:
                "border-dashed border-2 mx-auto w-[650px] rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
            })}
          >
            <input {...getInputProps()} />
            <>Drop your PDF here</>
          </div>
        )}

        <div className="mx-auto flex w-[700px] flex-col gap-4">
          {(isSummarizeLoading || isUploadLoading) && (
            <div className="mx-auto">
              Hang on while we parse and summarize your PDF Document...
            </div>
          )}
          {Object.keys(response).length > 0 && (
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel>
                <Card className="rounded-xl px-4 py-4">
                  {Object.entries(response).map(([key, value]) => {
                    return (
                      <CardContent className="py-4" key={key}>
                        <h1 className="mb-2 text-2xl font-bold">{key}</h1>
                        {value.split("\n").map((line) => (
                          <p className="indent-4" key={line}>
                            {line}
                          </p>
                        ))}
                      </CardContent>
                    );
                  })}
                </Card>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>One</ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </>
  );
}
