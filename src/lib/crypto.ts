import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Deriva uma chave AES-256 a partir da MASTER_KEY (environment variable).
 * Se a MASTER_KEY tiver 64 caracteres hex, usa diretamente como 32 bytes.
 * Caso contrário, faz hash SHA-256 para obter 32 bytes.
 */
function getMasterKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY || process.env.MASTER_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY não definida. Gere uma com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }

  // If it's a 64-char hex string, use directly
  if (/^[0-9a-f]{64}$/i.test(raw)) {
    return Buffer.from(raw, 'hex');
  }

  // Otherwise, derive via SHA-256
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Criptografa um texto plano usando AES-256-GCM.
 * Retorna formato: iv:authTag:ciphertext (tudo em hex)
 *
 * @example
 *   const encrypted = encrypt('GAME-KEY-XXXX-XXXX');
 *   // "a1b2...:e3f4...:c5d6..."
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Descriptografa um texto cifrado no formato iv:authTag:ciphertext.
 *
 * @example
 *   const plain = decrypt('a1b2...:e3f4...:c5d6...');
 *   // "GAME-KEY-XXXX-XXXX"
 */
export function decrypt(ciphertext: string): string {
  const key = getMasterKey();
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('Formato inválido. Esperado iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Gera uma nova chave mestra aleatória (útil para setup).
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
