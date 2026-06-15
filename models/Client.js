import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
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
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ClientSchema.index({ name: "text", email: "text" });

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
