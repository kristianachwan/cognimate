"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  educationalLevelAtom,
  yearOfStudyAtom,
  specialConditionAtom,
} from "~/app/state/user";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  educationalLevel: z.string(),
  yearOfStudy: z.string(),
  specialCondition: z.string(),
});

export default function PersonalizePage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationalLevel: "",
      yearOfStudy: "",
      specialCondition: "",
    },
  });

  const [, setEducationalLevel] = useAtom(educationalLevelAtom);
  const [, setYearOfStudy] = useAtom(yearOfStudyAtom);
  const [, setSpecialCondtion] = useAtom(specialConditionAtom);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const { educationalLevel, yearOfStudy, specialCondition } = values;
    setEducationalLevel(educationalLevel);
    setYearOfStudy(yearOfStudy);
    setSpecialCondtion(specialCondition);
    router.push("/course");
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-[30rem]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h1 className="text-3xl font-semibold">
              Help us to know you better!
            </h1>
            <FormField
              control={form.control}
              name="educationalLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Educational Level</FormLabel>
                  <FormControl>
                    <Input placeholder="University" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Condition</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Anything you want us to know?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Continue</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
