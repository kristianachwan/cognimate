import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { downloadPdfFromS3 } from "~/app/actions/dowloadPDF";
import { Document } from "langchain/document";
import { openai } from "~/trpc/server";

export const uploadRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ fileKey: z.string(), fileName: z.string() }))
    .mutation(async ({ input: { fileKey, fileName } }) => {
      const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
      const index = pc.index("techfest-pdf-store");
      const pages = await downloadPdfFromS3(fileKey);
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 1,
      });
      let text = "";

      for (let i = 0; i < pages.length; i++) {
        text += pages[i]?.pageContent;
      }
      const output = await splitter.splitDocuments([
        new Document({ pageContent: text }),
      ]);

      for (let i = 0; i < output.length; i++) {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: output[i]?.pageContent ?? "",
          encoding_format: "float",
        });

        console.log(embedding.data[0]?.embedding);

        await index.namespace(fileName).upsert([
          {
            id: String(i),
            values: embedding.data[0]?.embedding ?? [],
            metadata: { content: output[i]?.pageContent ?? "" },
          },
        ]);
      }
      console.log("done");
    }),
});
