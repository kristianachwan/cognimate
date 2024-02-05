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
        const randomQueryResponse = await index.namespace(namespace).query({
          topK: 1,
          vector: Array.from(
            { length: 1536 },
            () => (Math.random() * 2 - 1) * 1536,
          ),
          includeMetadata: true,
        });

        const prompt =
          randomQueryResponse.matches[0]?.metadata?.content +
          ". Given the chunk of statement above, generate a multiple choice question in the following JSON format: " +
          " {id: string, chapterId: string, question: string, options: string, answer: string } where id and chapterId should be random hash strings" +
          " and the options must be in the form of a string array wrapped in square brackets";
        console.log(prompt);
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant designed to output JSON.",
            },
            { role: "user", content: prompt },
          ],
          model: "gpt-3.5-turbo-0125",
        });
        headlines.push(
          JSON.parse(completion.choices[0]?.message.content ?? ""),
        );
        headlines[i].id = JSON.stringify(i);
        headlines[i].options = JSON.stringify(headlines[i].options);
      }
      console.log(headlines);
      return JSON.stringify(headlines);
    }),
});
