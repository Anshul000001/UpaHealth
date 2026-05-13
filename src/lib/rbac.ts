import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type Permission = "read" | "write" | "delete" | "admin";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ["read", "write", "delete", "admin"],
  SALES_USER: ["read", "write"],
  VIEWER: ["read"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Use in API route handlers to get session + enforce permission */
export async function requireAuth(permission: Permission = "read") {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if (!hasPermission(session.user.role, permission)) throw new ForbiddenError();
  return session;
}

/** Wraps an API handler with standard error handling */
export function apiHandler(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: err.message } }, { status: 401 });
      }
      if (err instanceof ForbiddenError) {
        return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: err.message } }, { status: 403 });
      }
      console.error("[API Error]", err);
      return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
    }
  };
}
