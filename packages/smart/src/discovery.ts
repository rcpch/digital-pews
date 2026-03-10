import { DomainError } from "@digital-pews/errors";
import type { SmartEndpoints } from "@digital-pews/types";

interface WellKnownResponse {
  authorization_endpoint?: string;
  token_endpoint?: string;
  registration_endpoint?: string;
  management_endpoint?: string;
  introspection_endpoint?: string;
  revocation_endpoint?: string;
}

interface CapabilityStatementSecurity {
  extension?: ReadonlyArray<{
    url?: string;
    extension?: ReadonlyArray<{
      url?: string;
      valueUri?: string;
    }>;
  }>;
}

interface CapabilityStatementRest {
  security?: CapabilityStatementSecurity;
}

interface CapabilityStatementResponse {
  rest?: ReadonlyArray<CapabilityStatementRest>;
}

const SMART_WELL_KNOWN_PATH = "/.well-known/smart-configuration";
const OAUTH_URIS_EXTENSION =
  "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris";

function normalizeBase(fhirBaseUrl: string): string {
  return fhirBaseUrl.endsWith("/") ? fhirBaseUrl.slice(0, -1) : fhirBaseUrl;
}

function parseWellKnown(body: WellKnownResponse): SmartEndpoints | undefined {
  if (!body.authorization_endpoint || !body.token_endpoint) {
    return undefined;
  }
  return {
    authorizationEndpoint: body.authorization_endpoint,
    tokenEndpoint: body.token_endpoint,
    registrationEndpoint: body.registration_endpoint,
    managementEndpoint: body.management_endpoint,
    introspectionEndpoint: body.introspection_endpoint,
    revocationEndpoint: body.revocation_endpoint,
  };
}

function parseCapabilityStatement(
  body: CapabilityStatementResponse
): SmartEndpoints | undefined {
  const restEntries = body.rest ?? [];
  for (const rest of restEntries) {
    const extensions = rest.security?.extension ?? [];
    for (const ext of extensions) {
      if (ext.url !== OAUTH_URIS_EXTENSION) {
        continue;
      }
      let authorizationEndpoint: string | undefined;
      let tokenEndpoint: string | undefined;
      for (const inner of ext.extension ?? []) {
        if (inner.url === "authorize") {
          authorizationEndpoint = inner.valueUri;
        }
        if (inner.url === "token") {
          tokenEndpoint = inner.valueUri;
        }
      }
      if (authorizationEndpoint && tokenEndpoint) {
        return { authorizationEndpoint, tokenEndpoint };
      }
    }
  }
  return undefined;
}

export type FetchFn = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export async function discoverSmartEndpoints(
  fhirBaseUrl: string,
  fetchFn: FetchFn = globalThis.fetch
): Promise<SmartEndpoints> {
  const base = normalizeBase(fhirBaseUrl);

  const wellKnownUrl = `${base}${SMART_WELL_KNOWN_PATH}`;
  try {
    const response = await fetchFn(wellKnownUrl);
    if (response.ok) {
      const body = (await response.json()) as WellKnownResponse;
      const endpoints = parseWellKnown(body);
      if (endpoints) {
        return endpoints;
      }
    }
  } catch {
    // .well-known not available — fall through to CapabilityStatement
  }

  const metadataUrl = `${base}/metadata`;
  try {
    const response = await fetchFn(metadataUrl);
    if (response.ok) {
      const body = (await response.json()) as CapabilityStatementResponse;
      const endpoints = parseCapabilityStatement(body);
      if (endpoints) {
        return endpoints;
      }
    }
  } catch {
    // CapabilityStatement also failed
  }

  throw new DomainError(
    "SMART_DISCOVERY_FAILED",
    `Could not discover SMART endpoints from ${base}. Tried .well-known/smart-configuration and /metadata.`
  );
}
