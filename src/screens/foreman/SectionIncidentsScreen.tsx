import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type SectionIncidentsScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

// Sample incident data for UI/UX preview
const SAMPLE_INCIDENTS = [
  {
    id: '1',
    title: 'Equipment Malfunction',
    description: 'Drill-02 overheating during operation',
    severity: 'high',
    status: 'open',
    reportedBy: 'Rajesh Kumar',
    reportedAt: '2025-10-26T09:15:00',
    location: 'Panel 5-A, Section 3',
  },
  {
    id: '2',
    title: 'Safety Hazard',
    description: 'Loose roof bolts detected in tunnel section',
    severity: 'critical',
    status: 'investigating',
    reportedBy: 'Amit Singh',
    reportedAt: '2025-10-26T07:30:00',
    location: 'Panel 5-A, Section 1',
  },
  {
    id: '3',
    title: 'Minor Injury',
    description: 'Worker hand bruise from equipment handling',
    severity: 'low',
    status: 'resolved',
    reportedBy: 'Vikram Patel',
    reportedAt: '2025-10-25T14:45:00',
    location: 'Panel 5-A, Section 2',
  },
  {
    id: '4',
    title: 'Water Seepage',
    description: 'Excessive water accumulation in working area',
    severity: 'medium',
    status: 'open',
    reportedBy: 'Suresh Yadav',
    reportedAt: '2025-10-26T08:00:00',
    location: 'Panel 5-A, Section 4',
  },
];

const SectionIncidentsScreen: React.FC = () => {
  const navigation = useNavigation<SectionIncidentsScreenNavigationProp>();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#ef4444';
      case 'investigating':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredIncidents = SAMPLE_INCIDENTS.filter(incident => {
    if (filter === 'all') return true;
    if (filter === 'open') return incident.status !== 'resolved';
    if (filter === 'resolved') return incident.status === 'resolved';
    return true;
  });

  const openCount = SAMPLE_INCIDENTS.filter(
    i => i.status !== 'resolved',
  ).length;
  const resolvedCount = SAMPLE_INCIDENTS.filter(
    i => i.status === 'resolved',
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Section Incidents</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{SAMPLE_INCIDENTS.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>
            {openCount}
          </Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>
            {resolvedCount}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All ({SAMPLE_INCIDENTS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'open' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('open')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'open' && styles.filterTabTextActive,
            ]}
          >
            Open ({openCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'resolved' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('resolved')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'resolved' && styles.filterTabTextActive,
            ]}
          >
            Resolved ({resolvedCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Preview Notice */}
        <View style={styles.previewNotice}>
          <Text style={styles.previewIcon}>👁️</Text>
          <Text style={styles.previewText}>
            UI Preview: Sample incident data shown for design purposes
          </Text>
        </View>

        {/* Incident List */}
        {filteredIncidents.map(incident => (
          <TouchableOpacity
            key={incident.id}
            style={styles.incidentCard}
            activeOpacity={0.7}
          >
            {/* Severity Bar */}
            <View
              style={[
                styles.severityBar,
                { backgroundColor: getSeverityColor(incident.severity) },
              ]}
            />

            {/* Card Content */}
            <View style={styles.incidentContent}>
              {/* Header Row */}
              <View style={styles.incidentHeader}>
                <View style={styles.incidentTitleRow}>
                  <Text style={styles.incidentIcon}>⚠️</Text>
                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBadgeColor(incident.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {incident.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.incidentDescription}>
                {incident.description}
              </Text>

              {/* Location */}
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{incident.location}</Text>
              </View>

              {/* Reporter & Time */}
              <View style={styles.footerRow}>
                <View style={styles.reporterInfo}>
                  <Text style={styles.reporterIcon}>👤</Text>
                  <Text style={styles.reporterText}>{incident.reportedBy}</Text>
                </View>
                <Text style={styles.timeText}>
                  {formatTime(incident.reportedAt)}
                </Text>
              </View>

              {/* Severity Indicator */}
              <View style={styles.severityTag}>
                <View
                  style={[
                    styles.severityDot,
                    { backgroundColor: getSeverityColor(incident.severity) },
                  ]}
                />
                <Text
                  style={[
                    styles.severityText,
                    { color: getSeverityColor(incident.severity) },
                  ]}
                >
                  {incident.severity.toUpperCase()} SEVERITY
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add New Incident Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Report New Incident</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e3a5f',
    elevation: 4,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 70,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statBox: {
    alignItems: 'center',
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  previewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  previewIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  incidentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  severityBar: {
    height: 4,
    width: '100%',
  },
  incidentContent: {
    padding: 16,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  incidentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  reporterText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  severityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SectionIncidentsScreen;
