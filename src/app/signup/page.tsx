"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usernameAtom, emailAtom } from "~/app/state/user";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email(),
});

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const [, setUsername] = useAtom(usernameAtom);
  const [, setEmail] = useAtom(emailAtom);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const { username, email } = values;
    setUsername(username);
    setEmail(email);
    router.push("/personalize");
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-[30rem]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h1 className="text-3xl font-semibold">Who are... you?</h1>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Foo" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is for your display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="foobar@gmail.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We wont spam you. Have our words!
                  </FormDescription>
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
