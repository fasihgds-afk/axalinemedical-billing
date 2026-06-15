import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: [true, "Payment method is required"],
    },
    paymentStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentStatus",
      required: [true, "Payment status is required"],
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    screenshot: {
      type: FileSchema,
      default: null,
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
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

PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ clientId: 1 });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
