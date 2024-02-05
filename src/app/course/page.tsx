"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "~/components/CourseCard";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function CoursePage() {
  const { data: courses, isLoading } = api.course.getMany.useQuery();
  return (
    <div className="px-6 pt-8">
      <Link href="/course/create">
        <Button className="gap-4">
          <div>I want to learn...</div>
          <Plus />
        </Button>
      </Link>
      <div className="mt-8 flex h-full min-h-[90vh] w-screen flex-wrap items-center justify-center gap-4">
        {isLoading && <div>Loading...</div>}
        {courses?.length == 0 ? (
          <div>You dont have any course for now...</div>
        ) : (
          courses?.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  );
}
