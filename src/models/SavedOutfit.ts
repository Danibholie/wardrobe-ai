import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedOutfit extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  vibeDescription?: string;
  event?: string;
  location?: string;
  weather?: string;
  stylingTips: string[];
  itemIds: mongoose.Types.ObjectId[];
  missingPiecesAdvice?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedOutfitSchema = new Schema<ISavedOutfit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    vibeDescription: {
      type: String,
      trim: true,
    },
    event: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    weather: {
      type: String,
      trim: true,
    },
    stylingTips: {
      type: [String],
      default: [],
    },
    itemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "WardrobeItem",
      },
    ],
    missingPiecesAdvice: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SavedOutfit: Model<ISavedOutfit> =
  mongoose.models.SavedOutfit ||
  mongoose.model<ISavedOutfit>("SavedOutfit", SavedOutfitSchema);

export default SavedOutfit;
