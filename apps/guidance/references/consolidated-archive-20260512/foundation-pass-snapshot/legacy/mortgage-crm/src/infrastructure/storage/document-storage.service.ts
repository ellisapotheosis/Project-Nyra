import { Result } from "../../domain/result";

export interface IDocumentStorageService {
  uploadDocument(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<Result<string>>;
  downloadDocument(fileUrl: string): Promise<Result<Buffer>>;
  deleteDocument(fileUrl: string): Promise<Result<void>>;
}

export class MockDocumentStorageService implements IDocumentStorageService {
  private storage: Map<string, Buffer> = new Map();

  async uploadDocument(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<Result<string>> {
    const fileId = `${Date.now()}-${fileName}`;
    const fileUrl = `https://mock-storage.nyra.com/docs/${fileId}`;
    
    // In a real implementation, this would use AWS S3 SDK or Azure Blob SDK
    this.storage.set(fileUrl, fileBuffer);
    
    return Result.ok(fileUrl);
  }

  async downloadDocument(fileUrl: string): Promise<Result<Buffer>> {
    const buffer = this.storage.get(fileUrl);
    if (!buffer) {
      return Result.fail("Document not found in storage");
    }
    return Result.ok(buffer);
  }

  async deleteDocument(fileUrl: string): Promise<Result<void>> {
    if (!this.storage.has(fileUrl)) {
      return Result.fail("Document not found to delete");
    }
    this.storage.delete(fileUrl);
    return Result.ok();
  }
}
