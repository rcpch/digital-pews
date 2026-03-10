import { DomainError } from "@digital-pews/errors";
import type { SmartTokenResponse } from "@digital-pews/types";

const EXPIRY_SAFETY_MARGIN_MS = 60_000;

export function isTokenExpired(token: SmartTokenResponse, nowMs: number = Date.now()): boolean {
  const expiresAtMs = token.issuedAt + token.expiresIn * 1000;
  return nowMs >= expiresAtMs - EXPIRY_SAFETY_MARGIN_MS;
}

export interface RefreshRequest {
  tokenEndpoint: string;
  body: string;
  headers: Record<string, string>;
}

export function buildRefreshRequest(
  tokenEndpoint: string,
  clientId: string,
  token: SmartTokenResponse
): RefreshRequest {
  if (!token.refreshToken) {
    throw new DomainError(
      "NO_REFRESH_TOKEN",
      "Cannot refresh — no refresh token is available in this session"
    );
  }

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", token.refreshToken);
  params.set("client_id", clientId);

  return {
    tokenEndpoint,
    body: params.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  };
}
