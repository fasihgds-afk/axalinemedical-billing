/**
 * UploadThing v7 uses a single UPLOADTHING_TOKEN (base64 JSON).
 * Also supports legacy UPLOADTHING_SECRET + UPLOADTHING_APP_ID from the dashboard.
 */

function stripEnvQuotes(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function buildTokenFromSecretAndAppId(apiKey, appId, region) {
  const payload = {
    apiKey,
    appId,
    regions: [region],
    ingestHost: "ingest.uploadthing.com",
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/** Call once at startup so uploadthing/server reads the token */
export function ensureUploadthingToken() {
  const existing = stripEnvQuotes(process.env.UPLOADTHING_TOKEN);
  if (existing) {
    process.env.UPLOADTHING_TOKEN = existing;
    return existing;
  }

  const secret =
    stripEnvQuotes(process.env.UPLOADTHING_SECRET) ||
    stripEnvQuotes(process.env.UPLOADTHING_API_KEY);
  const appId = stripEnvQuotes(process.env.UPLOADTHING_APP_ID);

  if (!secret || !appId) {
    return null;
  }

  const region =
    stripEnvQuotes(process.env.UPLOADTHING_REGION) || "sea1";

  const token = buildTokenFromSecretAndAppId(secret, appId, region);
  process.env.UPLOADTHING_TOKEN = token;
  return token;
}

export function isUploadthingConfigured() {
  return Boolean(ensureUploadthingToken());
}
