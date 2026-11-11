import type { SpeakingSession } from "../speaking/types";

const DICTION_KEY = "golos-diction-history-v1";
const SPEAKING_KEY = "golos-speaking-history-v1";
const VOCABULARY_KEY = "golos-vocabulary-v1";

export const PROGRESS_EVENT = "golos:progress-updated";
export const DAILY_GOAL_SECONDS = 20 * 60;

export interface DictionSession {
    id: string;
    exerciseId: string;
    exerciseTitle: string;
    durationSeconds: number;
    createdAt: string;
}

export interface DailyProgress {
    date: string;
    seconds: number;
    sessions: number;
    words: number;
    label: string;
}

function readStorage(key: string): unknown {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

function isObject(
    value: unknown
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

export function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date | null {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function getDictionSessions(): DictionSession[] {
    const data = readStorage(DICTION_KEY);

    if (!Array.isArray(data)) return [];

    return data.filter(
        (item): item is DictionSession =>
            isObject(item) &&
            typeof item.id === "string" &&
            typeof item.exerciseId === "string" &&
            typeof item.exerciseTitle === "string" &&
            typeof item.createdAt === "string" &&
            parseDate(item.createdAt) !== null &&
            typeof item.durationSeconds === "number" &&
            Number.isFinite(item.durationSeconds) &&
            item.durationSeconds > 0
    );
}

export function saveDictionSession(
    data: Pick<
        DictionSession,
        "exerciseId" | "exerciseTitle" | "durationSeconds"
    >
): boolean {
    if (
        !Number.isFinite(data.durationSeconds) ||
        data.durationSeconds <= 0
    ) {
        return false;
    }

    const session: DictionSession = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };

    const previous = getDictionSessions();

    try {
        localStorage.setItem(
            DICTION_KEY,
            JSON.stringify([session, ...previous].slice(0, 200))
        );

        window.dispatchEvent(new Event(PROGRESS_EVENT));
        return true;
    } catch {
        return false;
    }
}

function getSpeakingSessions(): SpeakingSession[] {
    const data = readStorage(SPEAKING_KEY);

    if (!Array.isArray(data)) return [];

    return data.filter(
        (item): item is SpeakingSession =>
            isObject(item) &&
            typeof item.createdAt === "string" &&
            parseDate(item.createdAt) !== null &&
            typeof item.durationSeconds === "number" &&
            Number.isFinite(item.durationSeconds) &&
            item.durationSeconds > 0 &&
            typeof item.rating === "number" &&
            item.rating >= 1 &&
            item.rating <= 5
    );
}

function getLearnedWords() {
    const data = readStorage(VOCABULARY_KEY);

    if (!isObject(data)) return [];

    return Object.values(data)
        .filter(isObject)
        .filter((item) => item.learned === true);
}

export function getProgressSummary() {
    const diction = getDictionSessions();
    const speaking = getSpeakingSessions();
    const words = getLearnedWords();

    const activity = new Map<
        string,
        { seconds: number; sessions: number; words: number }
    >();

    function getDay(key: string) {
        if (!activity.has(key)) {
            activity.set(key, {
                seconds: 0,
                sessions: 0,
                words: 0,
            });
        }

        return activity.get(key)!;
    }

    for (const session of [...diction, ...speaking]) {
        const date = parseDate(session.createdAt);
        if (!date) continue;

        const day = getDay(dateKey(date));

        day.seconds += session.durationSeconds;
        day.sessions += 1;
    }

    for (const word of words) {
        if (typeof word.learnedAt !== "string") continue;

        const date = parseDate(word.learnedAt);
        if (!date) continue;

        getDay(dateKey(date)).words += 1;
    }

    const now = new Date();
    now.setHours(12, 0, 0, 0);

    function recentDays(count: number): DailyProgress[] {
        return Array.from({ length: count }, (_, index) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (count - 1 - index));

            const key = dateKey(date);
            const value = getDay(key);

            return {
                date: key,
                seconds: value.seconds,
                sessions: value.sessions,
                words: value.words,
                label: date.toLocaleDateString("ru-RU", {
                    weekday: "short",
                }),
            };
        });
    }

    const activeDates = new Set(
        [...activity.entries()]
            .filter(
                ([, day]) => day.seconds > 0 || day.words > 0
            )
            .map(([key]) => key)
    );

    const cursor = new Date(now);

    if (!activeDates.has(dateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;

    while (activeDates.has(dateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    const today = getDay(dateKey(now));
    const weekly = recentDays(7);
    const calendar = recentDays(28);

    const totalSeconds = [...diction, ...speaking].reduce(
        (sum, item) => sum + item.durationSeconds,
        0
    );

    const averageRating =
        speaking.length > 0
            ? speaking.reduce(
            (sum, item) => sum + item.rating,
            0
        ) / speaking.length
            : null;

    return {
        streak,
        todaySeconds: today.seconds,
        todayWords: today.words,
        todaySessions: today.sessions,
        totalSeconds,
        totalSessions: diction.length + speaking.length,
        dictionSessions: diction.length,
        speakingSessions: speaking.length,
        learnedWords: words.length,
        averageRating,
        weekly,
        calendar,
        weeklySeconds: weekly.reduce(
            (sum, day) => sum + day.seconds,
            0
        ),
    };
}
