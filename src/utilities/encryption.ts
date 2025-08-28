import CryptoJS from "crypto-js";

const ENCRYPTION_KEY =
  import.meta.env.VITE_PUBLIC_ENCRYPTION_KEY || "fallback-key";

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      ENCRYPTION_KEY
    ).toString();
    return encrypted;
  } catch (error) {
    throw new Error("Failed to encrypt data");
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Failed to decrypt data");
  }
};
