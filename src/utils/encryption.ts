import { decode as base64Decode, encode as base64Encode } from 'base-64';

// Simple encryption/decryption using XOR cipher with a key
const ENCRYPTION_KEY = 'SoChiTieu@2025#SecureKey!';

/**
 * Encrypt a string using XOR cipher
 */
export function encryptData(data: string): string {
  const key = ENCRYPTION_KEY;
  const bytes: number[] = [];

  // Convert to UTF-8 bytes first
  const utf8Data = unescape(encodeURIComponent(data));

  // XOR encryption on bytes
  for (let i = 0; i < utf8Data.length; i++) {
    // eslint-disable-next-line no-bitwise
    const encryptedByte =
      utf8Data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    bytes.push(encryptedByte);
  }

  // Convert bytes to base64-safe string
  const binaryString = String.fromCharCode(...bytes);
  return base64Encode(binaryString);
}

/**
 * Decrypt a string that was encrypted with encryptData
 */
export function decryptData(encryptedData: string): string {
  try {
    // Decode from base64
    const binaryString = base64Decode(encryptedData);
    const key = ENCRYPTION_KEY;
    const bytes: number[] = [];

    // XOR decryption
    for (let i = 0; i < binaryString.length; i++) {
      // eslint-disable-next-line no-bitwise
      const decryptedByte =
        binaryString.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      bytes.push(decryptedByte);
    }

    // Convert bytes back to UTF-8 string
    const utf8String = String.fromCharCode(...bytes);
    return decodeURIComponent(escape(utf8String));
  } catch {
    throw new Error(
      'Không thể giải mã dữ liệu. File có thể bị hỏng hoặc không đúng định dạng.',
    );
  }
}
