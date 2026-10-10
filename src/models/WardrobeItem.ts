import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWardrobeItem extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  style?: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const WardrobeItemSchema = new Schema<IWardrobeItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory: {
      type: String,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    style: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WardrobeItem: Model<IWardrobeItem> =
  mongoose.models.WardrobeItem ||
  mongoose.model<IWardrobeItem>("WardrobeItem", WardrobeItemSchema);

export default WardrobeItem