import React from "react"
import ReactDOM from "react-dom/client";
import App from "./app/App.tsx";
import ThemeProvider from "./features/theme/ThemeProvider.tsx";

import "./styles/globals.css"

ReactDOM.createRoot(
    document.getElementById("root")!
).render(
    <React.StrictMode>
        <ThemeProvider>
            <App/>
        </ThemeProvider>
    </React.StrictMode>
)
