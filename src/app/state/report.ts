/* {`courseID`: {`unitID`: {`chapterID`: {title: string, questions: questions}}}}
 */

import { atomWithStorage } from "jotai/utils";
import { NAMESPACE } from "../constant";

export const reportAtom = atomWithStorage(NAMESPACE + "report", {});

export const getUpdatedReport = (
  report: any,
  courseID: string,
  unitID: string,
  chapterID: string,
  title: string,
  questions: Questions,
) => {
  const updatedReport = structuredClone(report);
  if (!updatedReport[courseID]) {
    updatedReport[courseID] = {};
  }

  if (!updatedReport[courseID][unitID]) {
    updatedReport[courseID][unitID] = {};
  }

  if (!updatedReport[courseID][unitID][chapterID]) {
    updatedReport[courseID][unitID][chapterID] = {};
  }

  updatedReport[courseID][unitID][chapterID] = {
    title,
    questions,
  };

  return updatedReport;
};

type Questions = {
  question: string;
  correctAnswer: string;
  isCorrect: boolean;
}[];
