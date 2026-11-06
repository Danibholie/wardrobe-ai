import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPaymentTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  txRef: string;
  flwTransactionId?: string;
  amount: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  paymentType?: string;
  planCycle?: "monthly" | "annual";
  customerEmail: string;
  customerName?: string;
  paidAt?: Date;
  flwData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    flwTransactionId: {
      type: String,
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
      index: true,
    },
    paymentType: {
      type: String,
      trim: true,
    },
    planCycle: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
    flwData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentTransaction: Model<IPaymentTransaction> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransaction>(
    "PaymentTransaction",
    PaymentTransactionSchema
  );

export default PaymentTransaction;

