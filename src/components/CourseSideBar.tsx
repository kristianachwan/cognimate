import { cn } from "~/lib/utils";
import type { Chapter, Course, Unit } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { Separator } from "./ui/separator";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  currentChapterId: string;
};

const CourseSideBar = async ({ course, currentChapterId }: Props) => {
  return (
    <div className="absolute h-[650px] w-[400px] overflow-y-scroll rounded-r-3xl bg-secondary p-6">
      <h1 className="text-4xl font-bold">{course.name}</h1>
      {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className="mt-4">
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Unit {unitIndex + 1}
            </h2>
            <h2 className="text-2xl font-bold">{unit.name}</h2>
            {unit.chapters.map((chapter, chapterIndex) => {
              return (
                <div key={chapter.id}>
                  <Link
                    href={`/course/${course.id}/${unitIndex}/${chapterIndex}`}
                    className={cn("text-secondary-foreground/60", {
                      "font-bold text-green-500":
                        chapter.id === currentChapterId,
                    })}
                  >
                    {chapter.name}
                  </Link>
                </div>
              );
            })}
            <Separator className="mt-2 bg-gray-500 text-gray-500" />
          </div>
        );
      })}
    </div>
  );
};

export default CourseSideBar;
