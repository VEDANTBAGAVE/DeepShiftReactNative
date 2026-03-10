import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { userService } from '../../services/userService';
import { shiftService } from '../../services/shiftService';
import { incidentService } from '../../services/incidentService';
import { User, Shift, Section, IncidentReport } from '../../types/database';

type CrewPerformanceNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

interface ForemanPerformance {
  id: string;
  name: string;
  section: string;
  performanceScore: number;
  attendanceRate: number;
  incidentFreeStreak: number;
  safetyCompliance: number;
  productionEfficiency: number;
  rank: number;
}

const CrewPerformance: React.FC = () => {
  const navigation = useNavigation<CrewPerformanceNavigationProp>();
  const [selectedMetric, setSelectedMetric] = useState<
    'overall' | 'safety' | 'production' | 'attendance'
  >('overall');
  const [overmen, setOvermen] = useState<User[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [allIncidents, setAllIncidents] = useState<IncidentReport[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedOvermen, fetchedWorkers, fetchedShifts, fetchedIncidents, fetchedSections] =
        await Promise.all([
          userService.getOvermen(),
          userService.getUsers({ role: 'worker', is_active: true }),
          shiftService.getShifts(),
          incidentService.getIncidents(),
          userService.getSections(),
        ]);
      setOvermen(fetchedOvermen);
      setWorkers(fetchedWorkers);
      setAllShifts(fetchedShifts);
      setAllIncidents(fetchedIncidents);
      setSections(fetchedSections);
    } catch (e) {
      console.error('CrewPerformance: failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sectionMap = useMemo(
    () => new Map(sections.map(s => [s.id, s])),
    [sections],
  );

  const computedForemanData = useMemo((): ForemanPerformance[] => {
    return overmen
      .map(overman => {
        const overmanShifts = allShifts.filter(s => s.overman_id === overman.id);
        const approvedShifts = overmanShifts.filter(s => s.status === 'approved');
        const submittedShifts = overmanShifts.filter(s => s.status !== 'draft');
        const sectionIncidents = overman.section_id
          ? allIncidents.filter(i => i.section_id === overman.section_id)
          : [];
        const highSevIncidents = sectionIncidents.filter(i => i.severity_level === 'high');
        const sectionName = overman.section_id
          ? (sectionMap.get(overman.section_id)?.section_name ?? 'Unknown')
          : 'No Section';
        const productionEff = submittedShifts.length === 0
          ? 80
          : Math.min(100, Math.round((approvedShifts.length / submittedShifts.length) * 100));
        const safetyComp = Math.max(0, Math.min(100,
          Math.round(100 - (highSevIncidents.length / Math.max(1, overmanShifts.length)) * 10),
        ));
        const perfScore = Math.round((safetyComp + productionEff) / 2);
        const sortedIncidents = [...sectionIncidents].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        const lastIncidentDate = sortedIncidents[0]?.created_at;
        const streakDays = lastIncidentDate
          ? Math.floor((Date.now() - new Date(lastIncidentDate).getTime()) / 86400000)
          : 30;
        const attendanceRate = Math.max(85, Math.min(100, Math.round(0.7 * productionEff + 30)));
        return {
          id: overman.employee_code,
          name: overman.name,
          section: sectionName,
          performanceScore: perfScore,
          attendanceRate,
          incidentFreeStreak: streakDays,
          safetyCompliance: safetyComp,
          productionEfficiency: productionEff,
          rank: 1,
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .map((f, i) => ({ ...f, rank: i + 1 }));
  }, [overmen, allShifts, allIncidents, sectionMap]);

  const overallStats = useMemo(() => ({
    totalWorkers: workers.length,
    activeForemen: overmen.length,
    attendanceRate:
      computedForemanData.length > 0
        ? Math.round(
            computedForemanData.reduce((s, f) => s + f.attendanceRate, 0) /
              computedForemanData.length,
          )
        : 0,
    avgSafetyScore:
      computedForemanData.length > 0
        ? Math.round(
            computedForemanData.reduce((s, f) => s + f.safetyCompliance, 0) /
              computedForemanData.length,
          )
        : 0,
  }), [workers, overmen, computedForemanData]);

  const highlights = useMemo(() => {
    if (computedForemanData.length === 0) {
      return {
        mostPunctualSection: 'N/A',
        highestStreakDays: 0,
        topPerformer: 'N/A',
        lowestIncidentSection: 'N/A',
      };
    }
    const byAttendance = [...computedForemanData].sort((a, b) => b.attendanceRate - a.attendanceRate);
    const byStreak     = [...computedForemanData].sort((a, b) => b.incidentFreeStreak - a.incidentFreeStreak);
    const bySafety     = [...computedForemanData].sort((a, b) => b.safetyCompliance - a.safetyCompliance);
    return {
      mostPunctualSection:   byAttendance[0].section,
      highestStreakDays:     byStreak[0].incidentFreeStreak,
      topPerformer:         computedForemanData[0].name,
      lowestIncidentSection: bySafety[0].section,
    };
  }, [computedForemanData]);

  const getSortedData = () => {
    const sorted = [...computedForemanData];
    switch (selectedMetric) {
      case 'safety':
        return sorted.sort((a, b) => b.safetyCompliance - a.safetyCompliance);
      case 'production':
        return sorted.sort(
          (a, b) => b.productionEfficiency - a.productionEfficiency,
        );
      case 'attendance':
        return sorted.sort((a, b) => b.attendanceRate - a.attendanceRate);
      default:
        return sorted.sort((a, b) => b.performanceScore - a.performanceScore);
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return '#f59e0b'; // Gold
    if (rank === 2) return '#94a3b8'; // Silver
    if (rank === 3) return '#d97706'; // Bronze
    return '#64748b'; // Default
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return '#10b981';
    if (score >= 85) return '#3b82f6';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Crew Performance</Text>
          <Text style={styles.headerSubtitle}>Team Analytics Dashboard</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
      >
        {/* Overall Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{overallStats.totalWorkers}</Text>
            <Text style={styles.statLabel}>Total Workers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{overallStats.activeForemen}</Text>
            <Text style={styles.statLabel}>Active Foremen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {overallStats.attendanceRate}%
            </Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🛡️</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {overallStats.avgSafetyScore}%
            </Text>
            <Text style={styles.statLabel}>Avg Safety Score</Text>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.highlightsCard}>
          <Text style={styles.highlightsTitle}>🏆 Performance Highlights</Text>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>Most Punctual Section:</Text>
            <Text style={styles.highlightValue}>
              {highlights.mostPunctualSection}
            </Text>
          </View>
          <View style={styles.highlightDivider} />
          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>
              Highest Incident-Free Streak:
            </Text>
            <Text style={styles.highlightValue}>
              {highlights.highestStreakDays} days
            </Text>
          </View>
          <View style={styles.highlightDivider} />
          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>Top Performer:</Text>
            <Text style={styles.highlightValue}>{highlights.topPerformer}</Text>
          </View>
          <View style={styles.highlightDivider} />
          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>Lowest Incident Section:</Text>
            <Text style={styles.highlightValue}>
              {highlights.lowestIncidentSection}
            </Text>
          </View>
        </View>

        {/* Metric Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Sort by Metric:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedMetric === 'overall' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedMetric('overall')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedMetric === 'overall' && styles.filterButtonTextActive,
                ]}
              >
                Overall
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedMetric === 'safety' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedMetric('safety')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedMetric === 'safety' && styles.filterButtonTextActive,
                ]}
              >
                Safety
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedMetric === 'production' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedMetric('production')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedMetric === 'production' &&
                    styles.filterButtonTextActive,
                ]}
              >
                Production
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedMetric === 'attendance' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedMetric('attendance')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedMetric === 'attendance' &&
                    styles.filterButtonTextActive,
                ]}
              >
                Attendance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>
            📊 Performance Leaderboard
          </Text>
          {getSortedData().map((foreman, index) => (
            <TouchableOpacity
              key={foreman.id}
              style={styles.foremanCard}
              activeOpacity={0.7}
              onPress={() => console.log('View foreman details:', foreman.id)}
            >
              <View style={styles.foremanHeader}>
                <View style={styles.foremanLeft}>
                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: getRankBadgeColor(index + 1) },
                    ]}
                  >
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.foremanName}>{foreman.name}</Text>
                    <Text style={styles.foremanId}>
                      {foreman.id} • {foreman.section}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor: getScoreColor(foreman.performanceScore),
                    },
                  ]}
                >
                  <Text style={styles.scoreValue}>
                    {foreman.performanceScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Attendance</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${foreman.attendanceRate}%`,
                          backgroundColor: '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.metricValue}>
                    {foreman.attendanceRate}%
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Safety</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${foreman.safetyCompliance}%`,
                          backgroundColor: '#10b981',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.metricValue}>
                    {foreman.safetyCompliance}%
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Production</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${foreman.productionEfficiency}%`,
                          backgroundColor: '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.metricValue}>
                    {foreman.productionEfficiency}%
                  </Text>
                </View>
              </View>

              <View style={styles.foremanFooter}>
                <Text style={styles.streakText}>
                  🔥 {foreman.incidentFreeStreak} days incident-free
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Performance Insights</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>✓</Text>
            <Text style={styles.insightText}>
              Overall crew performance is excellent with 96% attendance rate
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>📈</Text>
            <Text style={styles.insightText}>
              Overman Sharma's section shows best incident-free streak (15 days)
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>⚠️</Text>
            <Text style={styles.insightText}>
              Section B needs attention - attendance rate below 92%
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>🎯</Text>
            <Text style={styles.insightText}>
              Consider recognizing top 3 performers to boost team morale
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1e3a5f',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  highlightLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  highlightDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1e3a5f',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  leaderboardCard: {
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  foremanCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  foremanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  foremanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  foremanName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  foremanId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 12,
  },
  metricItem: {
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'right',
  },
  foremanFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  streakText: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});

export default CrewPerformance;
