import { Result } from "../result";

export interface DocumentProps {
  leadId: string;
  name: string;
  type: string;
  url: string;
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
  version: number;
  createdAt: Date;
}

export class Document {
  public readonly id: string;
  private props: DocumentProps;

  private constructor(props: DocumentProps, id?: string) {
    this.id = id || `doc_${Math.random().toString(36).substr(2, 9)}`;
    this.props = props;
  }

  public static create(
    props: Omit<DocumentProps, "status" | "version" | "createdAt">
  ): Result<Document> {
    if (!props.name || props.name.trim() === "") {
      return Result.fail("Document name is required");
    }
    if (!props.url || props.url.trim() === "") {
      return Result.fail("Document URL is required");
    }

    return Result.ok(
      new Document({
        ...props,
        status: "UPLOADED",
        version: 1,
        createdAt: new Date(),
      })
    );
  }

  public verify(): Result<void> {
    if (this.props.status === "VERIFIED") {
      return Result.fail("Document is already verified");
    }
    this.props.status = "VERIFIED";
    return Result.ok();
  }

  public reject(): Result<void> {
    if (this.props.status === "REJECTED") {
      return Result.fail("Document is already rejected");
    }
    this.props.status = "REJECTED";
    return Result.ok();
  }

  public newVersion(url: string): Result<Document> {
    return Result.ok(
      new Document(
        {
          ...this.props,
          url,
          version: this.props.version + 1,
          status: "UPLOADED",
          createdAt: new Date(),
        },
        this.id
      )
    );
  }

  // Getters
  get name(): string {
    return this.props.name;
  }
  get type(): string {
    return this.props.type;
  }
  get url(): string {
    return this.props.url;
  }
  get status(): string {
    return this.props.status;
  }
  get version(): number {
    return this.props.version;
  }
}
