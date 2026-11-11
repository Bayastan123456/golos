export const PROGRESS_UPDATED_EVENT =
    "golos:progress-updated";

export function notifyProgressUpdated() {
    window.dispatchEvent(
        new Event(PROGRESS_UPDATED_EVENT),
    );
}