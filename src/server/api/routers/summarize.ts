import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Document } from "langchain/document";
import { openai } from "~/trpc/server";

export const summarizeRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ namespace: z.string() }))
    .mutation(async ({ input: { namespace } }) => {
      const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
      const index = pc.index("techfest-pdf-store");
      const headlines = [];
      const headlinesJSON: Record<string, string> = {};

      for (let i = 0; i < 4; i++) {
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
          ". Give me the major topic found in the text above in 5 words or less.";
        console.log(prompt);
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo-0125",
        });
        headlines.push(completion.choices[0]?.message.content);
        const curKey = headlines[i] ?? "";
        if (curKey) {
          headlinesJSON[curKey] = "";
        }
      }

      console.log(headlines);
      for (const topic of headlines) {
        console.log("topic: " + topic);
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: topic ?? "",
          encoding_format: "float",
        });
        const queryResponse = await index.namespace(namespace).query({
          topK: 5,
          vector: embedding.data[0]?.embedding ?? [],
          includeMetadata: true,
        });
        let queryString = "";
        queryResponse.matches.map(
          (item) => (queryString += item?.metadata?.content),
        );
        console.log("queryString: " + queryString);
        const prompt =
          queryString +
          ". Give me 3 of the most important points from the text above separated by newline characters.";
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo-0125",
        });
        headlinesJSON[topic ?? ""] =
          completion.choices[0]?.message.content ?? "";
      }
      console.log(headlinesJSON);
      return JSON.stringify(headlinesJSON);
    }),
});
