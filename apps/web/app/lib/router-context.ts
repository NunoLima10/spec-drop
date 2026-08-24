import type { DB } from "@specdrop/db";
import { createContext } from "react-router";

export const dbContext = createContext<DB | undefined>(undefined);
export const originContext = createContext<string | undefined>(undefined);
