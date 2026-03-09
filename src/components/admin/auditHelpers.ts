import { supabase } from '@/integrations/supabase/client';

/**
 * Audit Log Entry — every admin action writes here.
 * These entries are append-only and should never be deleted.
 */
export interface AuditEntry {
  id: string;
  admin_id: string;
  action: string;
  target_id: string;
  reason: string;
  metadata: Record<string, any>;
  created_at: string;
}

// In-memory log for demo / when Supabase table doesn't exist yet
let memoryLog: AuditEntry[] = [];

/**
 * Write an immutable audit log entry.
 * Tries Supabase first; falls back to in-memory store.
 */
export async function writeAuditLog(
  adminId: string,
  action: string,
  targetId: string,
  reason: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    admin_id: adminId,
    action,
    target_id: targetId,
    reason,
    metadata,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('admin_audit_logs' as any).insert({
      admin_id: adminId,
      action,
      target_id: targetId,
      reason,
      metadata,
    });
    if (error) throw error;
  } catch {
    // Supabase table may not exist yet — store in memory
    memoryLog.push(entry);
    console.info('[AuditLog] Stored in memory:', entry);
  }
}

/**
 * Read all audit log entries (newest first).
 */
export async function readAuditLog(): Promise<AuditEntry[]> {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    // Merge with any memory entries
    const combined = [...memoryLog, ...(data || [])].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return combined as AuditEntry[];
  } catch {
    return [...memoryLog].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}
