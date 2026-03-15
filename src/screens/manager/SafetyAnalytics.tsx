import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { RootStackParamList } from '../../navigation/types';
import analyticsService, {
  AnalyticsRange,
} from '../../services/analyticsService';
import nlpRiskService, { RiskTaggedLog } from '../../services/nlpRiskService';

type SafetyAnalyticsNavigationProp = StackNavigationProp<RootStackParamList>;
const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64;

const SafetyAnalytics: React.FC = () => {
  const navigation = useNavigation<SafetyAnalyticsNavigationProp>();
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [isLoading, setIsLoading] = useState(true);

  const [operational, setOperational] = useState({
    totalShiftsToday: 0,
    workersPresentToday: 0,
    pendingApprovalsToday: 0,
  });

  const [safety, setSafety] = useState({
    ppeViolations: 0,
    incidentDistribution: [] as Array<{ type: string; count: number }>,
    severityDistribution: [] as Array<{ severity: string; count: number }>,
    highRiskSections: [] as Array<{
      sectionId: string;
      sectionName: string;
      riskScore: number;
    }>,
  });

  const [equipment, setEquipment] = useState({
    mostFaultyEquipment: [] as Array<{ equipmentName: string; faults: number }>,
    failureTrend: [] as Array<{ date: string; faults: number }>,
  });

  const [incidentTrend, setIncidentTrend] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [sectionComparison, setSectionComparison] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [equipmentFrequency, setEquipmentFrequency] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [completionRate, setCompletionRate] = useState({
    completed: 0,
    total: 0,
    rate: 0,
  });
  const [recentRiskLogs, setRecentRiskLogs] = useState<RiskTaggedLog[]>([]);
  const [riskKeywordFrequency, setRiskKeywordFrequency] = useState<
    Array<{ keyword: string; count: number }>
  >([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        op,
        safetyMetrics,
        equipmentMetrics,
        trend,
        sectionBars,
        equipmentBars,
        shiftCompletion,
        riskLogs,
        keywords,
      ] = await Promise.all([
        analyticsService.getOperationalMetrics(),
        analyticsService.getSafetyMetrics(range),
        analyticsService.getEquipmentMetrics(range),
        analyticsService.getIncidentTrend(range),
        analyticsService.getSectionSafetyComparison(range),
        analyticsService.getEquipmentFailureFrequency(range),
        analyticsService.getShiftCompletionRate(range),
        nlpRiskService.getRecentRiskTaggedLogs(8),
        nlpRiskService.getRiskKeywordFrequency(
          range === 'today'
            ? 1
            : range === '7d'
            ? 7
            : range === '30d'
            ? 30
            : 90,
        ),
      ]);

      setOperational(op);
      setSafety(safetyMetrics);
      setEquipment(equipmentMetrics);
      setIncidentTrend(trend);
      setSectionComparison(sectionBars);
      setEquipmentFrequency(equipmentBars);
      setCompletionRate(shiftCompletion);
      setRecentRiskLogs(riskLogs);
      setRiskKeywordFrequency(keywords);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const incidentPie = useMemo(() => {
    if (safety.incidentDistribution.length === 0) {
      return [{ value: 1, color: '#cbd5e1', text: '0' }];
    }
    const colorMap: Record<string, string> = {
      PPE: '#3b82f6',
      equipment: '#f59e0b',
      gas: '#ef4444',
      temperature: '#06b6d4',
      other: '#64748b',
    };
    return safety.incidentDistribution.map(d => ({
      value: d.count,
      color: colorMap[d.type] ?? '#64748b',
      text: String(d.count),
      label: d.type,
    }));
  }, [safety.incidentDistribution]);

  const maxIncident = Math.max(4, ...incidentTrend.map(d => d.value));
  const maxSectionRisk = Math.max(3, ...sectionComparison.map(d => d.value));
  const maxEquipmentFaults = Math.max(
    3,
    ...equipmentFrequency.map(d => d.value),
  );

  const compact = (label: string, n: number = 8) =>
    label.length > n ? `${label.slice(0, n)}…` : label;

  const operationalCards = [
    {
      icon: '📅',
      title: 'Total shifts today',
      value: String(operational.totalShiftsToday),
      color: '#1e3a5f',
    },
    {
      icon: '👷',
      title: 'Workers present',
      value: String(operational.workersPresentToday),
      color: '#10b981',
    },
    {
      icon: '⏳',
      title: 'Pending approvals',
      value: String(operational.pendingApprovalsToday),
      color: '#f59e0b',
    },
  ];

  const safetyCards = [
    {
      icon: '🦺',
      title: 'PPE violations',
      value: String(safety.ppeViolations),
      color: '#ef4444',
    },
    {
      icon: '🚨',
      title: 'High-risk sections',
      value: String(safety.highRiskSections.length),
      color: '#f97316',
    },
    {
      icon: '🔥',
      title: 'High severity',
      value: String(
        safety.severityDistribution.find(s => s.severity === 'high')?.count ??
          0,
      ),
      color: '#dc2626',
    },
  ];

  const equipmentCards = [
    {
      icon: '🔧',
      title: 'Most faulty equipment',
      value: equipment.mostFaultyEquipment[0]?.equipmentName ?? '—',
      color: '#7c3aed',
    },
    {
      icon: '📉',
      title: 'Fault count (range)',
      value: String(
        equipment.failureTrend.reduce((sum, d) => sum + d.faults, 0),
      ),
      color: '#4f46e5',
    },
    {
      icon: '✅',
      title: 'Shift completion rate',
      value: `${completionRate.rate}%`,
      color: '#059669',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Manager Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Operations · Safety · Equipment
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} />
        }
      >
        <View style={styles.filterRow}>
          {(['today', '7d', '30d', '90d'] as AnalyticsRange[]).map(r => (
            <TouchableOpacity
              key={r}
              style={[
                styles.filterChip,
                range === r && styles.filterChipActive,
              ]}
              onPress={() => setRange(r)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  range === r && styles.filterChipTextActive,
                ]}
              >
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1e3a5f" />
            <Text style={styles.loadingText}>Loading analytics…</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionHeading}>Operational Metrics</Text>
            <View style={styles.cardRow}>
              {operationalCards.map((c, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <Text style={styles.metricIcon}>{c.icon}</Text>
                  <Text style={[styles.metricValue, { color: c.color }]}>
                    {c.value}
                  </Text>
                  <Text style={styles.metricLabel}>{c.title}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeading}>Safety Metrics</Text>
            <View style={styles.cardRow}>
              {safetyCards.map((c, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <Text style={styles.metricIcon}>{c.icon}</Text>
                  <Text style={[styles.metricValue, { color: c.color }]}>
                    {c.value}
                  </Text>
                  <Text style={styles.metricLabel}>{c.title}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeading}>Equipment Metrics</Text>
            <View style={styles.cardRow}>
              {equipmentCards.map((c, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <Text style={styles.metricIcon}>{c.icon}</Text>
                  <Text
                    style={[styles.metricValue, { color: c.color }]}
                    numberOfLines={1}
                  >
                    {c.value}
                  </Text>
                  <Text style={styles.metricLabel}>{c.title}</Text>
                </View>
              ))}
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Incident Trend Chart</Text>
              <LineChart
                data={incidentTrend.map(d => ({
                  value: d.value,
                  label: d.label,
                }))}
                width={chartWidth}
                height={200}
                color="#ef4444"
                thickness={3}
                curved
                areaChart
                startFillColor="#ef4444"
                startOpacity={0.2}
                endOpacity={0.02}
                noOfSections={4}
                maxValue={maxIncident}
                hideRules
                dataPointsRadius={4}
                initialSpacing={10}
                spacing={Math.max(
                  12,
                  Math.floor(
                    (chartWidth - 20) / Math.max(1, incidentTrend.length),
                  ) - 10,
                )}
              />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Section Safety Comparison</Text>
              <BarChart
                data={sectionComparison.map(d => ({
                  value: d.value,
                  label: compact(d.label),
                  frontColor: '#f97316',
                }))}
                width={chartWidth}
                height={220}
                noOfSections={4}
                maxValue={maxSectionRisk}
                barWidth={26}
                spacing={18}
                roundedTop
                hideRules
              />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Equipment Failure Frequency</Text>
              <BarChart
                data={equipmentFrequency.map(d => ({
                  value: d.value,
                  label: compact(d.label),
                  frontColor: '#4f46e5',
                }))}
                width={chartWidth}
                height={220}
                noOfSections={4}
                maxValue={maxEquipmentFaults}
                barWidth={22}
                spacing={16}
                roundedTop
                hideRules
              />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Incident Distribution</Text>
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <PieChart
                  data={incidentPie}
                  donut
                  radius={95}
                  innerRadius={58}
                  innerCircleColor="#fff"
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: '700',
                          color: '#0f172a',
                        }}
                      >
                        {safety.incidentDistribution.reduce(
                          (sum, d) => sum + d.count,
                          0,
                        )}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 12 }}>
                        Incidents
                      </Text>
                    </View>
                  )}
                />
              </View>
              <View style={{ marginTop: 12, gap: 8 }}>
                {incidentPie.map((p, i) => (
                  <View
                    key={i}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: p.color,
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ color: '#334155', fontSize: 13 }}>
                      {(p as any).label ?? 'No data'}: {p.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Shift Completion Rate</Text>
              <Text style={styles.rateValue}>{completionRate.rate}%</Text>
              <Text style={styles.rateSub}>
                {completionRate.completed} completed of {completionRate.total}{' '}
                submitted/approved/archived shifts
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionRate.rate}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                Recent Risk-Tagged Logs (NLP)
              </Text>
              {recentRiskLogs.length === 0 ? (
                <Text style={styles.rateSub}>
                  No risk-tagged logs in selected range.
                </Text>
              ) : (
                <View style={{ gap: 8 }}>
                  {recentRiskLogs.slice(0, 6).map(log => (
                    <View
                      key={`${log.source}-${log.id}`}
                      style={styles.riskLogRow}
                    >
                      <View style={styles.riskLogMeta}>
                        <Text style={styles.riskLogSource}>
                          {log.source.replace('_', ' ')}
                        </Text>
                        <Text
                          style={[
                            styles.riskBadge,
                            log.risk_category === 'high'
                              ? styles.riskHigh
                              : log.risk_category === 'medium'
                              ? styles.riskMedium
                              : styles.riskLow,
                          ]}
                        >
                          {log.risk_category.toUpperCase()} ({log.risk_score})
                        </Text>
                      </View>
                      <Text style={styles.riskLogText} numberOfLines={2}>
                        {log.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Risk Keyword Frequency</Text>
              {riskKeywordFrequency.length === 0 ? (
                <Text style={styles.rateSub}>No risk keywords detected.</Text>
              ) : (
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                >
                  {riskKeywordFrequency.slice(0, 10).map(k => (
                    <View key={k.keyword} style={styles.keywordChip}>
                      <Text style={styles.keywordChipText}>
                        {k.keyword}: {k.count}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e3a5f',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#cbd5e1', fontSize: 12, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 28 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: '#1e3a5f' },
  filterChipText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  loadingWrap: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 10, color: '#64748b' },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    marginTop: 8,
  },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 102,
  },
  metricIcon: { fontSize: 22, marginBottom: 8 },
  metricValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  metricLabel: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  rateValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'center',
  },
  rateSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  riskLogRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  riskLogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskLogSource: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  riskBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  riskHigh: { backgroundColor: '#dc2626' },
  riskMedium: { backgroundColor: '#f59e0b' },
  riskLow: { backgroundColor: '#10b981' },
  riskLogText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  keywordChip: {
    backgroundColor: '#e0f2fe',
    borderColor: '#7dd3fc',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  keywordChipText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SafetyAnalytics;
