import mongoose, { Document, Model, Schema } from "mongoose";

export interface IListing extends Document {
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  maxGuests: number;
  host: mongoose.Types.ObjectId;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", listingSchema);
