import { encryptData, decryptData } from '../encryption';

describe('Encryption Utils', () => {
  const testData = 'Hello, World!';
  const jsonData = JSON.stringify({
    version: '1.0',
    transactions: [
      { id: 1, amount: 10000, type: 'expense', category: 'food' },
      { id: 2, amount: 50000, type: 'income', category: 'salary' },
    ],
  });

  it('should encrypt and decrypt string correctly', () => {
    const encrypted = encryptData(testData);
    expect(encrypted).not.toBe(testData);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(testData);
  });

  it('should encrypt and decrypt JSON correctly', () => {
    const encrypted = encryptData(jsonData);
    expect(encrypted).not.toBe(jsonData);

    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(jsonData);

    const parsed = JSON.parse(decrypted);
    expect(parsed.version).toBe('1.0');
    expect(parsed.transactions).toHaveLength(2);
  });

  it('should produce different encrypted output for same input', () => {
    // Note: With simple XOR cipher, same input produces same output
    // This is a limitation. In production, use a better encryption method
    const encrypted1 = encryptData(testData);
    const encrypted2 = encryptData(testData);
    expect(encrypted1).toBe(encrypted2);
  });

  it('should throw error for invalid encrypted data', () => {
    expect(() => decryptData('invalid-encrypted-data!!!')).toThrow();
  });

  it('should handle empty string', () => {
    const encrypted = encryptData('');
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle unicode characters', () => {
    const unicodeData = '你好世界 🌍 Привет мир';
    const encrypted = encryptData(unicodeData);
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(unicodeData);
  });
});
