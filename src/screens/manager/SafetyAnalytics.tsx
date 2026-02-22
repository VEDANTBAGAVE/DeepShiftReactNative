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
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';

type SafetyAnalyticsNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

const SafetyAnalytics: React.FC = () => {
  const navigation = useNavigation<SafetyAnalyticsNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<
    'week' | 'month' | 'year'
  >('week');

  // Demo data for charts - Updated for react-native-gifted-charts
  const gasLevelData = [
    { value: 0.42, label: 'Mon', dataPointText: '0.42%' },
    { value: 0.38, label: 'Tue', dataPointText: '0.38%' },
    { value: 0.45, label: 'Wed', dataPointText: '0.45%' },
    { value: 0.5, label: 'Thu', dataPointText: '0.50%' },
    { value: 0.48, label: 'Fri', dataPointText: '0.48%' },
    { value: 0.43, label: 'Sat', dataPointText: '0.43%' },
    { value: 0.4, label: 'Sun', dataPointText: '0.40%' },
  ];

  const incidentData = [
    { value: 2, label: 'Mon', frontColor: '#ef4444' },
    { value: 1, label: 'Tue', frontColor: '#ef4444' },
    { value: 3, label: 'Wed', frontColor: '#ef4444' },
    { value: 0, label: 'Thu', frontColor: '#ef4444' },
    { value: 2, label: 'Fri', frontColor: '#ef4444' },
    { value: 1, label: 'Sat', frontColor: '#ef4444' },
    { value: 0, label: 'Sun', frontColor: '#ef4444' },
  ];

  const hazardDistribution = [
    {
      value: 12,
      color: '#3b82f6',
      text: '12',
      label: 'Minor',
    },
    {
      value: 5,
      color: '#f59e0b',
      text: '5',
      label: 'Major',
    },
    {
      value: 2,
      color: '#ef4444',
      text: '2',
      label: 'Critical',
    },
  ];

  const summaryCards = [
    {
      icon: '📊',
      title: 'Average Gas Level (CH₄)',
      value: '0.5%',
      status: 'normal' as const,
      trend: '↓ 0.1%',
    },
    {
      icon: '⚠️',
      title: 'Total Active Incidents',
      value: '4',
      status: 'warning' as const,
      trend: '↑ 2',
    },
    {
      icon: '🚨',
      title: 'Last Critical Alert',
      value: '2 days ago',
      status: 'normal' as const,
      trend: 'Panel A-3',
    },
    {
      icon: '✓',
      title: 'Safety Compliance',
      value: '96%',
      status: 'normal' as const,
      trend: '↑ 2%',
    },
  ];

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(30, 58, 95, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#1e3a5f',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e2e8f0',
    },
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
          <Text style={styles.headerTitle}>Safety Analytics</Text>
          <Text style={styles.headerSubtitle}>Monitor Safety Performance</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          {summaryCards.map((card, index) => (
            <View key={index} style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{card.icon}</Text>
              <Text style={styles.summaryValue}>{card.value}</Text>
              <Text style={styles.summaryTitle}>{card.title}</Text>
              <Text
                style={[
                  styles.summaryTrend,
                  { color: getStatusColor(card.status) },
                ]}
              >
                {card.trend}
              </Text>
            </View>
          ))}
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Time Period:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === 'week' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter('week')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === 'week' && styles.filterButtonTextActive,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === 'month' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter('month')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === 'month' && styles.filterButtonTextActive,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === 'year' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter('year')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === 'year' && styles.filterButtonTextActive,
                ]}
              >
                Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gas Level Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            📈 CH₄ Gas Level Trend (% Volume)
          </Text>
          <Text style={styles.chartSubtitle}>Last 7 days average readings</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={gasLevelData}
              height={220}
              width={chartWidth - 60}
              color="#f59e0b"
              thickness={3}
              curved
              areaChart
              startFillColor="#f59e0b"
              startOpacity={0.3}
              endFillColor="#fff"
              endOpacity={0.1}
              initialSpacing={20}
              spacing={40}
              yAxisColor="#cbd5e1"
              xAxisColor="#cbd5e1"
              hideRules
              yAxisTextStyle={{ color: '#64748b', fontSize: 11 }}
              xAxisLabelTextStyle={{ color: '#64748b', fontSize: 11 }}
              showVerticalLines={false}
              dataPointsColor="#f59e0b"
              dataPointsRadius={5}
              textShiftY={-8}
              textShiftX={-5}
              textFontSize={10}
              textColor="#92400e"
              noOfSections={4}
              maxValue={0.6}
            />
          </View>
          <Text style={styles.chartNote}>
            ⚠️ Safe limit: Below 1.0% • Current average: 0.44%
          </Text>
        </View>

        {/* Daily Incident Count Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Daily Incident Count</Text>
          <Text style={styles.chartSubtitle}>
            Reported incidents per day (last 7 days)
          </Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={incidentData}
              height={220}
              width={chartWidth - 60}
              barWidth={32}
              spacing={24}
              initialSpacing={20}
              roundedTop
              roundedBottom
              yAxisColor="#cbd5e1"
              xAxisColor="#cbd5e1"
              hideRules
              yAxisTextStyle={{ color: '#64748b', fontSize: 11 }}
              xAxisLabelTextStyle={{ color: '#64748b', fontSize: 11 }}
              noOfSections={3}
              maxValue={4}
            />
          </View>
          <View style={styles.incidentSummary}>
            <View style={styles.incidentSummaryItem}>
              <Text style={styles.incidentSummaryLabel}>Total:</Text>
              <Text style={styles.incidentSummaryValue}>9 incidents</Text>
            </View>
            <View style={styles.incidentSummaryItem}>
              <Text style={styles.incidentSummaryLabel}>Average:</Text>
              <Text style={styles.incidentSummaryValue}>1.3 per day</Text>
            </View>
          </View>
        </View>

        {/* Hazard Distribution Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🥧 Hazard Severity Distribution</Text>
          <Text style={styles.chartSubtitle}>
            Breakdown by severity level (this month)
          </Text>
          <View style={[styles.chartContainer, { alignItems: 'center' }]}>
            <PieChart
              data={hazardDistribution}
              donut
              radius={100}
              innerRadius={60}
              innerCircleColor="#fff"
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#1e293b',
                    }}
                  >
                    19
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Total</Text>
                </View>
              )}
            />
          </View>
          <View style={styles.hazardSummary}>
            <View style={styles.hazardItem}>
              <View
                style={[styles.hazardDot, { backgroundColor: '#3b82f6' }]}
              />
              <Text style={styles.hazardText}>Minor: 12 (63%)</Text>
            </View>
            <View style={styles.hazardItem}>
              <View
                style={[styles.hazardDot, { backgroundColor: '#f59e0b' }]}
              />
              <Text style={styles.hazardText}>Major: 5 (26%)</Text>
            </View>
            <View style={styles.hazardItem}>
              <View
                style={[styles.hazardDot, { backgroundColor: '#ef4444' }]}
              />
              <Text style={styles.hazardText}>Critical: 2 (11%)</Text>
            </View>
          </View>
        </View>

        {/* Safety Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Key Safety Insights</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>✓</Text>
            <Text style={styles.insightText}>
              Gas levels have remained stable below safe threshold throughout
              the week
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>⚠️</Text>
            <Text style={styles.insightText}>
              Wednesday showed a slight spike in incidents - investigate shift
              conditions
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>📉</Text>
            <Text style={styles.insightText}>
              Overall incident trend is decreasing compared to last month (-15%)
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>🎯</Text>
            <Text style={styles.insightText}>
              Panel A-3 requires additional safety monitoring after recent
              critical alert
            </Text>
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsCard}>
          <Text style={styles.alertsTitle}>🔔 Recent Safety Alerts</Text>
          <View style={styles.alertItem}>
            <View style={[styles.alertBadge, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.alertBadgeText}>Critical</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                High CH₄ Concentration Detected
              </Text>
              <Text style={styles.alertDetails}>
                Panel A-3 • 2 days ago • Resolved
              </Text>
            </View>
          </View>
          <View style={styles.alertItem}>
            <View style={[styles.alertBadge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.alertBadgeText}>Warning</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                Ventilation System Fluctuation
              </Text>
              <Text style={styles.alertDetails}>
                Panel B-1 • 4 days ago • Monitoring
              </Text>
            </View>
          </View>
          <View style={styles.alertItem}>
            <View style={[styles.alertBadge, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.alertBadgeText}>Info</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Scheduled Safety Inspection</Text>
              <Text style={styles.alertDetails}>
                All Panels • 6 days ago • Completed
              </Text>
            </View>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 6,
  },
  summaryTrend: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterBar: {
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
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartContainer: {
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  chartNote: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  incidentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  incidentSummaryItem: {
    alignItems: 'center',
  },
  incidentSummaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  incidentSummaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  hazardSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  hazardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hazardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  hazardText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
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
    borderLeftColor: '#10b981',
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
  alertsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  alertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  alertDetails: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default SafetyAnalytics;
