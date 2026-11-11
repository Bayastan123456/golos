import { Route, Routes } from "react-router";

import {
    ProtectedRoute,
    GuestRoute,
} from "../features/auth/AuthRoutes";

import DashboardPage from "../pages/DashboardPage";
import DictionPage from "../pages/DictionPage";
import SpeakingPage from "../pages/SpeakingPage";
import ProgressPage from "../pages/ProgressPage";
import SectionPage from "../pages/SectionPage";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import VocabularyPage from "../pages/Vocabulary.tsx";
import DashboardLayout from "../components /layout/DashboardLayout.tsx";
import AiCoachPage from "../pages/AiCoachPage.tsx";

export function AppRouter() {
    return (
        <Routes>
            {/* Публичные страницы */}
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Защищённые страницы */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<DashboardPage />} />

                    <Route
                        path="diction"
                        element={<DictionPage />}
                    />

                    <Route
                        path="vocabulary"
                        element={<VocabularyPage />}
                    />

                    <Route
                        path="speaking"
                        element={<SpeakingPage />}
                    />

                    <Route
                        path="progress"
                        element={<ProgressPage />}
                    />

                    <Route
                        path="ai-coach"
                        element={<AiCoachPage />}
                    />

                    <Route
                        path="*"
                        element={
                            <SectionPage title="Страница не найдена" />
                        }
                    />
                </Route>
            </Route>
        </Routes>
    );
}
