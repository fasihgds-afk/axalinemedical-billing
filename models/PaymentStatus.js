import mongoose from "mongoose";

const PaymentStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Payment status name is required"],
      trim: true,
      unique: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      default: "#808080",
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

export default mongoose.models.PaymentStatus ||
  mongoose.model("PaymentStatus", PaymentStatusSchema);
