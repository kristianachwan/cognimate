import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { openai } from "~/trpc/server";

export const questionRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ namespace: z.string() }))
    .mutation(async ({ input: { namespace } }) => {
      const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
      const index = pc.index("techfest-pdf-store");
      const headlines = [];

      for (let i = 0; i < 6; i++) {
        const questionTemplate: Question = {
          id: "",
          chapterId: "",
          question: "",
          answer: "",
          options: "",
        };
        const randomQueryResponse = await index.namespace(namespace).query({
          topK: 1,
          vector: Array.from(
            { length: 1536 },
            () => (Math.random() * 2 - 1) * 1536,
          ),
          includeMetadata: true,
        });

        const questionGenPrompt =
          randomQueryResponse.matches[0]?.metadata?.content +
          `. Given the context above, you are to generate a multiple choice question based strictly on the context above.` +
          "Generate only the question WITHOUT ANY OPTIONS.";
        const questionCompletion = await openai.chat.completions.create({
          messages: [{ role: "user", content: questionGenPrompt }],
          model: "gpt-3.5-turbo-0125",
        });

        const generatedQuestion =
          questionCompletion.choices[0]?.message.content;
        const answerCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: "user",
              content:
                `Given the context ${randomQueryResponse.matches[0]?.metadata?.content}` +
                `As short as you possibly can, give me the answer to the question: ${generatedQuestion} without any precursor or additional words.`,
            },
          ],
          model: "gpt-3.5-turbo-0125",
        });
        const generatedAnswer = answerCompletion.choices[0]?.message.content;
        let visitedQuestions = "";
        const optionList = [];

        for (let i = 0; i < 3; i++) {
          const options = await openai.chat.completions.create({
            messages: [
              {
                role: "user",
                content:
                  `Given the context ${questionCompletion.choices[0]?.message.content}` +
                  `Give me ONE wrong answer to the question: ${generatedQuestion} that may seem true.` +
                  `that is not already in the set:(${visitedQuestions}).` +
                  " Without any accompanying/precursor/additional words.",
              },
            ],
            model: "gpt-3.5-turbo-0125",
          });
          visitedQuestions += ", " + options.choices[0]?.message.content;
          optionList.push(options.choices[0]?.message.content);
        }
        optionList.push(generatedAnswer);

        questionTemplate.id = JSON.stringify(i);
        questionTemplate.chapterId = JSON.stringify(i);
        questionTemplate.options = JSON.stringify(optionList);
        questionTemplate.question = generatedQuestion ?? "";
        questionTemplate.answer = generatedAnswer ?? "";

        headlines.push(structuredClone(questionTemplate));
      }
      console.log("=======HEADLINES===================================");
      console.log(headlines);
      console.log("=======HEADLINES===================================");
      return JSON.stringify(headlines);
    }),
});
type Question = {
  id: string;
  chapterId: string;
  question: string;
  answer: string;
  options: string;
};
