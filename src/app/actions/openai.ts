"use server";
import { openai } from "~/trpc/server";

export async function createChatCompletion(
  messages: {
    role: "user" | "assistant";
    content: string;
  }[],
) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    messages: messages,
  });

  return response.choices[0]?.message.content;
}
