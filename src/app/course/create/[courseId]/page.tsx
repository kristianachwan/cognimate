import ConfirmChapters from "~/components/ConfirmChapters";
import { prisma } from "~/lib/db";
import { Info } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    courseId: string;
  };
};

const CreateChapters = async ({ params: { courseId } }: Props) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  });
  if (!course) {
    return redirect("/course/create");
  }
  return (
    <div className="mx-auto my-16 flex max-w-xl flex-col items-start">
      <h5 className="text-seconday-foreground/60 text-sm uppercase">
        Course Name
      </h5>
      <h1 className="text-5xl font-bold">{course.name}</h1>

      <div className="mt-5 flex border-none bg-secondary p-4">
        <Info className="mr-3 h-12 w-12 text-blue-400" />
        <div>
          We generated chapters for each of your units. Look over them and then
          click the Button to confirm and continue
        </div>
      </div>
      <ConfirmChapters course={course} />
    </div>
  );
};

export default CreateChapters;
