import crypto from "crypto";
import { prisma } from "../db";
import { getSession } from "../auth/session";

export interface ApiAuthContext {
  workspaceId: string;
  userId: string;
  authType: "api_key" | "session";
  apiKeyId?: string;
}

export async function generateApiKey(
  workspaceId: string,
  userId: string,
  label: string
): Promise<{ rawKey: string; keyId: string; prefix: string }> {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `vido_live_${randomBytes}`;
  const keyPrefix = `${rawKey.slice(0, 14)}...`;

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKeyRecord = await prisma.apiKey.create({
    data: {
      workspaceId,
      userId,
      label: label || "Default API Key",
      keyPrefix,
      keyHash,
    },
  });

  return {
    rawKey,
    keyId: apiKeyRecord.id,
    prefix: keyPrefix,
  };
}

export async function authenticateApiKey(request: Request): Promise<ApiAuthContext | null> {
  const authHeader =
    request.headers.get("x-api-key") ||
    request.headers.get("X-Api-Key") ||
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader) return null;

  let rawKey = authHeader.trim();
  if (rawKey.toLowerCase().startsWith("bearer ")) {
    rawKey = rawKey.slice(7).trim();
  }

  if (!rawKey.startsWith("vido_")) {
    return null;
  }

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { workspace: true, user: true },
  });

  if (!apiKey || apiKey.revokedAt) {
    return null;
  }

  // Update lastUsedAt asynchronously
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    workspaceId: apiKey.workspaceId,
    userId: apiKey.userId,
    authType: "api_key",
    apiKeyId: apiKey.id,
  };
}

export async function authenticateSessionOrApiKey(
  request: Request
): Promise<ApiAuthContext | null> {
  // 1. Try API Key
  const apiAuth = await authenticateApiKey(request);
  if (apiAuth) return apiAuth;

  // 2. Try Cookie Session
  const session = await getSession();
  if (session && session.userId && session.workspaceId) {
    return {
      workspaceId: session.workspaceId,
      userId: session.userId,
      authType: "session",
    };
  }

  return null;
}
