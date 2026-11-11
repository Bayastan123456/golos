import { createContext } from "react";
import type {
    AuthStatus,
    AuthUser,
    RegisterData,
} from "./types";

export interface AuthContextValue {
    user: AuthUser | null;
    status: AuthStatus;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

export const AuthContext =
    createContext<AuthContextValue | null>(null);
