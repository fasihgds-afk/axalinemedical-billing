import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function writeAuditLog({
  userId,
  action,
  entity,
  entityId,
  changes = {},
}) {
  try {
    await connectDB();

    await AuditLog.create({
      userId,
      action,
      entity,
      entityId: entityId?.toString?.() ?? entityId,
      changes,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to write audit log",
    };
  }
}
