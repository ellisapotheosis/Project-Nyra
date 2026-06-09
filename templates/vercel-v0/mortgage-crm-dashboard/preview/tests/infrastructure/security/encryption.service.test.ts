import { EncryptionService } from "../../../src/infrastructure/security/encryption.service";

describe("EncryptionService", () => {
  const testKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService(testKey);
  });

  it("should encrypt and decrypt a string", () => {
    const originalText = "sensitive-ssn-1234";
    const encrypted = service.encrypt(originalText);

    expect(encrypted).not.toBe(originalText);
    expect(encrypted.split(":").length).toBe(3);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it("should produce different ciphertexts for the same plaintext (due to IV)", () => {
    const text = "constant-text";
    const enc1 = service.encrypt(text);
    const enc2 = service.encrypt(text);

    expect(enc1).not.toBe(enc2);
    expect(service.decrypt(enc1)).toBe(text);
    expect(service.decrypt(enc2)).toBe(text);
  });

  it("should throw error for invalid key", () => {
    expect(() => new EncryptionService("short")).toThrow();
  });
});
