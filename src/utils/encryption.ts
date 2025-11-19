import { decode as base64Decode, encode as base64Encode } from 'base-64';

// Simple encryption/decryption using XOR cipher with a key
const ENCRYPTION_KEY = 'SoChiTieu@2025#SecureKey!';

/**
 * Encrypt a string using XOR cipher
 */
export function encryptData(data: string): string {
  const key = ENCRYPTION_KEY;
  let encrypted = '';

  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-bitwise
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }

  // Convert to base64 for safe storage/transmission
  return base64Encode(encrypted);
}

/**
 * Decrypt a string that was encrypted with encryptData
 */
export function decryptData(encryptedData: string): string {
  try {
    // Decode from base64
    const encrypted = base64Decode(encryptedData);
    const key = ENCRYPTION_KEY;
    let decrypted = '';

    for (let i = 0; i < encrypted.length; i++) {
      // eslint-disable-next-line no-bitwise
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }

    return decrypted;
  } catch {
    throw new Error(
      'Không thể giải mã dữ liệu. File có thể bị hỏng hoặc không đúng định dạng.',
    );
  }
}
