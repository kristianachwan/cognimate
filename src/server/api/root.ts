import { createTRPCRouter } from "~/server/api/trpc";
import { courseRouter } from "./routers/course";
import { uploadRouter } from "./routers/upload";
import { summarizeRouter } from "./routers/summarize";
import { questionRouter } from "./routers/question";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  summarize: summarizeRouter,
  course: courseRouter,
  upload: uploadRouter,
  question: questionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
