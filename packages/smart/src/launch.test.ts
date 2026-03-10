import { describe, expect, it } from "vitest";
import { buildAuthorizationUrl } from "./launch.js";
import type { SmartClientConfig, SmartEndpoints } from "@digital-pews/types";

const endpoints: SmartEndpoints = {
  authorizationEndpoint: "https://auth.example.com/authorize",
  tokenEndpoint: "https://auth.example.com/token",
};

const standaloneConfig: SmartClientConfig = {
  clientId: "test-client",
  redirectUri: "https://app.example.com/redirect",
  scope: ["openid", "fhirUser", "launch/patient", "patient/*.read"],
  fhirBaseUrl: "https://fhir.example.com",
  launchMode: "standalone",
};

const ehrConfig: SmartClientConfig = {
  clientId: "test-client",
  redirectUri: "https://app.example.com/redirect",
  scope: ["openid", "fhirUser", "launch", "patient/*.read"],
  fhirBaseUrl: "https://fhir.example.com",
  launchMode: "ehr",
  launchToken: "opaque-ehr-token-123",
};

describe("buildAuthorizationUrl", () => {
  it("generates a valid standalone authorization URL", () => {
    const result = buildAuthorizationUrl(standaloneConfig, endpoints);

    const url = new URL(result.url);
    expect(url.origin + url.pathname).toBe("https://auth.example.com/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("test-client");
    expect(url.searchParams.get("redirect_uri")).toBe("https://app.example.com/redirect");
    expect(url.searchParams.get("aud")).toBe("https://fhir.example.com");
    expect(url.searchParams.get("state")).toBe(result.state);
    expect(url.searchParams.has("launch")).toBe(false);
  });

  it("includes launch token for EHR launch mode", () => {
    const result = buildAuthorizationUrl(ehrConfig, endpoints);

    const url = new URL(result.url);
    expect(url.searchParams.get("launch")).toBe("opaque-ehr-token-123");
  });

  it("throws if EHR launch mode is used without a launch token", () => {
    const badConfig: SmartClientConfig = {
      ...ehrConfig,
      launchToken: undefined,
    };

    expect(() => buildAuthorizationUrl(badConfig, endpoints)).toThrow(/launch token/i);
  });

  it("generates unique state per call", () => {
    const r1 = buildAuthorizationUrl(standaloneConfig, endpoints);
    const r2 = buildAuthorizationUrl(standaloneConfig, endpoints);
    expect(r1.state).not.toBe(r2.state);
  });

  it("encodes scopes as space-separated string", () => {
    const result = buildAuthorizationUrl(standaloneConfig, endpoints);
    const url = new URL(result.url);
    expect(url.searchParams.get("scope")).toBe("openid fhirUser launch/patient patient/*.read");
  });
});
