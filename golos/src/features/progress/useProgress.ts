import { useEffect, useState } from "react";

import {
    getProgressSummary,
    PROGRESS_EVENT,
} from "./progressStore";

export function useProgress() {
    const [progress, setProgress] =
        useState(getProgressSummary);

    useEffect(() => {
        const refresh = () => {
            setProgress(getProgressSummary());
        };

        window.addEventListener(PROGRESS_EVENT, refresh);
        window.addEventListener("storage", refresh);
        window.addEventListener("focus", refresh);

        return () => {
            window.removeEventListener(PROGRESS_EVENT, refresh);
            window.removeEventListener("storage", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, []);

    return progress;
}
