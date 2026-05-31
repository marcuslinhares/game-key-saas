import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, generateMasterKey } from './crypto';

describe('AES-256-GCM Crypto Module', () => {
  const testKey = generateMasterKey();

  beforeAll(() => {
    // Set encryption key for tests
    process.env.ENCRYPTION_KEY = testKey;
  });

  it('deve criptografar e descriptografar uma chave corretamente', () => {
    const originalKey = 'GAME-KEY-XXXX-YYYY-ZZZZ';
    const encrypted = encrypt(originalKey);

    // Verificar formato iv:authTag:ciphertext
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3);

    // iv deve ser 32 caracteres hex (16 bytes)
    expect(parts[0]).toHaveLength(32);
    // authTag deve ser 32 caracteres hex (16 bytes)
    expect(parts[1]).toHaveLength(32);

    // Descriptografar e verificar
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalKey);
  });

  it('deve produzir ciphertext diferente para mesma chave (IV aleatório)', () => {
    const originalKey = 'TEST-KEY-123';
    const encrypted1 = encrypt(originalKey);
    const encrypted2 = encrypt(originalKey);

    // IVs diferentes -> ciphertexts diferentes
    expect(encrypted1).not.toBe(encrypted2);

    // Mas ambos descriptografam para o mesmo valor
    expect(decrypt(encrypted1)).toBe(originalKey);
    expect(decrypt(encrypted2)).toBe(originalKey);
  });

  it('deve rejeitar formato inválido', () => {
    expect(() => decrypt('invalid-format')).toThrow('Formato inválido');
    expect(() => decrypt('abc:def')).toThrow('Formato inválido');
  });

  it('deve rejeitar ciphertext adulterado', () => {
    const encrypted = encrypt('GAME-KEY-123');
    const parts = encrypted.split(':');

    // Adulterar o ciphertext
    const tampered = `${parts[0]}:${parts[1]}:ff${parts[2].slice(2)}`;
    expect(() => decrypt(tampered)).toThrow();
  });

  it('deve gerar chave mestra de 64 caracteres hex', () => {
    const key = generateMasterKey();
    expect(key).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/i.test(key)).toBe(true);
  });

  it('deve falhar se ENCRYPTION_KEY não estiver definida', () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;

    expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY não definida');

    process.env.ENCRYPTION_KEY = originalKey;
  });
});
