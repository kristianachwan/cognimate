import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { openai } from "~/trpc/server";

export const postRouter = createTRPCRouter({
  hello: publicProcedure.query(async () => {
    return {
      greeting: (
        await openai.chat.completions.create({
          messages: [
            { role: "user", content: "Please great and introduce yourself!" },
          ],
          model: "gpt-3.5-turbo",
        })
      ).choices[0]?.message?.content,
    };
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),
});
