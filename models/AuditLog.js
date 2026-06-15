import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete"],
    },
    entity: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);
