import { useContext } from "react";

import { ProgressContext } from "../progress-context";

export function useProgressSummary() {
    const context = useContext(ProgressContext);

    if (!context) {
        throw new Error(
            "useProgressSummary должен использоваться внутри ProgressProvider",
        );
    }

    return context;
}
