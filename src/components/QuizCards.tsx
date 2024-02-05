"use client";
import { cn } from "~/lib/utils";
import type { Chapter, Question } from "@prisma/client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { createChatCompletion } from "~/app/actions/openai";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useToast } from "./ui/use-toast";

type Props = {
  chapter: Chapter & {
    questions: Question[];
  };
};

const QuizCards = ({ chapter }: Props) => {
  const { toast, dismiss } = useToast();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [improve, setImprove] = React.useState("");
  const [well, setWell] = React.useState("");
  const [notWell, setNotWell] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const [questionState, setQuestionState] = React.useState<
    Record<string, boolean | null>
  >({});
  const correct = Object.values(questionState).filter((val) => val).length;
  const total = Object.keys(questionState).length;
  const ratio = total === 0 ? correct / total : 0;
  async function getFeedback() {
    toast({
      title: "Loading...",
      description: "Getting feedback for you...",
      duration: 10000,
      itemID: "1",
    });
    const summary = {
      wrong: [] as string[],
      right: [] as string[],
    };

    chapter?.questions?.forEach((question) => {
      if (question.id in questionState) {
        if (questionState[question.id]) {
          summary.wrong.push(question.question);
        } else {
          summary.right.push(question?.question);
        }
      }
    });

    const wellPromise = createChatCompletion([
      {
        role: "user",
        content: `I am currently learning ${chapter.name} and got this questions right: ${JSON.stringify(summary.right)}. As short as you possibly can, tell me where I did good.`,
      },
    ]).then((well) => setWell(well ?? ""));

    const notWellPromise = createChatCompletion([
      {
        role: "user",
        content: `I am currently learning ${chapter.name} and got this questions wrong: ${JSON.stringify(summary.wrong)}. In 4 sentences without beating around the bush, tell me where I lack.`,
      },
    ]).then((notWell) => setNotWell(notWell ?? ""));

    const improvePromise = createChatCompletion([
      {
        role: "user",
        content: `I am currently learning ${chapter.name} and got this questions right: ${JSON.stringify(summary.right)} and wrong: ${JSON.stringify(summary.wrong)}. As short as you possibly can, tell me what I should focus on to improve in my learning experience.`,
      },
    ]).then((improve) => setImprove(improve ?? ""));

    await Promise.all([wellPromise, notWellPromise, improvePromise]);
    setOpen(true);
    dismiss("1");
  }

  const checkAnswer = React.useCallback(async () => {
    const newQuestionState = { ...questionState };
    chapter?.questions.forEach((question) => {
      const user_answer = answers[question.id];
      if (!user_answer) return;
      if (user_answer === question.answer) {
        newQuestionState[question.id] = true;
      } else {
        newQuestionState[question.id] = false;
      }
      setQuestionState(newQuestionState);
    });
  }, [answers, questionState, chapter?.questions]);

  return (
    <div className="ml-8 mt-16 flex-[1]">
      <h1 className="text-3xl font-bold">Concept Check</h1>
      <div className="mt-2">
        {chapter?.questions.map((question) => {
          const options = JSON.parse(question.options) as string[];
          return (
            <div
              key={question.id}
              className={cn("mt-4 rounded-lg border border-secondary p-3", {
                "bg-green-700": questionState[question.id] === true,
                "bg-red-700": questionState[question.id] === false,
                "bg-secondary": questionState[question.id] === null,
              })}
            >
              <h1 className="text-lg font-semibold">{question.question}</h1>
              <div className="mt-2">
                <RadioGroup
                  onValueChange={(e: any) => {
                    setAnswers((prev) => {
                      return {
                        ...prev,
                        [question.id]: e,
                      };
                    });
                  }}
                >
                  {options.map((option, index) => {
                    return (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem
                          value={option}
                          id={question.id + index.toString()}
                        />
                        <Label htmlFor={question.id + index.toString()}>
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className="mt-2 w-full"
        size="lg"
        onClick={async () => {
          checkAnswer();
          await getFeedback();
        }}
      >
        Check Answer
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Performance Evaluation</AlertDialogTitle>
            You got {correct}/{total} correct.
            {ratio < 0.5 && (
              <AlertDialogDescription className="text-lg font-bold text-destructive">
                Keep improving! 🧑‍💻📈
              </AlertDialogDescription>
            )}
            {ratio >= 0.5 && ratio < 0.7 && (
              <AlertDialogDescription className="text-lg font-bold text-yellow-600">
                Well done! Keep learning 🤩
              </AlertDialogDescription>
            )}
            {ratio >= 0.7 && (
              <AlertDialogDescription className="text-lg font-bold text-green-800">
                Great Job 🌟
              </AlertDialogDescription>
            )}
            <p className="text-xl font-bold">Here are a few tips:</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-bold">
                  What went well?
                </AccordionTrigger>
                <AccordionContent>{well}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-bold">
                  What did not go well?
                </AccordionTrigger>
                <AccordionContent>{notWell}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-bold">
                  How to improve?
                </AccordionTrigger>
                <AccordionContent>{improve}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizCards;
