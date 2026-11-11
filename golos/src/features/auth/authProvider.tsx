import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./auth-context";
import { authApi, ApiError } from "./api/authApi";
import type {
    AuthStatus,
    AuthUser,
    RegisterData,
} from "./types";

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({
                                         children,
                                     }: AuthProviderProps) {
    const requestVersion = useRef(0);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [status, setStatus] =
        useState<AuthStatus>("loading");

    const refresh = useCallback(
        async (signal?: AbortSignal) => {
            const version = ++requestVersion.current;
            return authApi.me(signal).then((profile) => {

                if (signal?.aborted || version !== requestVersion.current) return;

                setUser(profile);
                setStatus("ready");
            }).catch((error: unknown) => {
                if (signal?.aborted || version !== requestVersion.current) return;

                if (error instanceof ApiError && error.status === 401) {
                    setUser(null);
                    setStatus("ready");
                } else {
                    setStatus("error");
                }
            });
        },
        [],
    );

    useEffect(() => {
        const controller = new AbortController();

        void refresh(controller.signal);

        return () => controller.abort();
    }, [refresh]);

    async function login(email: string, password: string) {
        const version = ++requestVersion.current;
        const response = await authApi.login(email, password);
        if (version !== requestVersion.current) return;
        setUser(response.user);
        setStatus("ready");
    }

    async function register(data: RegisterData) {
        const version = ++requestVersion.current;
        const response = await authApi.register(data);
        if (version !== requestVersion.current) return;
        setUser(response.user);
        setStatus("ready");
    }

    async function logout() {
        const version = ++requestVersion.current;
        await authApi.logout();
        if (version !== requestVersion.current) return;
        setUser(null);
        setStatus("ready");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                status,
                login,
                register,
                logout,
                refreshSession: () => {
                    setStatus("loading");
                    return refresh();
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
