import { supabase } from './supabase';
import {
  EquipmentLog,
  IncidentReport,
  Section,
  Shift,
  WorkerShiftLog,
} from '../types/database';

export type AnalyticsRange = 'today' | '7d' | '30d' | '90d';

export interface OperationalMetrics {
  totalShiftsToday: number;
  workersPresentToday: number;
  pendingApprovalsToday: number;
}

export interface SafetyMetrics {
  ppeViolations: number;
  incidentDistribution: Array<{ type: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
  highRiskSections: Array<{
    sectionId: string;
    sectionName: string;
    riskScore: number;
  }>;
}

export interface EquipmentMetrics {
  mostFaultyEquipment: Array<{ equipmentName: string; faults: number }>;
  failureTrend: Array<{ date: string; faults: number }>;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ShiftCompletionRate {
  completed: number;
  total: number;
  rate: number;
}

const getDateRangeStart = (range: AnalyticsRange): string => {
  const d = new Date();
  switch (range) {
    case 'today':
      d.setHours(0, 0, 0, 0);
      break;
    case '7d':
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      break;
    case '30d':
      d.setDate(d.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      break;
    case '90d':
      d.setDate(d.getDate() - 89);
      d.setHours(0, 0, 0, 0);
      break;
  }
  return d.toISOString();
};

const toDateKey = (iso: string): string => iso.slice(0, 10);

export const analyticsService = {
  async getOperationalMetrics(): Promise<OperationalMetrics> {
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: shifts, error: shiftsErr }, { data: logs, error: logsErr }] =
      await Promise.all([
        supabase
          .from('shifts')
          .select('id,status,shift_date')
          .eq('shift_date', today),
        supabase
          .from('worker_shift_logs')
          .select('id,shift_id,attendance_status'),
      ]);

    if (shiftsErr)
      throw new Error(
        `Operational metrics (shifts) failed: ${shiftsErr.message}`,
      );
    if (logsErr)
      throw new Error(`Operational metrics (logs) failed: ${logsErr.message}`);

    const shiftRows = (shifts ?? []) as Pick<
      Shift,
      'id' | 'status' | 'shift_date'
    >[];
    const logRows = (logs ?? []) as Pick<
      WorkerShiftLog,
      'id' | 'shift_id' | 'attendance_status'
    >[];

    const shiftIdsToday = new Set(shiftRows.map(s => s.id));
    const presentToday = logRows.filter(
      l => shiftIdsToday.has(l.shift_id) && l.attendance_status === 'present',
    ).length;

    return {
      totalShiftsToday: shiftRows.length,
      workersPresentToday: presentToday,
      pendingApprovalsToday: shiftRows.filter(s => s.status === 'submitted')
        .length,
    };
  },

