/** Only allow same-site relative paths (blocks open-redirect via ?redirect=https://evil.com). */
export function safeRedirectPath(input: string | null | undefined, fallback = "/dashboard"): string {
  if (!input) return fallback;
  if (!input.startsWith("/") || input.startsWith("//") || input.startsWith("/\\")) return fallback;
  return input;
}
