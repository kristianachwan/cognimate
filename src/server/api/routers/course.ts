import { createChaptersSchema } from "~/app/validators/course";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { strictOutput } from "~/lib/gpt";
import { getUnsplashImage } from "~/lib/unsplash";
import { z } from "zod";

import {
  getQuestionsFromTranscript,
  getTranscript,
  searchYoutube,
} from "~/lib/youtube";

export const courseRouter = createTRPCRouter({
  getMany: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.course.findMany({ include: { units: true } });
  }),
  createChapters: publicProcedure
    .input(createChaptersSchema)
    .mutation(async ({ input: { title, units }, ctx }) => {
      const outputUnits = (await strictOutput(
        "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter",
        new Array(units.length).fill(
          `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course in youtube.`,
        ),
        {
          title: "title of the unit",
          chapters:
            "an array of chapters, each chapter should have a youtubeSearchQuery and a chapterTitle key in the JSON object",
        },
      )) as OutputUnits;

      const imageSearchTerm = await strictOutput(
        "you are an AI capable of finding the most relevant image for a course",
        `Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the unsplash API, so make sure it is a good search term that will return good results`,
        {
          imageSearchTerm: "a good search term for the title of the course",
        },
      );

      const courseImage = await getUnsplashImage(
        imageSearchTerm.imageSearchTerm,
      );
      const course = await ctx.db.course.create({
        data: {
          name: title,
          image: courseImage,
        },
      });

      void (await Promise.all(
        outputUnits.map(async (unit) => {
          const title = unit.title;
          const prismaUnit = await ctx.db.unit.create({
            data: {
              name: title,
              courseId: course.id,
            },
          });
          await ctx.db.chapter.createMany({
            data: unit.chapters.map((chapter) => {
              return {
                name: chapter.chapterTitle,
                youtubeSearchQuery: chapter.youtubeSearchQuery,
                unitId: prismaUnit.id,
              };
            }),
          });
        }),
      ));

      return { courseID: course.id };
    }),
  createChapterInfo: publicProcedure
    .input(z.object({ chapterId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { chapterId } = input;
      const chapter = await ctx.db.chapter.findUnique({
        where: {
          id: chapterId,
        },
      });
      if (!chapter) {
        return {
          success: false,
        };
      }
      const videoId = await searchYoutube(chapter.youtubeSearchQuery);
      console.log(chapter);
      let transcript = await getTranscript(videoId);
      const maxLength = 500;
      transcript = transcript.split(" ").slice(0, maxLength).join(" ");

      const { summary }: { summary: string } = await strictOutput(
        "You are an AI capable of summarising a youtube transcript",
        "summarise in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.\n" +
          transcript,
        { summary: "summary of the transcript" },
      );

      const questions = await getQuestionsFromTranscript(
        transcript,
        chapter.name,
      );

      await ctx.db.question.createMany({
        data: questions.map((question) => {
          let options = [
            question.answer,
            question.option1,
            question.option2,
            question.option3,
          ];
          options = options.sort(() => Math.random() - 0.5);
          return {
            question: question.question,
            answer: question.answer,
            options: JSON.stringify(options),
            chapterId: chapterId,
          };
        }),
      });

      await ctx.db.chapter.update({
        where: { id: chapterId },
        data: {
          videoId: videoId,
          summary: summary,
        },
      });

      return { success: true };
    }),
});

type OutputUnits = {
  title: string;
  chapters: {
    youtubeSearchQuery: string;
    chapterTitle: string;
  }[];
}[];
