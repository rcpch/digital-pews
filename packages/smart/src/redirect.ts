import { DomainError } from "@digital-pews/errors";
import type {
  SmartClientConfig,
  SmartEndpoints,
  SmartLaunchContext,
  SmartSession,
  SmartTokenResponse,
} from "@digital-pews/types";

interface TokenEndpointResponseBody {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
  patient?: string;
  encounter?: string;
}

export type FetchFn = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string }
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

function parseTokenResponse(body: TokenEndpointResponseBody): SmartTokenResponse {
  return {
    accessToken: body.access_token,
    tokenType: body.token_type,
    expiresIn: body.expires_in,
    scope: body.scope,
    refreshToken: body.refresh_token,
    idToken: body.id_token,
    issuedAt: Date.now(),
  };
}

export function extractLaunchContext(
  tokenBody: TokenEndpointResponseBody,
  idTokenClaims?: { fhirUser?: string; practitioner?: string }
): SmartLaunchContext {
  const ctx: SmartLaunchContext = {};

  if (tokenBody.patient) {
    ctx.patient = tokenBody.patient;
  }
  if (tokenBody.encounter) {
    ctx.encounter = tokenBody.encounter;
  }
  if (idTokenClaims?.fhirUser) {
    ctx.fhirUser = idTokenClaims.fhirUser;
    if (idTokenClaims.fhirUser.includes("Practitioner/")) {
      const parts = idTokenClaims.fhirUser.split("Practitioner/");
      const practitionerId = parts[1];
      if (practitionerId) {
        ctx.practitioner = practitionerId;
      }
    }
  }
  if (idTokenClaims?.practitioner) {
    ctx.practitioner = idTokenClaims.practitioner;
  }

  return ctx;
}

export async function handleRedirect(
  redirectUrl: string,
  expectedState: string,
  config: SmartClientConfig,
  endpoints: SmartEndpoints,
  fetchFn: FetchFn = globalThis.fetch as unknown as FetchFn
): Promise<SmartSession> {
  const url = new URL(redirectUrl);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const desc = url.searchParams.get("error_description") ?? error;
    throw new DomainError("SMART_AUTH_ERROR", `Authorization server returned error: ${desc}`);
  }

  if (!code) {
    throw new DomainError("SMART_MISSING_CODE", "Redirect URL is missing the authorization code");
  }

  if (state !== expectedState) {
    throw new DomainError(
      "SMART_STATE_MISMATCH",
      "State parameter mismatch — possible CSRF attack"
    );
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", config.redirectUri);
  body.set("client_id", config.clientId);

  const response = await fetchFn(endpoints.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new DomainError(
      "SMART_TOKEN_EXCHANGE_FAILED",
      `Token exchange failed with status ${response.status}`
    );
  }

  const tokenBody = (await response.json()) as TokenEndpointResponseBody;
  const tokenResponse = parseTokenResponse(tokenBody);
  const launchContext = extractLaunchContext(tokenBody);

  return {
    fhirBaseUrl: config.fhirBaseUrl,
    tokenResponse,
    launchContext,
    launchMode: config.launchMode,
  };
}
