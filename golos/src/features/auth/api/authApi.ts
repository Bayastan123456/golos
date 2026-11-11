import type {
    AuthResponse,
    AuthUser,
    RegisterData,
} from "../types";

import { apiRequest } from "../../../services/http";

// Сохраняем совместимость с AuthProvider
export { HttpError as ApiError } from "../../../services/http";

export const authApi = {
    // Регистрация
    register(data: RegisterData) {
        return apiRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    // Авторизация
    login(email: string, password: string) {
        return apiRequest<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
            }),
        });
    },

    // Получение текущего пользователя
    me(signal?: AbortSignal) {
        return apiRequest<AuthUser>("/auth/me", {
            signal,
        });
    },

    // Выход
    logout() {
        return apiRequest<void>("/auth/logout", {
            method: "POST",
        });
    },
};
