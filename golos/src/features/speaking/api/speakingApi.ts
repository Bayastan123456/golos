
import { apiRequest } from "../../../services/http";
import type { SpeakingSession } from "../types";

export type CreateSpeakingSession = Omit<
    SpeakingSession,
    "id" | "createdAt"
>;

type ServerSpeakingSession = Omit<
    SpeakingSession,
    "note"
> & {
    userId: string;
    note: string | null;
};

function normalizeSession(
    session: ServerSpeakingSession,
): SpeakingSession {
    return {
        id: session.id,
        topicId: session.topicId,
        topicTitle: session.topicTitle,
        durationSeconds: session.durationSeconds,
        goalSeconds: session.goalSeconds,
        rating: session.rating,
        note: session.note ?? "",
        createdAt: session.createdAt,
    };
}

export const speakingApi = {
    async getSessions(signal?: AbortSignal) {
        const sessions = await apiRequest<ServerSpeakingSession[]>(
            "/speaking/sessions",
            { signal },
        );

        return sessions.map(normalizeSession);
    },

    async createSession(data: CreateSpeakingSession) {
        const session = await apiRequest<ServerSpeakingSession>(
            "/speaking/sessions",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
        );

        return normalizeSession(session);
    },
};
