import { redirect } from "next/navigation";

const publicMessages: Record<string, string> = {
  validation: "The form is missing required information or contains too much text.",
  budget: "This run exceeds one of the configured budget or token limits.",
  rate_limit: "Too many requests. Wait a minute and try again.",
  workflow: "The workflow failed before a report could be created.",
  not_found: "The requested run could not be found.",
};

export function redirectToError(code: keyof typeof publicMessages, detail?: string): never {
  const params = new URLSearchParams({ code, message: publicMessages[code] });
  if (detail) {
    params.set("detail", detail.slice(0, 180));
  }
  redirect(`/error?${params.toString()}`);
}
