import mongoose from "mongoose";
import { CUSTOM_FIELD_TYPES } from "@/config/constants";

const CustomFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
    },
    key: {
      type: String,
      required: [true, "Key is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: CUSTOM_FIELD_TYPES,
      required: [true, "Field type is required"],
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      trim: true,
      default: "",
    },
    options: {
      type: [String],
      default: [],
    },
    showInTable: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CustomField ||
  mongoose.model("CustomField", CustomFieldSchema);
