"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { NotebookPen } from "lucide-react";
const DynamicReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

import "react-quill/dist/quill.snow.css";
import { createChatCompletion } from "~/app/actions/openai";
import { useState } from "react";
import dynamic from "next/dynamic";

export function Note() {
  // const [note, setNote] = useAtom(noteAtom);
  const [note, setNote] = useState("");
  async function getAutoComplete() {
    const autoComplete =
      (await createChatCompletion([
        {
          role: "user",
          content: `Complete the following sentence: ${note}`,
        },
      ])) ?? "";
    setNote(autoComplete);
  }
  return (
    <Drawer>
      <DrawerTrigger asChild className="z-50">
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 h-20 w-20 animate-pulse rounded-full"
        >
          <NotebookPen />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[45vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="py-4 text-3xl font-bold">
              Note 📝
            </DrawerTitle>
            <Button onClick={getAutoComplete}>Ask AI to Tidy Up 🪄✨</Button>
            <DynamicReactQuill
              theme="snow"
              value={note}
              onChange={(e) => setNote(e)}
              preserveWhitespace={true}
            />
          </DrawerHeader>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
