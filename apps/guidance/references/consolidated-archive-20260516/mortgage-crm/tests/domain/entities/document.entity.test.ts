import { Document } from "../../../src/domain/entities/document.entity";

describe("Document Entity", () => {
  const validProps = {
    leadId: "lead-123",
    name: "W2-Form-2025.pdf",
    type: "W2",
    url: "https://mock.storage.com/w2.pdf"
  };

  it("should create a document in UPLOADED status", () => {
    const result = Document.create(validProps);
    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe("UPLOADED");
    expect(result.value.version).toBe(1);
  });

  it("should fail creation if name is empty", () => {
    const result = Document.create({ ...validProps, name: "" });
    expect(result.isFailure).toBe(true);
  });

  it("should fail creation if URL is empty", () => {
    const result = Document.create({ ...validProps, url: "" });
    expect(result.isFailure).toBe(true);
  });

  it("should allow verification", () => {
    const doc = Document.create(validProps).value;
    const verifyResult = doc.verify();
    expect(verifyResult.isSuccess).toBe(true);
    expect(doc.status).toBe("VERIFIED");
  });

  it("should prevent verifying an already verified document", () => {
    const doc = Document.create(validProps).value;
    doc.verify();
    const verifyResult = doc.verify();
    expect(verifyResult.isFailure).toBe(true);
  });

  it("should allow rejection", () => {
    const doc = Document.create(validProps).value;
    const rejectResult = doc.reject();
    expect(rejectResult.isSuccess).toBe(true);
    expect(doc.status).toBe("REJECTED");
  });

  it("should support creating a new version", () => {
    const doc = Document.create(validProps).value;
    const newDocResult = doc.newVersion("https://mock.storage.com/w2-v2.pdf");
    
    expect(newDocResult.isSuccess).toBe(true);
    const newDoc = newDocResult.value;
    
    expect(newDoc.id).toBe(doc.id);
    expect(newDoc.version).toBe(2);
    expect(newDoc.url).toBe("https://mock.storage.com/w2-v2.pdf");
    expect(newDoc.status).toBe("UPLOADED"); // Resets status for new version
  });
});
