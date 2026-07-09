import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

/**
 * API keys for third-party AI providers are stored encrypted at rest.
 *
 * The encryption key is derived from `AI_SETTINGS_SECRET` when present, and
 * otherwise from `DATABASE_URL` so the value stays stable across restarts of a
 * given deployment without any extra configuration. Set `AI_SETTINGS_SECRET`
 * in production to decouple the encryption key from the database credentials.
 */
const SECRET_SOURCE =
  process.env.AI_SETTINGS_SECRET ??
  process.env.DATABASE_URL ??
  "genshin-material-tracker-ai-settings-fallback";

const ENCRYPTION_KEY = createHash("sha256").update(SECRET_SOURCE).digest();
const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return (
    PREFIX +
    [
      iv.toString("base64"),
      authTag.toString("base64"),
      encrypted.toString("base64"),
    ].join(".")
  );
}

export function decryptSecret(
  stored: string | null | undefined,
): string | null {
  if (!stored) {
    return null;
  }

  // Support values written before encryption was introduced.
  if (!stored.startsWith(PREFIX)) {
    return stored;
  }

  try {
    const [ivPart, tagPart, dataPart] = stored.slice(PREFIX.length).split(".");
    const iv = Buffer.from(ivPart, "base64");
    const authTag = Buffer.from(tagPart, "base64");
    const data = Buffer.from(dataPart, "base64");

    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      "utf8",
    );
  } catch (error) {
    console.error("Failed to decrypt stored AI API key", error);
    return null;
  }
}

/**
 * Produces a display-safe preview of a secret, e.g. `sk-1234••••••7890`.
 */
export function maskSecret(secret: string | null | undefined): string | null {
  if (!secret) {
    return null;
  }

  if (secret.length <= 8) {
    return "••••••••";
  }

  return `${secret.slice(0, 4)}••••••${secret.slice(-4)}`;
}
