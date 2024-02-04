"use client";
import { CourseCard } from "~/components/CourseCard";
import { api } from "~/trpc/react";

export default function CoursePage() {
  const { data: courses } = api.course.getMany.useQuery();
  return (
    <div className="flex h-full w-screen flex-wrap justify-center gap-4">
      {courses?.map((course) => <CourseCard key={course.id} course={course} />)}
    </div>
  );
}
