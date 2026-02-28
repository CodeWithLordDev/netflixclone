import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

export async function logAudit({ actorId, actorRole, action, entity, entityId = "", metadata = {}, ip = "", userAgent = "" }) {
  try {
    await connectDB();
    await AuditLog.create({ actorId, actorRole, action, entity, entityId, metadata, ip, userAgent });
  } catch {
    // do not block request on audit failure
  }
}
