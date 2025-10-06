import crypto from 'crypto';

const keyB64 = process.env.ENCRYPTION_KEY_BASE64 || '';

export function encryptMaybe(plaintext: string) {
  if (!keyB64) return null;
  const key = Buffer.from(keyB64, 'base64');
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY_BASE64 must be 32 bytes base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}
