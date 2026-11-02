import mongoose, { Document, Model, Schema } from "mongoose";

export type MetricType =
  | "ai_recommendation"
  | "clothing_identification"
  | "image_upload"
  | "api_request"
  | "database";

export interface ISystemMetric extends Document {
  type: MetricType;
  endpoint?: string;
  userId?: mongoose.Types.ObjectId | string;
  durationMs: number;
  success: boolean;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const SystemMetricSchema = new Schema<ISystemMetric>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "ai_recommendation",
        "clothing_identification",
        "image_upload",
        "api_request",
        "database",
      ],
      index: true,
    },

    endpoint: {
      type: String,
      trim: true,
    },

    userId: {
      type: Schema.Types.Mixed,
      index: true,
    },

    durationMs: {
      type: Number,
      required: true,
    },

    success: {
      type: Boolean,
      required: true,
      index: true,
    },

    statusCode: {
      type: Number,
    },

    errorCode: {
      type: String,
      trim: true,
      index: true,
    },

    errorMessage: {
      type: String,
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      // Automatically expire records after 30 days to keep DB storage lean
      expires: 60 * 60 * 24 * 30,
      index: true,
    },
  },
  {
    // Skip automatic updatedAt timestamp to save storage space on log documents
    timestamps: { createdAt: false, updatedAt: false },
  }
);

// Compound index for querying recent metrics by type and success status
SystemMetricSchema.index({ type: 1, createdAt: -1 });
SystemMetricSchema.index({ success: 1, createdAt: -1 });

const SystemMetric: Model<ISystemMetric> =
  mongoose.models.SystemMetric ||
  mongoose.model<ISystemMetric>("SystemMetric", SystemMetricSchema);

export default SystemMetric;

