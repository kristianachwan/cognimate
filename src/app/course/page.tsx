"use client";
import { CourseCard } from "~/components/CourseCard";
import { api } from "~/trpc/react";

export default function CoursePage() {
  const { data: courses, isLoading } = api.course.getMany.useQuery();
  return (
    <>
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {courses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </>
      )}
    </>
  );
}
