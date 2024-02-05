import { Send } from "lucide-react";
import React, { useState } from "react";
import { createChatCompletion } from "~/app/actions/openai";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function Chatbot({ initialMessage = "" }: ChatbotProps) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([{ role: "user", content: initialMessage }]);

  const [prompt, setPrompt] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) {
      alert("prompt is empty");
    }
    const copyMessages: {
      role: "user" | "assistant";
      content: string;
    }[] = [
      ...messages,
      {
        role: "user",
        content: prompt,
      },
    ];
    setPrompt("");
    setMessages(copyMessages);
    const content = await createChatCompletion(copyMessages);
    setMessages([
      ...copyMessages,
      {
        role: "assistant",
        content: content ?? "We are unable to respond back",
      },
    ]);
  };
  return (
    <Card className="rounded-xl px-4 py-4">
      <div>
        <h1 className="text-3xl font-bold">Ask Cognimate! 🤖🪄</h1>
        <div className="flex flex-col gap-4 py-6">
          {messages.slice(1).map((obj, i) => (
            <div key={i} className="w-full">
              {obj.role === "user" && (
                <div className="flex flex-col items-end">
                  <Card className="px-4 py-2">{obj.content}</Card>
                </div>
              )}
              {obj.role === "assistant" && (
                <div className="flex flex-col items-start">
                  <Card className="px-4 py-2">{obj.content}</Card>
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          <div className="flex flex-nowrap items-center justify-between gap-4">
            <form onSubmit={onSubmit} className="flex-grow">
              <Input
                type="text"
                placeholder="Send a message..."
                onChange={(e) => {
                  setPrompt(e.target.value);
                }}
                value={prompt}
              />
            </form>

            <Button type="submit">
              <Send />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

type ChatbotProps = {
  initialMessage: string;
};
