/**
 * Sends a Google Analytics 4 event from the browser, if the tag is on the page (production website only).
 * Never send personal details (names, phones, emails): only what kind of lead it was and its value.
 */
type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}