  async getSafetyMetrics(range: AnalyticsRange): Promise<SafetyMetrics> {
    const start = getDateRangeStart(range);

    const [
      { data: incidents, error: incidentErr },
      { data: equipment, error: eqErr },
      { data: sections, error: secErr },
    ] = await Promise.all([
      supabase
        .from('incident_reports')
        .select('id,section_id,incident_type,severity_level,created_at')
        .gte('created_at', start),
      supabase
        .from('equipment_logs')
        .select('id,section_id,condition_status,created_at')
        .gte('created_at', start),
      supabase.from('sections').select('id,section_name'),
    ]);

    if (incidentErr)
      throw new Error(
        `Safety metrics (incidents) failed: ${incidentErr.message}`,
      );
    if (eqErr)
      throw new Error(`Safety metrics (equipment) failed: ${eqErr.message}`);
    if (secErr)
      throw new Error(`Safety metrics (sections) failed: ${secErr.message}`);

    const incidentRows = (incidents ?? []) as Pick<
      IncidentReport,
      'id' | 'section_id' | 'incident_type' | 'severity_level' | 'created_at'
    >[];
    const eqRows = (equipment ?? []) as Pick<
      EquipmentLog,
      'id' | 'section_id' | 'condition_status' | 'created_at'
    >[];
    const sectionRows = (sections ?? []) as Pick<
      Section,
      'id' | 'section_name'
    >[];
    const sectionNameById = new Map(
      sectionRows.map(s => [s.id, s.section_name]),
    );

    const byType = new Map<string, number>();
    const bySeverity = new Map<string, number>();
    const riskBySection = new Map<string, number>();

    for (const inc of incidentRows) {
      byType.set(inc.incident_type, (byType.get(inc.incident_type) ?? 0) + 1);
      bySeverity.set(
        inc.severity_level,
        (bySeverity.get(inc.severity_level) ?? 0) + 1,
      );

      const severityWeight =
        inc.severity_level === 'high'
          ? 3
          : inc.severity_level === 'medium'
          ? 2
          : 1;
      riskBySection.set(
        inc.section_id,
        (riskBySection.get(inc.section_id) ?? 0) + severityWeight,
      );
    }

    for (const eq of eqRows) {
      if (eq.condition_status === 'faulty') {
        riskBySection.set(
          eq.section_id,
          (riskBySection.get(eq.section_id) ?? 0) + 1,
        );
      }
    }

    const highRiskSections = Array.from(riskBySection.entries())
      .map(([sectionId, riskScore]) => ({
        sectionId,
        sectionName: sectionNameById.get(sectionId) ?? sectionId.slice(0, 8),
        riskScore,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    return {
      ppeViolations: incidentRows.filter(i => i.incident_type === 'PPE').length,
      incidentDistribution: Array.from(byType.entries()).map(
        ([type, count]) => ({ type, count }),
      ),
      severityDistribution: Array.from(bySeverity.entries()).map(
        ([severity, count]) => ({ severity, count }),
      ),
      highRiskSections,
    };
  },

  async getEquipmentMetrics(range: AnalyticsRange): Promise<EquipmentMetrics> {
    const start = getDateRangeStart(range);

    const { data, error } = await supabase
      .from('equipment_logs')
      .select('equipment_name,condition_status,created_at')
      .gte('created_at', start);

    if (error) throw new Error(`Equipment metrics failed: ${error.message}`);

    const rows = (data ?? []) as Pick<
      EquipmentLog,
      'equipment_name' | 'condition_status' | 'created_at'
    >[];
    const faultyRows = rows.filter(r => r.condition_status === 'faulty');

    const faultsByEquipment = new Map<string, number>();
    const faultsByDate = new Map<string, number>();

    for (const r of faultyRows) {
      faultsByEquipment.set(
        r.equipment_name,
        (faultsByEquipment.get(r.equipment_name) ?? 0) + 1,
      );
      const key = toDateKey(r.created_at);
      faultsByDate.set(key, (faultsByDate.get(key) ?? 0) + 1);
    }

    const mostFaultyEquipment = Array.from(faultsByEquipment.entries())
      .map(([equipmentName, faults]) => ({ equipmentName, faults }))
      .sort((a, b) => b.faults - a.faults)
      .slice(0, 8);

    const failureTrend = Array.from(faultsByDate.entries())
      .map(([date, faults]) => ({ date, faults }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { mostFaultyEquipment, failureTrend };
  },

  async getIncidentTrend(range: AnalyticsRange): Promise<ChartPoint[]> {
    const start = getDateRangeStart(range);

    const { data, error } = await supabase
      .from('incident_reports')
      .select('created_at')
      .gte('created_at', start)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Incident trend failed: ${error.message}`);

    const rows = (data ?? []) as Array<Pick<IncidentReport, 'created_at'>>;
    const byDate = new Map<string, number>();

    for (const r of rows) {
      const key = toDateKey(r.created_at);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }

    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ label: date.slice(5), value }));
  },

  async getSectionSafetyComparison(
    range: AnalyticsRange,
  ): Promise<ChartPoint[]> {
    const safety = await analyticsService.getSafetyMetrics(range);
    return safety.highRiskSections.map(s => ({
      label: s.sectionName,
      value: s.riskScore,
    }));
  },

  async getEquipmentFailureFrequency(
    range: AnalyticsRange,
  ): Promise<ChartPoint[]> {
    const equipment = await analyticsService.getEquipmentMetrics(range);
    return equipment.mostFaultyEquipment.map(e => ({
      label: e.equipmentName,
      value: e.faults,
    }));
  },

  async getShiftCompletionRate(
    range: AnalyticsRange,
  ): Promise<ShiftCompletionRate> {
    const start = getDateRangeStart(range).slice(0, 10);

    const { data, error } = await supabase
      .from('shifts')
      .select('status,shift_date')
      .gte('shift_date', start);

    if (error)
      throw new Error(`Shift completion rate failed: ${error.message}`);

    const rows = (data ?? []) as Array<Pick<Shift, 'status' | 'shift_date'>>;
    const total = rows.filter(
      r =>
        r.status === 'submitted' ||
        r.status === 'approved' ||
        r.status === 'archived',
    ).length;
    const completed = rows.filter(
      r => r.status === 'approved' || r.status === 'archived',
    ).length;

    return {
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
};

export default analyticsService;
