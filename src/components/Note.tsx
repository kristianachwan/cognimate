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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAtom } from "jotai/react";
import { noteAtom } from "~/app/state/note";
import { createChatCompletion } from "~/app/actions/openai";
import { useState } from "react";

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
    setNote((prevNote) => prevNote + autoComplete);
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
            <Button onClick={getAutoComplete}>Auto-complete with AI ✨</Button>
            <ReactQuill
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
