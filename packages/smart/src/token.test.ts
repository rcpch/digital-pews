import { describe, expect, it } from "vitest";
import { isTokenExpired, buildRefreshRequest } from "./token.js";
import type { SmartTokenResponse } from "@digital-pews/types";

function makeToken(overrides?: Partial<SmartTokenResponse>): SmartTokenResponse {
  return {
    accessToken: "access-token-xyz",
    tokenType: "Bearer",
    expiresIn: 3600,
    scope: "openid fhirUser",
    issuedAt: Date.now(),
    ...overrides,
  };
}

describe("isTokenExpired", () => {
  it("returns false for a freshly-issued token", () => {
    const token = makeToken({ issuedAt: Date.now() });
    expect(isTokenExpired(token)).toBe(false);
  });

  it("returns true when token has expired", () => {
    const oneHourAgo = Date.now() - 3600 * 1000;
    const token = makeToken({ issuedAt: oneHourAgo, expiresIn: 3600 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns true within the 60-second safety margin", () => {
    const almostExpired = Date.now() - (3600 * 1000 - 30_000);
    const token = makeToken({ issuedAt: almostExpired, expiresIn: 3600 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns false when still outside the safety margin", () => {
    const notYetExpired = Date.now() - (3600 * 1000 - 120_000);
    const token = makeToken({ issuedAt: notYetExpired, expiresIn: 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });
});

describe("buildRefreshRequest", () => {
  it("builds a valid refresh request", () => {
    const token = makeToken({ refreshToken: "refresh-abc" });
    const req = buildRefreshRequest("https://auth.example.com/token", "my-client", token);

    expect(req.tokenEndpoint).toBe("https://auth.example.com/token");
    expect(req.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");

    const params = new URLSearchParams(req.body);
    expect(params.get("grant_type")).toBe("refresh_token");
    expect(params.get("refresh_token")).toBe("refresh-abc");
    expect(params.get("client_id")).toBe("my-client");
  });

  it("throws when no refresh token is available", () => {
    const token = makeToken();
    expect(() =>
      buildRefreshRequest("https://auth.example.com/token", "my-client", token)
    ).toThrow(/no refresh token/i);
  });
});
