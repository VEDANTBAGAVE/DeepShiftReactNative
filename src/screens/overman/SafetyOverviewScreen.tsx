import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type SafetyOverviewScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface Incident {
  id: string;
  sectionName: string;
  reportedBy: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
}

interface FaultyEquipment {
  id: string;
  name: string;
  section: string;
  issue: string;
  severity: 'minor' | 'major' | 'critical';
  reportedBy: string;
}

const SafetyOverviewScreen: React.FC = () => {
  const navigation = useNavigation<SafetyOverviewScreenNavigationProp>();

  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [safetyNoteModalVisible, setSafetyNoteModalVisible] = useState(false);
  const [safetyNote, setSafetyNote] = useState('');

  // Demo data - safety incidents across all sections
  const [incidents] = useState<Incident[]>([
    {
      id: 'INC001',
      sectionName: 'Panel 6-A',
      reportedBy: 'Amit Sharma',
      incidentType: 'Equipment Failure',
      severity: 'high',
      time: '07:45 AM',
      status: 'investigating',
      description: 'Hydraulic support leaked, immediate evacuation performed.',
    },
    {
      id: 'INC002',
      sectionName: 'Panel 5-B',
      reportedBy: 'Suresh Patil',
      incidentType: 'Near Miss',
      severity: 'medium',
      time: '06:30 AM',
      status: 'resolved',
      description: 'Loose rock detected during roof bolting.',
    },
  ]);

  const [faultyEquipment] = useState<FaultyEquipment[]>([
    {
      id: 'EQ001',
      name: 'Pump-03',
      section: 'Panel 5-A',
      issue: 'Unusual noise, possible bearing failure',
      severity: 'major',
      reportedBy: 'Rajesh Kumar',
    },
    {
      id: 'EQ002',
      name: 'Hydraulic Support-8B',
      section: 'Panel 6-A',
      issue: 'Pressure leak detected',
      severity: 'critical',
      reportedBy: 'Amit Sharma',
    },
    {
      id: 'EQ003',
      name: 'Conveyor Belt-4C',
      section: 'Panel 7-A',
      issue: 'Belt tension adjustment needed',
      severity: 'minor',
      reportedBy: 'Ravi Verma',
    },
  ]);

  const [safetyMetrics] = useState({
    totalIncidents: 2,
    openIncidents: 1,
    criticalIncidents: 0,
    safetyInspections: 8,
    complianceRate: 96,
    avgResponseTime: '12 min',
    avgCH4: 0.5, // Average Methane concentration
    ventilationStatus: 'normal',
    faultyEquipmentCount: 3,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
      case 'minor':
        return '#10b981';
      case 'medium':
      case 'major':
        return '#f59e0b';
      case 'high':
      case 'critical':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#ef4444';
      case 'investigating':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const handleIncidentPress = (incidentId: string) => {
    console.log('Opening incident:', incidentId);
    // TODO: Navigate to incident details
  };

  const handleAddSafetyNote = () => {
    if (safetyNote.trim()) {
      Alert.alert(
        'Safety Note Added',
        `Your safety note has been recorded:\n\n"${safetyNote}"`,
      );
      setSafetyNote('');
      setSafetyNoteModalVisible(false);
    }
  };

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
        <Text style={styles.headerTitle}>Safety Overview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Safety Metrics Dashboard */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Safety Metrics</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>🚨</Text>
              <Text style={styles.metricValue}>
                {safetyMetrics.totalIncidents}
              </Text>
              <Text style={styles.metricLabel}>Total Incidents</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>⚠️</Text>
              <Text style={[styles.metricValue, { color: '#ef4444' }]}>
                {safetyMetrics.openIncidents}
              </Text>
              <Text style={styles.metricLabel}>Open</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>🔍</Text>
              <Text style={styles.metricValue}>
                {safetyMetrics.safetyInspections}
              </Text>
              <Text style={styles.metricLabel}>Inspections</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>✓</Text>
              <Text style={[styles.metricValue, { color: '#10b981' }]}>
                {safetyMetrics.complianceRate}%
              </Text>
              <Text style={styles.metricLabel}>Compliance</Text>
            </View>
          </View>

          <View style={styles.responseTimeCard}>
            <Text style={styles.responseTimeLabel}>Avg Response Time</Text>
            <Text style={styles.responseTimeValue}>
              {safetyMetrics.avgResponseTime}
            </Text>
            <Text style={styles.responseTimeStatus}>✓ Within Target</Text>
          </View>
        </View>

        {/* Active Incidents Section */}
        <View style={styles.incidentsContainer}>
          <Text style={styles.sectionTitle}>Active Incidents</Text>

          {incidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>✓</Text>
              <Text style={styles.emptyStateText}>No active incidents</Text>
              <Text style={styles.emptyStateSubtext}>
                All clear! Keep up the good work.
              </Text>
            </View>
          ) : (
            incidents.map(incident => (
              <TouchableOpacity
                key={incident.id}
                style={styles.incidentCard}
                onPress={() => handleIncidentPress(incident.id)}
                activeOpacity={0.7}
              >
                {/* Severity Indicator */}
                <View
                  style={[
                    styles.severityBar,
                    { backgroundColor: getSeverityColor(incident.severity) },
                  ]}
                />

                {/* Incident Header */}
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentHeaderLeft}>
                    <Text style={styles.incidentId}>{incident.id}</Text>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: getSeverityColor(incident.severity),
                        },
                      ]}
                    >
                      <Text style={styles.severityBadgeText}>
                        {incident.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(incident.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {incident.status.charAt(0).toUpperCase() +
                        incident.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Incident Type */}
                <View style={styles.incidentTypeRow}>
                  <Text style={styles.incidentTypeIcon}>⚠️</Text>
                  <Text style={styles.incidentType}>
                    {incident.incidentType}
                  </Text>
                </View>

                {/* Section and Time */}
                <View style={styles.incidentMetaRow}>
                  <Text style={styles.incidentMeta}>
                    📍 {incident.sectionName}
                  </Text>
                  <Text style={styles.incidentMeta}>🕒 {incident.time}</Text>
                </View>

                {/* Reported By */}
                <View style={styles.reportedByRow}>
                  <Text style={styles.reportedByLabel}>Reported by:</Text>
                  <Text style={styles.reportedByName}>
                    {incident.reportedBy}
                  </Text>
                </View>

                {/* Description */}
                <View style={styles.descriptionBox}>
                  <Text style={styles.description} numberOfLines={2}>
                    {incident.description}
                  </Text>
                </View>

                {/* Action Indicator */}
                <View style={styles.viewDetailsRow}>
                  <Text style={styles.viewDetailsText}>
                    Tap to view details
                  </Text>
                  <Text style={styles.viewDetailsArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Compliance Status */}
        <View style={styles.complianceSection}>
          <Text style={styles.sectionTitle}>Compliance Status</Text>

          <View style={styles.complianceCard}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceItemLabel}>
                Safety Permits Valid
              </Text>
              <View style={styles.complianceStatus}>
                <Text style={styles.complianceStatusIcon}>✓</Text>
                <Text style={styles.complianceStatusText}>8/8 Sections</Text>
              </View>
            </View>

            <View style={styles.complianceItem}>
              <Text style={styles.complianceItemLabel}>Daily Inspections</Text>
              <View style={styles.complianceStatus}>
                <Text style={styles.complianceStatusIcon}>✓</Text>
                <Text style={styles.complianceStatusText}>Completed</Text>
              </View>
            </View>

            <View style={styles.complianceItem}>
              <Text style={styles.complianceItemLabel}>Gas Testing</Text>
              <View style={styles.complianceStatus}>
                <Text style={styles.complianceStatusIcon}>✓</Text>
                <Text style={styles.complianceStatusText}>All Clear</Text>
              </View>
            </View>

            <View style={styles.complianceItem}>
              <Text style={styles.complianceItemLabel}>Emergency Drills</Text>
              <View style={styles.complianceStatus}>
                <Text style={styles.complianceStatusIcon}>⏱</Text>
                <Text
                  style={[styles.complianceStatusText, { color: '#f59e0b' }]}
                >
                  Due in 3 days
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gas Readings & Ventilation */}
        <View style={styles.gasReadingsSection}>
          <Text style={styles.sectionTitle}>Gas Readings & Ventilation</Text>

          <View style={styles.gasReadingCard}>
            <Text style={styles.gasIcon}>🌫️</Text>
            <View style={styles.gasContent}>
              <Text style={styles.gasLabel}>Average Methane (CH₄)</Text>
              <View style={styles.gasValueRow}>
                <Text
                  style={[
                    styles.gasValue,
                    {
                      color:
                        safetyMetrics.avgCH4 < 1.0
                          ? '#10b981'
                          : safetyMetrics.avgCH4 < 1.5
                          ? '#f59e0b'
                          : '#ef4444',
                    },
                  ]}
                >
                  {safetyMetrics.avgCH4}%
                </Text>
                <View
                  style={[
                    styles.gasStatusIndicator,
                    {
                      backgroundColor:
                        safetyMetrics.avgCH4 < 1.0
                          ? '#d1fae5'
                          : safetyMetrics.avgCH4 < 1.5
                          ? '#fef3c7'
                          : '#fee2e2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gasStatusText,
                      {
                        color:
                          safetyMetrics.avgCH4 < 1.0
                            ? '#065f46'
                            : safetyMetrics.avgCH4 < 1.5
                            ? '#92400e'
                            : '#991b1b',
                      },
                    ]}
                  >
                    {safetyMetrics.avgCH4 < 1.0
                      ? 'Normal'
                      : safetyMetrics.avgCH4 < 1.5
                      ? 'Warning'
                      : 'Critical'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.ventilationCard}>
            <Text style={styles.ventilationIcon}>💨</Text>
            <View style={styles.ventilationContent}>
              <Text style={styles.ventilationLabel}>Ventilation System</Text>
              <Text style={styles.ventilationValue}>
                {safetyMetrics.ventilationStatus === 'normal'
                  ? '✓ All Systems Operational'
                  : '⚠ Check Required'}
              </Text>
            </View>
            <View
              style={[
                styles.ventilationDot,
                {
                  backgroundColor:
                    safetyMetrics.ventilationStatus === 'normal'
                      ? '#10b981'
                      : '#ef4444',
                },
              ]}
            />
          </View>
        </View>

        {/* Faulty Equipment Summary */}
        <View style={styles.equipmentSection}>
          <View style={styles.equipmentHeader}>
            <Text style={styles.sectionTitle}>Equipment Status</Text>
            <TouchableOpacity
              style={styles.viewListButton}
              onPress={() => setEquipmentModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewListButtonText}>
                View Equipment List →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.equipmentSummaryCard}>
            <View style={styles.equipmentSummaryItem}>
              <Text style={styles.equipmentSummaryIcon}>⚙️</Text>
              <View>
                <Text style={styles.equipmentSummaryValue}>
                  {safetyMetrics.faultyEquipmentCount}
                </Text>
                <Text style={styles.equipmentSummaryLabel}>
                  Issues Identified
                </Text>
              </View>
            </View>
            <View style={styles.equipmentDivider} />
            <View style={styles.equipmentSummaryItem}>
              <Text style={styles.equipmentSummaryIcon}>⚠️</Text>
              <View>
                <Text
                  style={[styles.equipmentSummaryValue, { color: '#ef4444' }]}
                >
                  {
                    faultyEquipment.filter(e => e.severity === 'critical')
                      .length
                  }
                </Text>
                <Text style={styles.equipmentSummaryLabel}>Critical</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={() => setSafetyNoteModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addNoteButtonIcon}>📝</Text>
            <Text style={styles.addNoteButtonText}>Add Safety Note</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Equipment List Modal */}
      <Modal
        visible={equipmentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEquipmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Faulty Equipment List</Text>
              <TouchableOpacity
                onPress={() => setEquipmentModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {faultyEquipment.map(equipment => (
                <View key={equipment.id} style={styles.equipmentModalCard}>
                  <View style={styles.equipmentModalHeader}>
                    <Text style={styles.equipmentModalName}>
                      {equipment.name}
                    </Text>
                    <View
                      style={[
                        styles.equipmentSeverityBadge,
                        {
                          backgroundColor: getSeverityColor(equipment.severity),
                        },
                      ]}
                    >
                      <Text style={styles.equipmentSeverityText}>
                        {equipment.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.equipmentModalSection}>
                    📍 {equipment.section}
                  </Text>
                  <Text style={styles.equipmentModalIssue}>
                    ⚠️ {equipment.issue}
                  </Text>
                  <Text style={styles.equipmentModalReportedBy}>
                    Reported by: {equipment.reportedBy}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Safety Note Modal */}
      <Modal
        visible={safetyNoteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSafetyNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Safety Note</Text>
            <Text style={styles.modalSubtitle}>
              Record important safety observations or concerns
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Enter your safety note here..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={6}
              value={safetyNote}
              onChangeText={setSafetyNote}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSafetyNote('');
                  setSafetyNoteModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitNoteButton]}
                onPress={handleAddSafetyNote}
              >
                <Text style={styles.submitNoteButtonText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsContainer: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  responseTimeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  responseTimeLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  responseTimeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  responseTimeStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  incidentsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  emptyStateIcon: {
    fontSize: 64,
    color: '#10b981',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  incidentCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    position: 'relative',
  },
  severityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  incidentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incidentId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  incidentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incidentTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  incidentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  incidentMeta: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  reportedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportedByLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 6,
  },
  reportedByName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  viewDetailsArrow: {
    fontSize: 16,
    color: '#3b82f6',
  },
  complianceSection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 24,
  },
  complianceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  complianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  complianceItemLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  complianceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  complianceStatusIcon: {
    fontSize: 16,
  },
  complianceStatusText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '700',
  },
  gasReadingsSection: {
    padding: 16,
    paddingTop: 0,
  },
  gasReadingCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  gasIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  gasContent: {
    flex: 1,
  },
  gasLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  gasValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gasValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gasStatusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gasStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ventilationCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  ventilationIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  ventilationContent: {
    flex: 1,
  },
  ventilationLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  ventilationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ventilationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  equipmentSection: {
    padding: 16,
    paddingTop: 0,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewListButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewListButtonText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '700',
  },
  equipmentSummaryCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  equipmentSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  equipmentSummaryIcon: {
    fontSize: 32,
  },
  equipmentSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  equipmentSummaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  equipmentDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  addNoteButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
  },
  addNoteButtonIcon: {
    fontSize: 18,
  },
  addNoteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '300',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  equipmentModalCard: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  equipmentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentModalName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  equipmentSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  equipmentSeverityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  equipmentModalSection: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  equipmentModalIssue: {
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 6,
  },
  equipmentModalReportedBy: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  submitNoteButton: {
    backgroundColor: '#3b82f6',
  },
  submitNoteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default SafetyOverviewScreen;
