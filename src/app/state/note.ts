import { NAMESPACE } from "../constant";
import { atomWithStorage } from "jotai/utils";
export const noteAtom = atomWithStorage(NAMESPACE + "note", "");
