import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { DocumentStatus, DocumentMetadata } from '../types';

interface DocumentAttributes {
  id: string;
  userId: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  s3Bucket: string;
  thumbnailKey?: string;
  category?: string;
  status: DocumentStatus;
  version: number;
  currentVersionId?: string;
  ocrText?: string;
  ocrConfidence?: number;
  metadata?: DocumentMetadata;
  checksum: string;
  isEncrypted: boolean;
  encryptionKey?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'description' | 'thumbnailKey' | 'category' | 'status' | 'version' | 'currentVersionId' | 'ocrText' | 'ocrConfidence' | 'metadata' | 'isEncrypted' | 'encryptionKey' | 'expiresAt'> {}

class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public fileName!: string;
  public fileSize!: number;
  public mimeType!: string;
  public s3Key!: string;
  public s3Bucket!: string;
  public thumbnailKey!: string;
  public category!: string;
  public status!: DocumentStatus;
  public version!: number;
  public currentVersionId!: string;
  public ocrText!: string;
  public ocrConfidence!: number;
  public metadata!: DocumentMetadata;
  public checksum!: string;
  public isEncrypted!: boolean;
  public encryptionKey!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    s3Bucket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DocumentStatus)),
      allowNull: false,
      defaultValue: DocumentStatus.ACTIVE,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    currentVersionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ocrText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ocrConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    encryptionKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'documents',
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['createdAt'] },
      { fields: ['s3Key'], unique: true },
    ],
  }
);

export default Document;
