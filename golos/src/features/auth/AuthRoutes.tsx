import { Navigate, Outlet } from "react-router";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
    const { user, status, refreshSession } = useAuth();

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FD] dark:bg-[#0B0D17]">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                    Проверяем авторизацию...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F9FD] px-5 text-center dark:bg-[#0B0D17]">
                <h2 className="text-xl font-bold">
                    Не удалось связаться с сервером
                </h2>

                <button
                    type="button"
                    onClick={() => void refreshSession()}
                    className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"
                >
                    Повторить попытку
                </button>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export function GuestRoute() {
    const { user, status } = useAuth();

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Проверяем авторизацию...
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
