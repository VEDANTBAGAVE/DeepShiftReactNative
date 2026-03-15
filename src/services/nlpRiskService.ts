import { supabase } from './supabase';

export type RiskCategory = 'low' | 'medium' | 'high';

export interface NLPAnalysisResult {
  originalText: string;
  cleanedText: string;
  tokens: string[];
  matchedKeywords: string[];
  keywordScores: Array<{ keyword: string; score: number }>;
  riskScore: number;
  riskCategory: RiskCategory;
  riskFlag: boolean;
}

export interface RiskTaggedLog {
  id: string;
  source: 'incident_reports' | 'remarks' | 'tasks';
  section_id: string | null;
  description: string;
  risk_score: number;
  risk_category: RiskCategory;
  created_at: string;
}

const RISK_KEYWORD_SCORES: Record<string, number> = {
  gas: 3,
  methane: 3,
  fumes: 3,
  smoke: 3,
  fire: 3,
  spark: 3,
  burning: 3,
  vibration: 2,
  overheating: 3,
  jam: 2,
  crack: 2,
  leak: 2,
  short: 3,
  wiring: 2,
  electric: 2,
  electrical: 2,
  shock: 3,
  pressure: 1,
  delay: 1,
  hazard: 2,
  unsafe: 2,
  collapse: 3,
};

const cleanText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const classifyRisk = (score: number): RiskCategory => {
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
};

export const nlpRiskService = {
  analyzeText(text: string): NLPAnalysisResult {
    const cleanedText = cleanText(text || '');
    const tokens = cleanedText.length > 0 ? cleanedText.split(' ') : [];

    const keywordScores: Array<{ keyword: string; score: number }> = [];
    for (const token of tokens) {
      const score = RISK_KEYWORD_SCORES[token];
      if (score) {
        keywordScores.push({ keyword: token, score });
      }
    }

    // Unique keyword score contribution
    const deduped = new Map<string, number>();
    keywordScores.forEach(k => {
      if (!deduped.has(k.keyword)) {
        deduped.set(k.keyword, k.score);
      }
    });

    const matchedKeywords = Array.from(deduped.keys());
    const riskScore = Array.from(deduped.values()).reduce(
      (sum, s) => sum + s,
      0,
    );
    const riskCategory = classifyRisk(riskScore);

    return {
      originalText: text,
      cleanedText,
      tokens,
      matchedKeywords,
      keywordScores: Array.from(deduped.entries()).map(([keyword, score]) => ({
        keyword,
        score,
      })),
      riskScore,
      riskCategory,
      riskFlag: riskScore >= 2,
    };
  },

  async getRecentRiskTaggedLogs(limit: number = 10): Promise<RiskTaggedLog[]> {
    const [incidentsRes, remarksRes, tasksRes] = await Promise.all([
      supabase
        .from('incident_reports')
        .select(
          'id, section_id, description, risk_score, risk_category, created_at',
        )
        .eq('risk_flag', true)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('remarks')
        .select('id, worker_id, message, risk_score, risk_category, created_at')
        .eq('risk_flag', true)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('tasks')
        .select(
          'id, section_id, instructions, risk_score, risk_category, created_at',
        )
        .eq('risk_flag', true)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    if (incidentsRes.error) {
      throw new Error(
        `Failed to load incident risk logs: ${incidentsRes.error.message}`,
      );
    }
    if (remarksRes.error) {
      throw new Error(
        `Failed to load remarks risk logs: ${remarksRes.error.message}`,
      );
    }
    if (tasksRes.error) {
      throw new Error(
        `Failed to load task risk logs: ${tasksRes.error.message}`,
      );
    }

    const incidentLogs: RiskTaggedLog[] = (incidentsRes.data ?? []).map(
      (r: any) => ({
        id: r.id,
        source: 'incident_reports',
        section_id: r.section_id,
        description: r.description,
        risk_score: r.risk_score ?? 0,
        risk_category: (r.risk_category ?? 'low') as RiskCategory,
        created_at: r.created_at,
      }),
    );

    const remarksLogs: RiskTaggedLog[] = (remarksRes.data ?? []).map(
      (r: any) => ({
        id: r.id,
        source: 'remarks',
        section_id: null,
        description: r.message,
        risk_score: r.risk_score ?? 0,
        risk_category: (r.risk_category ?? 'low') as RiskCategory,
        created_at: r.created_at,
      }),
    );

    const taskLogs: RiskTaggedLog[] = (tasksRes.data ?? []).map((r: any) => ({
      id: r.id,
      source: 'tasks',
      section_id: r.section_id,
      description: r.instructions ?? 'Task note',
      risk_score: r.risk_score ?? 0,
      risk_category: (r.risk_category ?? 'low') as RiskCategory,
      created_at: r.created_at,
    }));

    return [...incidentLogs, ...remarksLogs, ...taskLogs]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit);
  },

  async getRiskKeywordFrequency(
    days: number = 30,
  ): Promise<Array<{ keyword: string; count: number }>> {
    const start = new Date();
    start.setDate(start.getDate() - days);

    const { data, error } = await supabase
      .from('incident_reports')
      .select('description')
      .gte('created_at', start.toISOString());

    if (error) {
      throw new Error(
        `Failed to load descriptions for keyword analytics: ${error.message}`,
      );
    }

    const counts = new Map<string, number>();
    (data ?? []).forEach((row: any) => {
      const result = nlpRiskService.analyzeText(row.description ?? '');
      result.matchedKeywords.forEach(k => {
        counts.set(k, (counts.get(k) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  },
};

export default nlpRiskService;
