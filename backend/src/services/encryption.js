const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  // Derive a 32-byte key from the env var (supports both hex and plain strings)
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  // Stretch to 32 bytes using SHA-256
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns null (graceful skip) if ENCRYPTION_KEY is not set.
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex).
 */
function encrypt(plaintext) {
  if (!plaintext) return plaintext;
  const key = getKey();
  if (!key) throw new Error('ENCRYPTION_KEY is required; refusing to persist plaintext financial data');

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a value previously encrypted by encrypt().
 * Returns the original value untouched if it was not encrypted or key is not set.
 */
function decrypt(value) {
  if (!value || !String(value).startsWith('enc:')) return value;
  const key = getKey();
  if (!key) throw new Error('ENCRYPTION_KEY is required to decrypt financial data');

  try {
    const parts = String(value).split(':');
    // parts: ['enc', iv, authTag, ciphertext]
    if (parts.length !== 4) throw new Error('Invalid encrypted format');
    const [, ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('[encryption] Decryption failed:', err.message);
    return value;
  }
}

/**
 * Encrypt only the specified fields in an object.
 * Gracefully skips if ENCRYPTION_KEY is missing.
 */
function encryptFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] != null) {
      result[field] = encrypt(String(result[field]));
    }
  }
  return result;
}

/**
 * Decrypt only the specified fields in an object.
 */
function decryptFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] != null) {
      result[field] = decrypt(String(result[field]));
    }
  }
  return result;
}

module.exports = { encrypt, decrypt, encryptFields, decryptFields };
