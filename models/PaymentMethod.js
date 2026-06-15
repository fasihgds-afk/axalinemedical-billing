import mongoose from "mongoose";

const PaymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Payment method name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PaymentMethod ||
  mongoose.model("PaymentMethod", PaymentMethodSchema);
