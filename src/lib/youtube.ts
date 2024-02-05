import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strictOutput } from "./gpt";
import { env } from "~/env";
import { openai } from "~/trpc/server";

export async function searchYoutube(searchQuery: string) {
  searchQuery = encodeURIComponent(searchQuery);
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`,
  );

  if (!data) {
    console.log("youtube fail");
    return null;
  }
  if (data.items[0] == undefined) {
    console.log("youtube fail");
    return null;
  }
  return data.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
  try {
    const transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "EN",
    });
    let transcript = "";
    for (const t of transcript_arr) {
      transcript += t.text + " ";
    }
    return transcript.replaceAll("\n", "");
  } catch (error) {
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string,
) {
  type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };
  const questionList: Question[] = [];
  for (let i = 0; i < 5; i++) {
    const questionTemplate: Question = {
      question: "",
      answer: "",
      option1: "",
      option2: "",
      option3: "",
    };
    const prompt = `You are to generate a random theory based question about ${course_title}`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo-0125",
    });
    const generatedQuestion = completion.choices[0]?.message.content;
    const answer = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `In below 10 words, give me the answer to the question: ${generatedQuestion} without any precursor or additional words.`,
        },
      ],
      model: "gpt-3.5-turbo-0125",
    });

    const generatedAnswer = answer.choices[0]?.message.content;
    let visitedQuestions = "";
    const optionList = [];

    for (let i = 0; i < 3; i++) {
      const options = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content:
              `In below 10 words, give me a wrong answer to the question: ${generatedQuestion} without any precursor or additional words, that is not already in: ${visitedQuestions}.` +
              "Give wrong answers only that are still related.",
          },
        ],
        model: "gpt-3.5-turbo-0125",
      });
      visitedQuestions += ", " + options.choices[0]?.message.content;
      optionList.push(options.choices[0]?.message.content);
    }

    questionTemplate.question = generatedQuestion ?? "";
    questionTemplate.answer = generatedAnswer ?? "";
    questionTemplate.option1 = optionList[0] ?? "";
    questionTemplate.option2 = optionList[1] ?? "";
    questionTemplate.option3 = optionList[2] ?? "";

    questionList.push(structuredClone(questionTemplate));
  }
  console.log("==========QUESTIONLIST============================");
  console.log(questionList);
  console.log("=================================================");
  return questionList;
}
