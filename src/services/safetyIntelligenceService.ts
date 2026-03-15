import { supabase } from './supabase';
import nlpRiskService from './nlpRiskService';

export type SafetyAlertType = 'safety' | 'maintenance' | 'operational';
export type SafetyAlertSeverity = 'info' | 'warning' | 'critical';

export interface SafetyAlert {
  id: string;
  type: SafetyAlertType;
  severity: SafetyAlertSeverity;
  title: string;
  message: string;
  createdAt: string;
}

const PPE_THRESHOLD = 3;
const EQUIPMENT_REPEAT_THRESHOLD = 3;
const APPROVAL_DELAY_HOURS = 4;

const hoursSince = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));

export const safetyIntelligenceService = {
  async getRuleBasedAlerts(): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    // ---------- Rule 1: PPE violations > 3 within last 3 shifts ----------
    const { data: latestShifts, error: shiftsErr } = await supabase
      .from('shifts')
      .select('id,shift_date,created_at')
      .order('shift_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);

    if (shiftsErr) {
      throw new Error(
        `Rule engine failed on shifts query: ${shiftsErr.message}`,
      );
    }

    const latestShiftIds = (latestShifts ?? []).map(s => s.id);
    if (latestShiftIds.length > 0) {
      const { data: ppeIncidents, error: ppeErr } = await supabase
        .from('incident_reports')
        .select('id,created_at,section_id')
        .eq('incident_type', 'PPE')
        .in('shift_id', latestShiftIds);

      if (ppeErr) {
        throw new Error(`Rule engine failed on PPE query: ${ppeErr.message}`);
      }

      const ppeCount = (ppeIncidents ?? []).length;
      if (ppeCount > PPE_THRESHOLD) {
        alerts.push({
          id: `ppe-${Date.now()}`,
          type: 'safety',
          severity: ppeCount > PPE_THRESHOLD + 2 ? 'critical' : 'warning',
          title: 'PPE Violation Burst Detected',
          message: `${ppeCount} PPE violations reported in the last 3 shifts (threshold: ${PPE_THRESHOLD}).`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // ---------- Rule 2: repeated faulty equipment reports ----------
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: faultyLogs, error: faultyErr } = await supabase
      .from('equipment_logs')
      .select('equipment_name,created_at')
      .eq('condition_status', 'faulty')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (faultyErr) {
      throw new Error(
        `Rule engine failed on equipment query: ${faultyErr.message}`,
      );
    }

    const faultCounts = new Map<string, number>();
    for (const row of faultyLogs ?? []) {
      faultCounts.set(
        row.equipment_name,
        (faultCounts.get(row.equipment_name) ?? 0) + 1,
      );
    }

    for (const [equipmentName, count] of faultCounts.entries()) {
      if (count >= EQUIPMENT_REPEAT_THRESHOLD) {
        alerts.push({
          id: `equipment-${equipmentName}-${count}`,
          type: 'maintenance',
          severity:
            count >= EQUIPMENT_REPEAT_THRESHOLD + 2 ? 'critical' : 'warning',
          title: 'Repeated Equipment Failure',
          message: `${equipmentName} reported faulty ${count} times in last 7 days. Maintenance escalation required.`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // ---------- Rule 3: supervisor/manager approval delay ----------
    const { data: submittedShifts, error: submittedErr } = await supabase
      .from('shifts')
      .select('id,submitted_at,status')
      .eq('status', 'submitted')
      .not('submitted_at', 'is', null);

    if (submittedErr) {
      throw new Error(
        `Rule engine failed on pending approvals query: ${submittedErr.message}`,
      );
    }

    const delayedPending = (submittedShifts ?? []).filter(
      s => s.submitted_at && hoursSince(s.submitted_at) > APPROVAL_DELAY_HOURS,
    );

    if (delayedPending.length > 0) {
      alerts.push({
        id: `approval-delay-pending-${delayedPending.length}`,
        type: 'operational',
        severity: delayedPending.length >= 3 ? 'critical' : 'warning',
        title: 'Approval Delay Detected',
        message: `${delayedPending.length} submitted shift logs are delayed beyond ${APPROVAL_DELAY_HOURS} hours.`,
        createdAt: new Date().toISOString(),
      });
    }

    const { data: approvedRecent, error: approvedErr } = await supabase
      .from('shifts')
      .select('id,submitted_at,approved_at,status')
      .in('status', ['approved', 'archived'])
      .not('submitted_at', 'is', null)
      .not('approved_at', 'is', null)
      .gte('approved_at', sevenDaysAgo.toISOString());

    if (approvedErr) {
      throw new Error(
        `Rule engine failed on historical approvals query: ${approvedErr.message}`,
      );
    }

    const delayedHistorical = (approvedRecent ?? []).filter(s => {
      const submittedAt = s.submitted_at
        ? new Date(s.submitted_at).getTime()
        : 0;
      const approvedAt = s.approved_at ? new Date(s.approved_at).getTime() : 0;
      if (!submittedAt || !approvedAt) return false;
      const hours = (approvedAt - submittedAt) / (1000 * 60 * 60);
      return hours > APPROVAL_DELAY_HOURS;
    });

    if (delayedHistorical.length > 0) {
      alerts.push({
        id: `approval-delay-history-${delayedHistorical.length}`,
        type: 'operational',
        severity: 'info',
        title: 'Slow Approval Pattern',
        message: `${delayedHistorical.length} approvals in last 7 days exceeded ${APPROVAL_DELAY_HOURS} hours turnaround.`,
        createdAt: new Date().toISOString(),
      });
    }

    // ---------- Rule 4: NLP high-risk textual logs ----------
    const riskLogs = await nlpRiskService.getRecentRiskTaggedLogs(20);
    const highRiskLogs = riskLogs.filter(l => l.risk_category === 'high');
    if (highRiskLogs.length > 0) {
      alerts.push({
        id: `nlp-high-risk-${highRiskLogs.length}`,
        type: 'safety',
        severity: highRiskLogs.length >= 3 ? 'critical' : 'warning',
        title: 'NLP High-Risk Language Detected',
        message: `${highRiskLogs.length} recent logs contain high-risk safety language (gas/smoke/overheating etc.).`,
        createdAt: new Date().toISOString(),
      });
    }

    // Sort by severity then newest first
    const severityRank: Record<SafetyAlertSeverity, number> = {
      critical: 3,
      warning: 2,
      info: 1,
    };

    return alerts.sort((a, b) => {
      const bySeverity = severityRank[b.severity] - severityRank[a.severity];
      if (bySeverity !== 0) return bySeverity;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  async getAlertsSummary() {
    const alerts = await safetyIntelligenceService.getRuleBasedAlerts();
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      alerts,
    };
  },
};

export default safetyIntelligenceService;
