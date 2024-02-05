import { atomWithStorage } from "jotai/utils";
import { NAMESPACE } from "../constant";

export const usernameAtom = atomWithStorage(NAMESPACE + "username", "");
export const emailAtom = atomWithStorage(NAMESPACE + "email", "");
export const educationalLevelAtom = atomWithStorage(
  NAMESPACE + "educationalLevel",
  "",
);
export const yearOfStudyAtom = atomWithStorage(NAMESPACE + "yearOfStudy", "");
export const specialConditionAtom = atomWithStorage(
  NAMESPACE + "specialCondition",
  "",
);
export const registeredAtom = atomWithStorage<boolean>(
  NAMESPACE + "registered",
  false,
);
