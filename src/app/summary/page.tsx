"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadS3 } from "../actions/s3";
import { api } from "~/trpc/react";
import { IoMdCloudUpload } from "react-icons/io";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Card, CardContent } from "~/components/ui/card";
// import { Chatbot } from "~/components/Chatbot";
import QuizCards from "~/components/QuizCards";
<<<<<<< HEAD:src/app/summary/page.tsx
import { Chatbot } from "~/components/Chatbot";
import { useAtom } from "jotai/react";
import {
  educationalLevelAtom,
  emailAtom,
  specialConditionAtom,
  usernameAtom,
  yearOfStudyAtom,
} from "../state/user";
=======
import Image from "next/image";
import loading from "public/loading-1.svg";
import loadingHalf from "public/loading-2.svg";
import loadingFull from "public/loading-3.svg";
import { set } from "zod";
>>>>>>> 6191ad2 (feat: loading screens when upload):src/app/chat/page.tsx

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

  const [username] = useAtom(usernameAtom);
  const [educationalLevel] = useAtom(educationalLevelAtom);
  const [yearOfStudy] = useAtom(yearOfStudyAtom);
  const [specialCondition] = useAtom(specialConditionAtom);

  return (
<<<<<<< HEAD:src/app/summary/page.tsx
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
=======
    <>
      <div className="rounded-xl bg-white p-2">
        {Object.keys(response).length === 0 && !uploaded && (
          <div className="mx-auto w-[650px]">
            <h1 className="my-8 text-center text-3xl font-bold">
              Upload Your PDF for an AI-generated Summary and Quiz
            </h1>
            <div
              {...getRootProps({
                className:
                  "border-dashed border-2 mt-4 font-bold text-lg mx-auto w-[650px] h-[200px] rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
              })}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col">
                <IoMdCloudUpload size={60} className="mx-auto " />
                <>Drop your PDF here</>
              </div>
>>>>>>> 6191ad2 (feat: loading screens when upload):src/app/chat/page.tsx
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
          {isUploadLoading && (
            <div className="mx-auto mt-32 flex flex-col">
              <Image
                src={loading}
                alt="loading-1"
                width={50}
                height={50}
                className="mx-auto my-2"
              />
              <div className="mx-auto ">
                Hang on while we parse your PDF document...
              </div>
            </div>
          )}

          {isSummarizeLoading && (
            <div className="mx-auto mt-32 flex flex-col">
              <Image
                src={loadingHalf}
                alt="loading-2"
                width={50}
                height={50}
                className="mx-auto my-2"
              />
              <div className="mx-auto">Summarizing your PDF document...</div>
            </div>
          )}
          {Object.keys(response).length > 0 && (
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={70}>
                <ResizablePanelGroup direction="vertical" className="pr-4">
                  <ResizablePanel defaultSize={25} className="pb-4">
                    <Chatbot
                      initialMessage={`
                        Hey! I am ${username}, currently a student at ${educationalLevel} in year ${yearOfStudy} ${specialCondition ? `with special condition of ${specialCondition}` : ""}\n
                        Here is a summary of a course that I want to learn in the form of JSON ${JSON.stringify(response)}.`}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel className="overflow-scroll pt-4">
                    <Card className="overflow-scroll rounded-xl px-4 py-4">
                      <h1 className="mx-3 mb-2 pt-4 text-2xl font-bold">
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
              <ResizablePanel>
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
