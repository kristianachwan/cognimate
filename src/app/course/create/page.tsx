"use client";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { useToast } from "~/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Plus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "~/components/ui/separator";
import { createChaptersSchema } from "~/app/validators/course";

type Input = z.infer<typeof createChaptersSchema>;

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutateAsync: createChapters, isLoading } =
    api.course.createChapters.useMutation({
      onSuccess: ({ courseID }) => {
        toast({
          title: "Success",
          description: "Course created successfully",
        });
        router.push(`/course/create/${courseID}`);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      },
    });
  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: [""],
    },
  });

  async function onSubmit(data: Input) {
    if (data.units.some((unit) => unit === "")) {
      toast({
        title: "Error",
        description: "Please fill all the units",
        variant: "destructive",
      });
      return;
    }
    await createChapters(data);
  }

  form.watch();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-[40vw] rounded-lg border px-8 py-8">
        <Form {...form}>
          <h1 className="text-2xl font-bold">
            Choose any topic that you want to learn...
          </h1>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 w-full">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => {
                return (
                  <FormItem className="flex w-full flex-col items-start sm:flex-row sm:items-center">
                    <FormLabel className="flex-[1] text-xl">Title</FormLabel>
                    <FormControl className="flex-[6]">
                      <Input
                        placeholder="Enter the main topic of the course"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <AnimatePresence>
              {form.watch("units").map((_, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      height: { duration: 0.2 },
                    }}
                  >
                    <FormField
                      key={index}
                      control={form.control}
                      name={`units.${index}`}
                      render={({ field }) => {
                        return (
                          <FormItem className="flex w-full flex-col items-start sm:flex-row sm:items-center">
                            <FormLabel className="flex-[1] text-xl">
                              Unit {index + 1}
                            </FormLabel>
                            <FormControl className="flex-[6]">
                              <Input
                                placeholder="Enter subtopic of the course"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-center">
              <Separator className="flex-[1]" />
              <div className="mx-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="font-semibold"
                  onClick={() => {
                    form.setValue("units", [...form.watch("units"), ""]);
                  }}
                >
                  Add Unit
                  <Plus className="ml-2 h-4 w-4 text-green-500" />
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="ml-2 font-semibold"
                  onClick={() => {
                    form.setValue("units", form.watch("units").slice(0, -1));
                  }}
                >
                  Remove Unit
                  <Trash className="ml-2 h-4 w-4 text-red-500" />
                </Button>
              </div>
              <Separator className="flex-[1]" />
            </div>
            <Button
              disabled={isLoading}
              type="submit"
              className="mt-6 w-full"
              size="lg"
            >
              Lets Go!
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
