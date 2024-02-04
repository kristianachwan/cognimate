import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Course, Unit } from "@prisma/client";
import Link from "next/link";

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course.id}/0/0`}>
      <Card className="h-[500px] w-[300px] duration-700 ease-in hover:scale-[1.03] hover:border hover:border-primary">
        <CardHeader>
          <CardTitle className="capitalize">{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image
            className="h-[260px] w-[250px] rounded-md"
            src={course.image}
            width={250}
            height={250}
            alt="test"
          />
        </CardContent>
        <CardFooter className="flex-col">
          {course.units.map((unit) => (
            <CardDescription key={unit.id} className="">
              {unit.name}
            </CardDescription>
          ))}
        </CardFooter>
      </Card>
    </Link>
  );
}

type CourseCardProps = {
  course: Course & { units: Unit[] };
};
