import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { ReactNode } from "react";

import { useAuth } from "../auth/useAuth";

import {
    progressApi,
    type ProgressSummary,
} from "./api/progressApi";

import { ProgressContext } from "./progress-context";
import { PROGRESS_UPDATED_EVENT } from "./progressEvents";

type ProgressState = {
    userId: string | null;
    summary: ProgressSummary | null;
    loading: boolean;
    error: string | null;
};

type Props = {
    children: ReactNode;
};

export default function ProgressProvider({
                                             children,
                                         }: Props) {
    const { user, status } = useAuth();

    const userId =
        status === "ready" ? user?.id ?? null : null;

    const [state, setState] = useState<ProgressState>({
        userId: null,
        summary: null,
        loading: false,
        error: null,
    });

    const controllerRef = useRef<AbortController | null>(
        null,
    );

    const requestVersion = useRef(0);

    // Загрузка статистики
    const load = useCallback(async () => {
        // Отменяем предыдущий запрос
        controllerRef.current?.abort();

        const version = ++requestVersion.current;

        // Если пользователь не авторизован
        if (status !== "ready" || !userId) {
            return;
        }

        const controller = new AbortController();

        controllerRef.current = controller;

        return progressApi.getSummary(controller.signal).then((data) => {

            if (
                controller.signal.aborted ||
                version !== requestVersion.current
            ) {
                return;
            }

            setState({
                userId,
                summary: data,
                loading: false,
                error: null,
            });
        }).catch((error: unknown) => {
            if (
                controller.signal.aborted ||
                version !== requestVersion.current
            ) {
                return;
            }

            setState({
                userId,
                summary: null,
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Не удалось загрузить статистику",
            });
        });
    }, [userId, status]);

    const reload = useCallback(async () => {
        if (status !== "ready" || !userId) return;
        setState((previous) => ({
            userId,
            summary: previous.userId === userId ? previous.summary : null,
            loading: true,
            error: null,
        }));
        await load();
    }, [load, status, userId]);

    useEffect(() => {
        // Загружаем при входе или смене аккаунта
        void load();

        // Перезагружаем после новой тренировки
        function handleProgressUpdated() {
            void reload();
        }

        window.addEventListener(
            PROGRESS_UPDATED_EVENT,
            handleProgressUpdated,
        );

        return () => {
            window.removeEventListener(
                PROGRESS_UPDATED_EVENT,
                handleProgressUpdated,
            );

            controllerRef.current?.abort();
            requestVersion.current += 1;
        };
    }, [load, reload]);

    // Не показываем данные предыдущего аккаунта
    const belongsToCurrentUser =
        status === "ready" && state.userId === userId;

    const summary = belongsToCurrentUser
        ? state.summary
        : null;

    const loading =
        status === "loading" ||
        (status === "ready" &&
            Boolean(userId) &&
            (!belongsToCurrentUser || state.loading));

    const error =
        status === "error"
            ? "Не удалось проверить авторизацию"
            : belongsToCurrentUser
                ? state.error
                : null;

    const value = useMemo(
        () => ({
            summary,
            loading,
            error,
            reload,
        }),
        [summary, loading, error, reload],
    );

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
}
