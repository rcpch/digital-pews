import { describe, expect, it } from "vitest";
import { handleRedirect, extractLaunchContext } from "./redirect.js";
import type { SmartClientConfig, SmartEndpoints } from "@digital-pews/types";
import type { FetchFn } from "./redirect.js";

const config: SmartClientConfig = {
  clientId: "test-client",
  redirectUri: "https://app.example.com/redirect",
  scope: ["openid", "fhirUser", "launch/patient"],
  fhirBaseUrl: "https://fhir.example.com",
  launchMode: "standalone",
};

const endpoints: SmartEndpoints = {
  authorizationEndpoint: "https://auth.example.com/authorize",
  tokenEndpoint: "https://auth.example.com/token",
};

function mockTokenFetch(responseBody: unknown, status = 200): FetchFn {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => responseBody,
  });
}

describe("handleRedirect", () => {
  it("exchanges code for token and returns session", async () => {
    const tokenBody = {
      access_token: "access-abc",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid fhirUser launch/patient patient/*.read",
      patient: "Patient/123",
    };

    const session = await handleRedirect(
      "https://app.example.com/redirect?code=auth-code-xyz&state=expected-state",
      "expected-state",
      config,
      endpoints,
      mockTokenFetch(tokenBody)
    );

    expect(session.tokenResponse.accessToken).toBe("access-abc");
    expect(session.tokenResponse.tokenType).toBe("Bearer");
    expect(session.tokenResponse.expiresIn).toBe(3600);
    expect(session.launchContext.patient).toBe("Patient/123");
    expect(session.launchMode).toBe("standalone");
    expect(session.fhirBaseUrl).toBe("https://fhir.example.com");
  });

  it("throws on state mismatch", async () => {
    await expect(
      handleRedirect(
        "https://app.example.com/redirect?code=auth-code-xyz&state=wrong-state",
        "expected-state",
        config,
        endpoints,
        mockTokenFetch({})
      )
    ).rejects.toThrow(/state/i);
  });

  it("throws on missing authorization code", async () => {
    await expect(
      handleRedirect(
        "https://app.example.com/redirect?state=expected-state",
        "expected-state",
        config,
        endpoints,
        mockTokenFetch({})
      )
    ).rejects.toThrow(/missing.*code/i);
  });

  it("throws when authorization server returns error", async () => {
    await expect(
      handleRedirect(
        "https://app.example.com/redirect?error=access_denied&error_description=User+denied",
        "expected-state",
        config,
        endpoints,
        mockTokenFetch({})
      )
    ).rejects.toThrow(/User denied/);
  });

  it("throws when token exchange returns non-200", async () => {
    await expect(
      handleRedirect(
        "https://app.example.com/redirect?code=auth-code-xyz&state=expected-state",
        "expected-state",
        config,
        endpoints,
        mockTokenFetch({}, 401)
      )
    ).rejects.toThrow(/token exchange failed/i);
  });
});

describe("extractLaunchContext", () => {
  it("extracts patient and encounter from token body", () => {
    const ctx = extractLaunchContext({
      access_token: "x",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid",
      patient: "Patient/456",
      encounter: "Encounter/789",
    });

    expect(ctx.patient).toBe("Patient/456");
    expect(ctx.encounter).toBe("Encounter/789");
  });

  it("extracts practitioner from fhirUser claim", () => {
    const ctx = extractLaunchContext(
      { access_token: "x", token_type: "Bearer", expires_in: 3600, scope: "openid" },
      { fhirUser: "https://fhir.example.com/Practitioner/abc" }
    );

    expect(ctx.fhirUser).toBe("https://fhir.example.com/Practitioner/abc");
    expect(ctx.practitioner).toBe("abc");
  });

  it("returns empty context when no launch params present", () => {
    const ctx = extractLaunchContext({
      access_token: "x",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid",
    });

    expect(ctx.patient).toBeUndefined();
    expect(ctx.encounter).toBeUndefined();
    expect(ctx.practitioner).toBeUndefined();
  });
});
