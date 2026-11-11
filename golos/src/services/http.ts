const API_URL =
    import.meta.env.VITE_API_URL ??
    (import.meta.env.PROD ? "/api" : "http://localhost:3000/api");

export class HttpError extends Error {
    public readonly status: number;

    constructor(message: string, status: number) {
        super(message);

        this.name = "HttpError";
        this.status = status;
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    if (!response.ok) {
        const data: unknown = await response
            .json()
            .catch(() => null);

        let message = `HTTP Error ${response.status}`;

        if (data && typeof data === "object" && "message" in data) {
            const detail = data.message;

            if (typeof detail === "string") {
                message = detail;
            } else if (Array.isArray(detail)) {
                message = detail
                    .filter(
                        (item): item is string =>
                            typeof item === "string",
                    )
                    .join(". ");
            }
        }

        throw new HttpError(message, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
