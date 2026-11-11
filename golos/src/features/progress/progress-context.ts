import { createContext } from "react";

import type { ProgressSummary } from "./api/progressApi";

export interface ProgressContextValue {
    summary: ProgressSummary | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export const ProgressContext =
    createContext<ProgressContextValue | null>(null);
