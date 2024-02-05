"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "~/components/CourseCard";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function CoursePage() {
  const { data: courses, isLoading } = api.course.getMany.useQuery();
  return (
    <div className="px-6 pt-8">
      <div className="mt-8 flex h-full min-h-[90vh] w-screen flex-wrap items-center justify-center gap-4">
        {isLoading && <div>Loading...</div>}
        {courses?.length == 0 ? (
          <div>You dont have any course for now...</div>
        ) : (
          <>
            <Link href={`/course/create`}>
              <Card className="border-ghost flex h-[500px] w-[300px] items-center justify-center border border-dashed duration-700 ease-in hover:scale-[1.03] hover:border hover:border-primary">
                <Plus className="h-10 w-10" />
              </Card>
            </Link>
            {courses?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
