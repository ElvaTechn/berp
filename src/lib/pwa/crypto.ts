/**
 * ================================================================
 * PWA CRYPTO - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Criptografia para dados sensíveis armazenados offline
 * 
 * SEGURANÇA:
 * - AES-256-GCM encryption
 * - Device fingerprint como salt
 * - Dados sensíveis nunca em plaintext
 * 
 * AUTOR: Security Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

"use client";

// ================================================================
// DEVICE FINGERPRINT
// ================================================================

/**
 * Gera fingerprint único do dispositivo
 * Usado como salt para criptografia
 */
export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server";

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];

  const fingerprint = components.join("|");
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

// ================================================================
// ENCRYPTION/DECRYPTION
// ================================================================

/**
 * Encripta dados usando AES-GCM (Web Crypto API)
 */
export async function encrypt(data: string): Promise<string> {
  if (typeof window === "undefined") throw new Error("Crypto only works in browser");

  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Gerar chave a partir do fingerprint
    const key = await getEncryptionKey();

    // Gerar IV aleatório
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encriptar
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Combinar IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Converter para Base64
    return bufferToBase64(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Desencripta dados
 */
export async function decrypt(encryptedData: string): Promise<string> {
  if (typeof window === "undefined") throw new Error("Crypto only works in browser");

  try {
    // Converter de Base64
    const combined = base64ToBuffer(encryptedData);

    // Separar IV e dados encriptados
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Gerar chave a partir do fingerprint
    const key = await getEncryptionKey();

    // Desencriptar
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );

    // Converter para string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

// ================================================================
// KEY GENERATION
// ================================================================

/**
 * Gera chave de encriptação a partir do fingerprint
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const fingerprint = getDeviceFingerprint();
  
  // Adicionar salt fixo (secret do app)
  const salt = "BizControl360_v2_PWA_2025";
  const combinedKey = fingerprint + salt;

  // Converter para buffer
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(combinedKey);

  // Gerar chave usando PBKDF2
  const importedKey = await window.crypto.subtle.importKey(
    "raw",
    keyMaterial,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derivar chave AES
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    importedKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

// ================================================================
// HELPERS
// ================================================================

/**
 * Converte ArrayBuffer para Base64
 */
function bufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Converte Base64 para ArrayBuffer
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// ================================================================
// SECURE STORAGE
// ================================================================

/**
 * Salva dado encriptado no localStorage
 */
export async function secureSet(key: string, value: any): Promise<void> {
  const jsonString = JSON.stringify(value);
  const encrypted = await encrypt(jsonString);
  localStorage.setItem(key, encrypted);
}

/**
 * Lê dado encriptado do localStorage
 */
export async function secureGet<T>(key: string): Promise<T | null> {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const decrypted = await decrypt(encrypted);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error(`Failed to read secure key: ${key}`, error);
    localStorage.removeItem(key); // Remove corrupted data
    return null;
  }
}

/**
 * Remove dado do localStorage
 */
export function secureRemove(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Limpa todos os dados seguros
 */
export function secureClear(): void {
  localStorage.clear();
}
