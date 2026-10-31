export const TOAST_EVENT = "pathme:toast";

/**
 * Fire a toast from any client component. The <Toaster /> mounted in the
 * site layout listens for this event, so no shared context is required.
 */
export function showToast(title, message) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { title, message } }));
}
