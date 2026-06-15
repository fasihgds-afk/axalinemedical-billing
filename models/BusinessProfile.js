import mongoose from "mongoose";
import { APP_NAME } from "@/config/constants";

const FileSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    key: { type: String, default: "" },
  },
  { _id: false }
);

const BusinessProfileSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: APP_NAME,
      trim: true,
    },
    logo: {
      type: FileSchema,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BusinessProfile ||
  mongoose.model("BusinessProfile", BusinessProfileSchema);
