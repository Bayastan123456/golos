
import { apiRequest } from "../../../services/http";

export interface DictionSession {
    id: string;
    userId: string;
    exerciseId: string;
    exerciseTitle: string;
    durationSeconds: number;
    createdAt: string;
}

export interface CreateDictionSession {
    exerciseId: string;
    exerciseTitle: string;
    durationSeconds: number;
}

export const dictionApi = {
    getSessions(signal?: AbortSignal) {
        return apiRequest<DictionSession[]>(
            "/diction/sessions",
            { signal },
        );
    },

    createSession(data: CreateDictionSession) {
        return apiRequest<DictionSession>(
            "/diction/sessions",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
        );
    },
};
