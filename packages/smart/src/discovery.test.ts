import { describe, expect, it } from "vitest";
import { discoverSmartEndpoints } from "./discovery.js";
import type { FetchFn } from "./discovery.js";

function mockFetch(routes: Record<string, unknown>): FetchFn {
  return async (url: string) => {
    const body = routes[url];
    if (body === undefined) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => body };
  };
}

describe("discoverSmartEndpoints", () => {
  it("discovers endpoints from .well-known/smart-configuration", async () => {
    const fetch = mockFetch({
      "https://fhir.example.com/.well-known/smart-configuration": {
        authorization_endpoint: "https://auth.example.com/authorize",
        token_endpoint: "https://auth.example.com/token",
      },
    });

    const result = await discoverSmartEndpoints("https://fhir.example.com", fetch);

    expect(result.authorizationEndpoint).toBe("https://auth.example.com/authorize");
    expect(result.tokenEndpoint).toBe("https://auth.example.com/token");
  });

  it("strips trailing slash from base URL", async () => {
    const fetch = mockFetch({
      "https://fhir.example.com/.well-known/smart-configuration": {
        authorization_endpoint: "https://auth.example.com/authorize",
        token_endpoint: "https://auth.example.com/token",
      },
    });

    const result = await discoverSmartEndpoints("https://fhir.example.com/", fetch);

    expect(result.authorizationEndpoint).toBe("https://auth.example.com/authorize");
  });

  it("falls back to CapabilityStatement /metadata when .well-known fails", async () => {
    const fetch = mockFetch({
      "https://fhir.example.com/metadata": {
        rest: [
          {
            security: {
              extension: [
                {
                  url: "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris",
                  extension: [
                    { url: "authorize", valueUri: "https://auth.example.com/authorize" },
                    { url: "token", valueUri: "https://auth.example.com/token" },
                  ],
                },
              ],
            },
          },
        ],
      },
    });

    const result = await discoverSmartEndpoints("https://fhir.example.com", fetch);

    expect(result.authorizationEndpoint).toBe("https://auth.example.com/authorize");
    expect(result.tokenEndpoint).toBe("https://auth.example.com/token");
  });

  it("throws when neither discovery method yields endpoints", async () => {
    const fetch = mockFetch({});

    await expect(
      discoverSmartEndpoints("https://fhir.example.com", fetch)
    ).rejects.toThrow(/Could not discover SMART endpoints/);
  });

  it("includes optional endpoints from .well-known", async () => {
    const fetch = mockFetch({
      "https://fhir.example.com/.well-known/smart-configuration": {
        authorization_endpoint: "https://auth.example.com/authorize",
        token_endpoint: "https://auth.example.com/token",
        revocation_endpoint: "https://auth.example.com/revoke",
        introspection_endpoint: "https://auth.example.com/introspect",
      },
    });

    const result = await discoverSmartEndpoints("https://fhir.example.com", fetch);

    expect(result.revocationEndpoint).toBe("https://auth.example.com/revoke");
    expect(result.introspectionEndpoint).toBe("https://auth.example.com/introspect");
  });
});
