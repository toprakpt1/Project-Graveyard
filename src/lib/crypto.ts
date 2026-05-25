import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12

export function encryptSecret(value: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".")
}

export function decryptSecret(value: string): string {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".")

  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Stored token is not readable.")
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivRaw, "base64url")
  )

  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"))

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}

function getKey(): Buffer {
  const secret = process.env.GITHUB_TOKEN_ENCRYPTION_KEY

  if (!secret || secret.length < 32) {
    throw new Error(
      "GITHUB_TOKEN_ENCRYPTION_KEY must be set to a 32+ character server-only secret."
    )
  }

  return createHash("sha256").update(secret).digest()
}
