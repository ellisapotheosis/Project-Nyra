import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DocumentVersionAttributes {
  id: string;
  documentId: string;
  userId: string;
  versionNumber: number;
  s3Key: string;
  s3Bucket: string;
  fileSize: number;
  checksum: string;
  changeDescription?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentVersionCreationAttributes extends Optional<DocumentVersionAttributes, 'id' | 'changeDescription' | 'metadata'> {}

class DocumentVersion extends Model<DocumentVersionAttributes, DocumentVersionCreationAttributes> implements DocumentVersionAttributes {
  public id!: string;
  public documentId!: string;
  public userId!: string;
  public versionNumber!: number;
  public s3Key!: string;
  public s3Bucket!: string;
  public fileSize!: number;
  public checksum!: string;
  public changeDescription!: string;
  public metadata!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DocumentVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    s3Bucket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    changeDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'document_versions',
    indexes: [
      { fields: ['documentId', 'versionNumber'], unique: true },
      { fields: ['documentId'] },
      { fields: ['userId'] },
    ],
  }
);

export default DocumentVersion;
