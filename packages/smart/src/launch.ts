import { DomainError } from "@digital-pews/errors";
import type { SmartClientConfig, SmartEndpoints } from "@digital-pews/types";

function generateRandomState(length: number): string {
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface AuthorizationUrlResult {
  url: string;
  state: string;
}

export function buildAuthorizationUrl(
  config: SmartClientConfig,
  endpoints: SmartEndpoints
): AuthorizationUrlResult {
  if (config.launchMode === "ehr" && !config.launchToken) {
    throw new DomainError(
      "LAUNCH_TOKEN_REQUIRED",
      "EHR launch mode requires a launch token from the EHR system"
    );
  }

  const state = generateRandomState(32);

  const params = new URLSearchParams();
  params.set("response_type", "code");
  params.set("client_id", config.clientId);
  params.set("redirect_uri", config.redirectUri);
  params.set("scope", config.scope.join(" "));
  params.set("state", state);
  params.set("aud", config.fhirBaseUrl);

  if (config.launchMode === "ehr" && config.launchToken) {
    params.set("launch", config.launchToken);
  }

  const url = `${endpoints.authorizationEndpoint}?${params.toString()}`;

  return { url, state };
}
