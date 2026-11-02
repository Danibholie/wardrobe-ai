import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  image?: string;
  role?: "user" | "admin";
  lastActiveAt?: Date;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  preferences?: {
    preferredStyles?: string[];
    defaultOccasion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    image: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    location: {
      city: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },

    preferences: {
      preferredStyles: [String],
      defaultOccasion: String,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
