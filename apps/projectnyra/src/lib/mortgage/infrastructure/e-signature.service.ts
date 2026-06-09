import { Result } from "../result";

export interface SignatureRequest {
  documentId: string;
  signers: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

export interface IESignatureService {
  requestSignature(request: SignatureRequest): Promise<Result<string>>;
  checkSignatureStatus(envelopeId: string): Promise<Result<string>>;
}

export class MockESignatureService implements IESignatureService {
  private envelopes: Map<string, string> = new Map();

  async requestSignature(request: SignatureRequest): Promise<Result<string>> {
    void request;

    const envelopeId = `env_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, this calls DocuSign or HelloSign API
    this.envelopes.set(envelopeId, "SENT");

    return Result.ok(envelopeId);
  }

  async checkSignatureStatus(envelopeId: string): Promise<Result<string>> {
    const status = this.envelopes.get(envelopeId);

    if (!status) {
      return Result.fail("Envelope not found");
    }

    // Mocking an eventual signature
    if (Math.random() > 0.5) {
      this.envelopes.set(envelopeId, "COMPLETED");
      return Result.ok("COMPLETED");
    }

    return Result.ok(status);
  }
}
