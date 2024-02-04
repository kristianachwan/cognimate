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
          chapterBoilerplate.questions = JSON.parse(
            await generateQuestions({
              namespace: data?.file_name ?? "",
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
              <ResizablePanel>
                <h1 className="mx-3 mb-2 px-4 text-2xl font-bold">
                  AI Generated Summary
                </h1>
                <Card className="mx-6 rounded-xl px-4 py-4">
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
              <ResizableHandle withHandle />
              <ResizablePanel className="px-4">
                <Chatbot
                  initialMessage={`Here is a summary of a course that I want to learn in the form of JSON ${JSON.stringify(response)}`}
                />
              </ResizablePanel>
              <ResizablePanel>
                {isGenerateLoading && (
                  <div className="mx-auto">
                    Hang on while we generate your quiz questions...
                  </div>
                )}
                <QuizCards chapter={chapterTemplate} />
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
type questionType = {
  id: string;
  chapterId: string;
  question: string;
  options: string;
  answer: string;
};
