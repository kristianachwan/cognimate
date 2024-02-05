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
import { Chatbot } from "~/components/Chatbot";
import QuizCards from "~/components/QuizCards";
import Image from "next/image";
import loadingFull from "public/loading-3.svg";

export default function ChatPage() {
  const chapterBoilerplate: chapterType = {
    id: "",
    unitId: "",
    name: "",
    youtubeSearchQuery: "",
    videoId: "",
    summary: "",
    questions: [],
  };

  const { mutateAsync: uploadPdf, isLoading: isUploadLoading } =
    api.upload.create.useMutation();
  const { mutateAsync: summarizePdf, isLoading: isSummarizeLoading } =
    api.summarize.create.useMutation();
  const { mutateAsync: generateQuestions, isLoading: isGenerateLoading } =
    api.question.create.useMutation();
  const [chapterTemplate, setChapterTemplate] = useState<any>();
  const [response, setResponse] = useState<Record<string, string>>({});
  const [uploaded, setUploaded] = useState<boolean>(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      uploadS3(file as unknown as File)
        .then(async (data) => {
          console.log(data);
          setUploaded(true);
          await uploadPdf({
            fileKey: data?.file_key ?? "",
            fileName: data?.file_name.replaceAll(" ", "+") ?? "",
          });

          setResponse(
            JSON.parse(
              await summarizePdf({
                namespace: data?.file_name.replaceAll(" ", "+") ?? "",
              }),
            ),
          );
          chapterBoilerplate.questions = JSON.parse(
            await generateQuestions({
              namespace: data?.file_name.replaceAll(" ", "+") ?? "",
            }),
          );

          setChapterTemplate(chapterBoilerplate);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  });

  return (
    <div className="pt-4">
      <div className="rounded-xl p-2">
        {Object.keys(response).length === 0 && (
          <div className="bg-ghost flex w-full flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-bold">Let the magic begin 🤖🪄</h1>
            <div
              {...getRootProps({
                className:
                  "border-dashed border-2 mx-auto w-[650px] rounded-xl cursor-pointer py-8 flex justify-center items-center flex-col",
              })}
            >
              <input {...getInputProps()} />
              <>
                Click to upload your PDF your PDF here or just drop it directly
              </>
            </div>
          </div>
        )}

        <div className="mx-auto flex flex-col gap-4">
          {(isSummarizeLoading || isUploadLoading) && (
            <div className="mx-auto">
              Hang on while we parse and summarize your PDF Document...
            </div>
          )}
          {Object.keys(response).length > 0 && (
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={70}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel className="px-4 pb-4" defaultSize={15}>
                    <Chatbot
                      initialMessage={`Here is a summary of a course that I want to learn in the form of JSON ${JSON.stringify(response)}`}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel className="px-4 pt-4" defaultSize={75}>
                    <Card className="rounded-xl px-4 py-4">
                      <h1 className="px-4 pt-4 text-3xl font-bold">
                        AI Generated Summary
                      </h1>
                      {Object.entries(response).map(([key, value]) => {
                        return (
                          <CardContent className="py-4" key={key}>
                            <h1 className="mb-2 text-xl font-bold">{key}</h1>
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
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel className="min-h-screen">
                {isGenerateLoading ? (
                  <div className="mx-auto mt-32 flex flex-col">
                    <Image
                      src={loadingFull}
                      alt="loading-3"
                      width={50}
                      height={50}
                      className="mx-auto my-2"
                    />
                    <div className="mx-auto">
                      Generating knowledge check questions..
                    </div>
                  </div>
                ) : (
                  <QuizCards chapter={chapterTemplate} />
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </div>
  );
}

type chapterType = {
  id: string;
  unitId: string;
  name: string;
  youtubeSearchQuery: string;
  videoId: string | null;
  summary: string | null;
  questions: {
    id: string;
    chapterId: string;
    question: string;
    options: string;
    answer: string;
  }[];
};
