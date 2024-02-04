"use client";
import { cn } from "~/lib/utils";
import type { Chapter } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapters: Set<String>;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ chapter, chapterIndex, setCompletedChapters, completedChapters }, ref) => {
    const { toast } = useToast();
    const [success, setSuccess] = React.useState<boolean | null>(null);
    const { mutateAsync: getChapterInfo, isLoading } =
      api.course.createChapterInfo.useMutation({
        onSuccess: () => {
          setSuccess(true);
          addChapterIdToSet();
        },
        onError: (error) => {
          console.error(error);
          setSuccess(false);
          toast({
            title: "Error",
            description: "There was an error loading your chapter",
            variant: "destructive",
          });
          addChapterIdToSet();
        },
      });

    const addChapterIdToSet = React.useCallback(() => {
      setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(chapter.id);
        return newSet;
      });
    }, [chapter.id, setCompletedChapters]);

    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        addChapterIdToSet;
      }
    }, [chapter, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (chapter.videoId) {
          addChapterIdToSet();
          return;
        }
        getChapterInfo({ chapterId: chapter.id });
      },
    }));
    return (
      <div
        key={chapter.id}
        className={cn("mt-2 flex justify-between rounded px-4 py-2", {
          "bg-secondary": success === null,
          "bg-red-500": success === false,
          "bg-green-500": success === true,
        })}
      >
        <h5>{chapter.name}</h5>
        {isLoading && <Loader2 className="animate-spin" />}
      </div>
    );
  },
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;
