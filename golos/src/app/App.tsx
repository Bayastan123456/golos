import { BrowserRouter } from "react-router";

import AuthProvider from "../features/auth/authProvider.tsx";
import ProgressProvider from "../features/progress/ProgressProvider.tsx";

import { AppRouter } from "./router";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ProgressProvider>
                    <AppRouter />
                </ProgressProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
