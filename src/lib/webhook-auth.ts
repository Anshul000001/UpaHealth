/**
 * Webhook authentication for external callers (n8n, cron services).
 *
 * External services can authenticate via:
 * 1. Bearer token in Authorization header (WEBHOOK_SECRET env var)
 * 2. ?token= query parameter
 *
 * Internal dashboard calls use NextAuth session (handled by requireAuth).
 */

export function verifyWebhookToken(request: Request): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true; // If no secret configured, allow (dev mode)

  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === secret) return true;
  }

  // Check query parameter
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken === secret) return true;

  return false;
}
