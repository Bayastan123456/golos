const API_URL =
    import.meta.env.VITE_API_URL ??
    (import.meta.env.PROD ? "/api" : "http://localhost:3000/api");

export async function checkBackend(
    signal?: AbortSignal
): Promise<boolean> {
    const response = await fetch(`${API_URL}/health`, {
        signal,
    });

    if (!response.ok) {
        throw new Error("Backend unavailable");
    }

    const data: unknown = await response.json();

    return (
        typeof data === "object" &&
        data !== null &&
        "status" in data &&
        data.status === "ok"
    );
}
