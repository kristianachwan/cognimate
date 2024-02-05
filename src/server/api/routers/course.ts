import { createChaptersSchema } from "~/app/validators/course";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { strictOutput } from "~/lib/gpt";
import { getUnsplashImage } from "~/lib/unsplash";
import { z } from "zod";
import { openai } from "~/trpc/server";

import {
  getQuestionsFromTranscript,
  getTranscript,
  searchYoutube,
} from "~/lib/youtube";
import { TRPCError } from "@trpc/server";

export const courseRouter = createTRPCRouter({
  getMany: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.course.findMany({ include: { units: true } });
  }),
  createChapters: publicProcedure
    .input(createChaptersSchema)
    .mutation(async ({ input: { title, units }, ctx }) => {
      try {
        const outputUnitList: OutputUnit[] = [];
        let chapterList: Chapter[] = [];
        const chapterTemplate: Chapter = {
          youtubeSearchQuery: "",
          chapterTitle: "",
        };
        const outputUnitTemplate: OutputUnit = {
          title: "",
          chapters: chapterList,
        };

        for (const unit of units) {
          const promptPrefix = `Given the unit: ${unit} of the main subject ${title}: `;
          let visitedSet = "";
          chapterList = [];

          for (let i = 0; i < 3; i++) {
            const chapterName = await openai.chat.completions.create({
              messages: [
                {
                  role: "user",
                  content:
                    promptPrefix +
                    "Provide me with a book chapter title for the unit in less than 10 words." +
                    `That is not already in ${visitedSet}`,
                },
              ],
              model: "gpt-3.5-turbo-0125",
            });
            visitedSet =
              visitedSet + ", " + chapterName.choices[0]?.message.content;

            const chapterYTQuery = await openai.chat.completions.create({
              messages: [
                {
                  role: "user",
                  content:
                    `Given the topic ${chapterName.choices[0]?.message.content}, ` +
                    "Provide me with a youtube search query for the given topic WITHOUT QUOTATION MARKS.",
                },
              ],
              model: "gpt-3.5-turbo-0125",
            });

            visitedSet =
              visitedSet + ", " + chapterName.choices[0]?.message.content;
            chapterTemplate.chapterTitle =
              chapterName.choices[0]?.message.content?.replaceAll('"', "") ??
              "";
            chapterTemplate.youtubeSearchQuery =
              chapterYTQuery.choices[0]?.message.content ?? "";
            chapterList.push(structuredClone(chapterTemplate));
          }
          console.log(
            "=========================CHAPTERLIST=================================",
          );
          console.log(chapterList);
          console.log(
            "==================================================================",
          );
          outputUnitTemplate.title = unit;
          outputUnitTemplate.chapters = chapterList;
          outputUnitList.push(structuredClone(outputUnitTemplate));
        }

        console.log(
          "=========================CHAPTER==================================",
        );
        console.log(outputUnitList);
        console.log(
          "==================================================================",
        );

        const imageSearchTerm = await strictOutput(
          "you are an AI capable of finding the most relevant image for a course",
          `Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the unsplash API, so make sure it is a good search term that will return good results`,
          {
            imageSearchTerm: "a good search term for the title of the course",
          },
        );
        console.log(
          "=========================CHAPTER==================================",
        );
        console.log(imageSearchTerm);
        console.log(
          "==================================================================",
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
          outputUnitList.map(async (unit) => {
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
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: JSON.stringify(error),
        });
      }
    }),
  createChapterInfo: publicProcedure
    .input(z.object({ chapterId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
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
        console.log(
          "=========================CHAPTER==================================",
        );
        console.log(chapter);
        console.log(
          "==================================================================",
        );
        let transcript = await getTranscript(videoId);
        const maxLength = 500;
        transcript = transcript.split(" ").slice(0, maxLength).join(" ");

        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "user",
              content:
                "You are an AI capable of summarising a youtube transcript" +
                "summarise the following transcript in 250 words without referencing the video or channel itself, summarize only the educational content of the video.\n" +
                transcript,
            },
          ],
          model: "gpt-3.5-turbo-0125",
        });
        const summary = completion.choices[0]?.message.content;
        console.log(
          "=========================SUMMARY==================================",
        );
        console.log(summary);
        console.log(
          "==================================================================",
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
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: JSON.stringify(error),
        });
      }
    }),
});

type OutputUnit = {
  title: string;
  chapters: {
    youtubeSearchQuery: string;
    chapterTitle: string;
  }[];
};
type Chapter = {
  youtubeSearchQuery: string;
  chapterTitle: string;
};
