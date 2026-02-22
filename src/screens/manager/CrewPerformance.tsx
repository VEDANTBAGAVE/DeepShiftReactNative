import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

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

  // Demo data
  const overallStats = {
    totalWorkers: 78,
    activeForemen: 5,
    attendanceRate: 96,
    avgSafetyScore: 94,
  };

  const highlights = {
    mostPunctualSection: 'Panel A-3',
    highestStreakDays: 7,
    topPerformer: 'Overman Patil',
    lowestIncidentSection: 'Panel B-1',
  };

  const foremanData: ForemanPerformance[] = [
    {
      id: 'OVM-105',
      name: 'Rajesh Patil',
      section: 'Panel A-3',
      performanceScore: 95,
      attendanceRate: 98,
      incidentFreeStreak: 12,
      safetyCompliance: 96,
      productionEfficiency: 102,
      rank: 1,
    },
    {
      id: 'OVM-112',
      name: 'Amit Sharma',
      section: 'Panel B-1',
      performanceScore: 92,
      attendanceRate: 96,
      incidentFreeStreak: 15,
      safetyCompliance: 95,
      productionEfficiency: 98,
      rank: 2,
    },
    {
      id: 'OVM-108',
      name: 'Vijay Kumar',
      section: 'Panel A-2',
      performanceScore: 89,
      attendanceRate: 94,
      incidentFreeStreak: 8,
      safetyCompliance: 92,
      productionEfficiency: 95,
      rank: 3,
    },
    {
      id: 'FOR-045',
      name: 'Suresh Singh',
      section: 'Section C',
      performanceScore: 86,
      attendanceRate: 93,
      incidentFreeStreak: 10,
      safetyCompliance: 90,
      productionEfficiency: 92,
      rank: 4,
    },
    {
      id: 'FOR-032',
      name: 'Ramesh Das',
      section: 'Section B',
      performanceScore: 84,
      attendanceRate: 91,
      incidentFreeStreak: 6,
      safetyCompliance: 88,
      productionEfficiency: 90,
      rank: 5,
    },
  ];

  const getSortedData = () => {
    const sorted = [...foremanData];
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
