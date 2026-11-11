export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse {
    user: AuthUser;
}

export type AuthStatus = "loading" | "ready" | "error";
