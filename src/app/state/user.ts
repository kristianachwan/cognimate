// import { atomWithStorage} from "jotai/utils";
import { atom } from "jotai/vanilla";
import { NAMESPACE } from "../constant";

// export const usernameAtom = atomWithStorage(NAMESPACE + "username", "");
// export const emailAtom = atomWithStorage(NAMESPACE + "email", "");
// export const educationalLevelAtom = atomWithStorage(
//   NAMESPACE + "educationalLevel",
//   "",
// );
// export const yearOfStudyAtom = atomWithStorage(NAMESPACE + "yearOfStudy", "");
// export const specialConditionAtom = atomWithStorage(
//   NAMESPACE + "specialCondition",
//   "",
// );
// export const registeredAtom = atomWithStorage<boolean>(
//   NAMESPACE + "registered",
//   false,
// );

export const usernameAtom = atom("");
export const emailAtom = atom("");
export const educationalLevelAtom = atom("");
export const yearOfStudyAtom = atom("");
export const specialConditionAtom = atom("");
export const registeredAtom = atom(false);
