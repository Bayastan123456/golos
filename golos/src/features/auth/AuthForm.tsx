import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
    AudioLines,
    ArrowRight,
    LoaderCircle,
} from "lucide-react";

import { useAuth } from "./useAuth";

type AuthFormProps = {
    mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
    const isRegister = mode === "register";
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        if (loading) return;

        setError("");

        if (isRegister && password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);

        try {
            if (isRegister) {
                await register({
                    name: name.trim() || undefined,
                    email,
                    password,
                });
            } else {
                await login(email, password);
            }

            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Произошла ошибка. Попробуй ещё раз.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F8F9FD] px-4 py-10 text-[#20243A] dark:bg-[#0B0D17] dark:text-white">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link
                    to="/"
                    className="mb-8 flex items-center justify-center gap-3"
                >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
            <AudioLines size={23} />
          </span>

                    <span className="text-3xl font-bold tracking-tight">
            голос<span className="text-violet-600">.</span>
          </span>
                </Link>

                {/* Form */}
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#151725] sm:p-8">
                    <h1 className="text-center text-2xl font-bold">
                        {isRegister
                            ? "Создать аккаунт"
                            : "С возвращением!"}
                    </h1>

                    <p className="mt-3 text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {isRegister
                            ? "Начни развивать свою речь каждый день."
                            : "Войди, чтобы продолжить тренировки."}
                    </p>

                    <form
                        onSubmit={(event) => void handleSubmit(event)}
                        className="mt-8 space-y-5"
                    >
                        {isRegister && (
                            <div>
                                <label
                                    htmlFor="auth-name"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Твоё имя
                                </label>

                                <input
                                    id="auth-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    maxLength={80}
                                    autoComplete="name"
                                    placeholder="Как тебя зовут?"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#10121E] dark:text-white"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="auth-email"
                                className="mb-2 block text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="auth-email"
                                type="email"
                                required
                                maxLength={254}
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="example@gmail.com"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#10121E] dark:text-white"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="auth-password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Пароль
                            </label>

                            <input
                                id="auth-password"
                                type="password"
                                required
                                minLength={isRegister ? 12 : undefined}
                                autoComplete={
                                    isRegister
                                        ? "new-password"
                                        : "current-password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Введи пароль"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#10121E] dark:text-white"
                            />

                            {isRegister && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Минимум 12 символов.
                                </p>
                            )}
                        </div>

                        {isRegister && (
                            <div>
                                <label
                                    htmlFor="auth-confirm"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    Повтори пароль
                                </label>

                                <input
                                    id="auth-confirm"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Повтори пароль"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#10121E] dark:text-white"
                                />
                            </div>
                        )}

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <LoaderCircle
                                    size={19}
                                    className="animate-spin"
                                />
                            ) : (
                                <>
                                    {isRegister
                                        ? "Зарегистрироваться"
                                        : "Войти"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isRegister
                            ? "Уже есть аккаунт?"
                            : "Ещё нет аккаунта?"}{" "}
                        <Link
                            to={isRegister ? "/login" : "/register"}
                            className="font-semibold text-violet-600 hover:underline dark:text-violet-300"
                        >
                            {isRegister ? "Войти" : "Регистрация"}
                        </Link>
                    </p>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Развивай дикцию, словарный запас и уверенную речь.
                </p>
            </div>
        </main>
    );
}
