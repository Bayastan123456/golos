import { useEffect, useState } from "react";
import { checkBackend } from "../../services/api";

type Status = "loading" | "online" | "offline";

export default function BackendStatus() {
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        const controller = new AbortController();

        checkBackend(controller.signal)
            .then((online) => {
                setStatus(online ? "online" : "offline");
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setStatus("offline");
                }
            });

        return () => controller.abort();
    }, []);

    const labels = {
        loading: "Проверяем сервер...",
        online: "Сервер подключён",
        offline: "Сервер недоступен",
    };

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span
          className={`h-2.5 w-2.5 rounded-full ${
              status === "online"
                  ? "bg-emerald-500"
                  : status === "offline"
                      ? "bg-red-500"
                      : "bg-amber-400"
          }`}
      />

            {labels[status]}
        </div>
    );
}
