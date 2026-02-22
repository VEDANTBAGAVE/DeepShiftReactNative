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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ShiftLogDetailNavigationProp = StackNavigationProp<RootStackParamList>;
type ShiftLogDetailRouteProp = RouteProp<RootStackParamList, 'ShiftLogDetail'>;

interface CrewAttendance {
  totalWorkers: number;
  present: number;
  absent: number;
  lateArrivals: number;
}

interface Equipment {
  id: string;
  name: string;
  status: 'Functional' | 'Maintenance Required' | 'Faulty';
  location: string;
}

interface SafetyReading {
  ch4: string;
  o2: string;
  co: string;
  ventilation: string;
  temperature: string;
}

interface Incident {
  type: string;
  severity: 'Minor' | 'Major' | 'Critical';
  description: string;
  time: string;
}

const ShiftLogDetail: React.FC = () => {
  const navigation = useNavigation<ShiftLogDetailNavigationProp>();
  const route = useRoute<ShiftLogDetailRouteProp>();

  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [clarificationModalVisible, setClarificationModalVisible] =
    useState(false);
  const [clarificationText, setClarificationText] = useState('');

  // Demo data for shift log
  const shiftLog = {
    id: 'SR-001',
    date: 'October 25, 2025',
    dayOfWeek: 'Saturday',
    shiftType: 'Morning Shift',
    shiftTime: '06:00 AM - 02:00 PM',
    area: 'Panel A-3',
    overmanName: 'Rajesh Patil',
    overmanId: 'OVM-105',
    submittedAt: '14:05',
    status: 'Submitted',

    crewAttendance: {
      totalWorkers: 26,
      present: 24,
      absent: 2,
      lateArrivals: 1,
    } as CrewAttendance,

    equipment: [
      {
        id: 'PUMP-03',
        name: 'Water Pump 3',
        status: 'Maintenance Required',
        location: 'Section A',
      },
      {
        id: 'DRILL-02',
        name: 'Drill Machine 2',
        status: 'Functional',
        location: 'Section B',
      },
      {
        id: 'VENT-01',
        name: 'Ventilation Fan 1',
        status: 'Functional',
        location: 'Main Tunnel',
      },
      {
        id: 'CONV-05',
        name: 'Conveyor Belt 5',
        status: 'Functional',
        location: 'Section C',
      },
      {
        id: 'DRILL-07',
        name: 'Drill Machine 7',
        status: 'Faulty',
        location: 'Section A',
      },
    ] as Equipment[],

    safetyReadings: {
      ch4: '0.45%',
      o2: '20.5%',
      co: '15 ppm',
      ventilation: 'OK',
      temperature: '28°C',
    } as SafetyReading,

    incidents: [
      {
        type: 'Minor Injury',
        severity: 'Minor',
        description: 'Worker slipped near conveyor belt, minor bruise on arm',
        time: '09:30 AM',
      },
      {
        type: 'Equipment Malfunction',
        severity: 'Major',
        description:
          'Pump-03 sudden pressure drop, stopped operation for inspection',
        time: '11:15 AM',
      },
    ] as Incident[],

    productionMetrics: {
      targetTonnage: 450,
      achievedTonnage: 441,
      percentage: 98,
    },

    overmanRemarks:
      'Shift completed with minor delays due to equipment maintenance. Pump-03 requires immediate attention. All safety protocols followed. Worker injury was treated on-site by medical team. Overall production target nearly met despite equipment downtime.',
  };

  const getEquipmentStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'Functional':
        return '#10b981';
      case 'Maintenance Required':
        return '#f59e0b';
      case 'Faulty':
        return '#ef4444';
    }
  };

  const getIncidentSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'Minor':
        return '#3b82f6';
      case 'Major':
        return '#f59e0b';
      case 'Critical':
        return '#ef4444';
    }
  };

  const handleApprove = () => {
    setApproveModalVisible(true);
    // TODO: API call to approve shift log
  };

  const handleRequestClarification = () => {
    setClarificationModalVisible(true);
  };

  const handleSendClarification = () => {
    if (clarificationText.trim()) {
      console.log('Sending clarification:', clarificationText);
      // TODO: API call to send clarification request
      setClarificationModalVisible(false);
      setClarificationText('');
      // Show success message
    }
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
          <Text style={styles.headerTitle}>Shift Log Detail</Text>
          <Text style={styles.headerSubtitle}>{shiftLog.id}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shift Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shift Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{shiftLog.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Day:</Text>
              <Text style={styles.infoValue}>{shiftLog.dayOfWeek}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shift Type:</Text>
              <Text style={styles.infoValue}>{shiftLog.shiftType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shift Time:</Text>
              <Text style={styles.infoValue}>{shiftLog.shiftTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Area:</Text>
              <Text style={styles.infoValue}>{shiftLog.area}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Overman:</Text>
              <Text style={styles.infoValue}>{shiftLog.overmanName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Overman ID:</Text>
              <Text style={styles.infoValue}>{shiftLog.overmanId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted:</Text>
              <Text style={styles.infoValue}>{shiftLog.submittedAt}</Text>
            </View>
          </View>
        </View>

        {/* Crew Attendance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👥 Crew Attendance</Text>
          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceNumber}>
                {shiftLog.crewAttendance.totalWorkers}
              </Text>
              <Text style={styles.attendanceLabel}>Total Workers</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={[styles.attendanceNumber, styles.presentNumber]}>
                {shiftLog.crewAttendance.present}
              </Text>
              <Text style={styles.attendanceLabel}>Present</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={[styles.attendanceNumber, styles.absentNumber]}>
                {shiftLog.crewAttendance.absent}
              </Text>
              <Text style={styles.attendanceLabel}>Absent</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={[styles.attendanceNumber, styles.lateNumber]}>
                {shiftLog.crewAttendance.lateArrivals}
              </Text>
              <Text style={styles.attendanceLabel}>Late</Text>
            </View>
          </View>
        </View>

        {/* Equipment Performance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Equipment Performance</Text>
          {shiftLog.equipment.map(item => (
            <View key={item.id} style={styles.equipmentItem}>
              <View style={styles.equipmentHeader}>
                <Text style={styles.equipmentId}>{item.id}</Text>
                <View
                  style={[
                    styles.equipmentStatusBadge,
                    { backgroundColor: getEquipmentStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.equipmentStatusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.equipmentName}>{item.name}</Text>
              <Text style={styles.equipmentLocation}>📍 {item.location}</Text>
            </View>
          ))}
        </View>

        {/* Safety Readings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Safety Readings</Text>
          <View style={styles.safetyGrid}>
            <View style={styles.safetyItem}>
              <Text style={styles.safetyLabel}>Average CH₄ Reading</Text>
              <Text style={styles.safetyValue}>
                {shiftLog.safetyReadings.ch4}
              </Text>
            </View>
            <View style={styles.safetyDivider} />
            <View style={styles.safetyItem}>
              <Text style={styles.safetyLabel}>O₂ Level</Text>
              <Text style={styles.safetyValue}>
                {shiftLog.safetyReadings.o2}
              </Text>
            </View>
            <View style={styles.safetyDivider} />
            <View style={styles.safetyItem}>
              <Text style={styles.safetyLabel}>CO Level</Text>
              <Text style={styles.safetyValue}>
                {shiftLog.safetyReadings.co}
              </Text>
            </View>
            <View style={styles.safetyDivider} />
            <View style={styles.safetyItem}>
              <Text style={styles.safetyLabel}>Ventilation</Text>
              <Text style={[styles.safetyValue, styles.ventilationOk]}>
                {shiftLog.safetyReadings.ventilation}
              </Text>
            </View>
            <View style={styles.safetyDivider} />
            <View style={styles.safetyItem}>
              <Text style={styles.safetyLabel}>Temperature</Text>
              <Text style={styles.safetyValue}>
                {shiftLog.safetyReadings.temperature}
              </Text>
            </View>
          </View>
        </View>

        {/* Incident Reports Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ⚠️ Incident Reports ({shiftLog.incidents.length})
          </Text>
          {shiftLog.incidents.map((incident, index) => (
            <View key={index} style={styles.incidentItem}>
              <View style={styles.incidentHeader}>
                <Text style={styles.incidentType}>{incident.type}</Text>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor: getIncidentSeverityColor(
                        incident.severity,
                      ),
                    },
                  ]}
                >
                  <Text style={styles.severityText}>{incident.severity}</Text>
                </View>
              </View>
              <Text style={styles.incidentDescription}>
                {incident.description}
              </Text>
              <Text style={styles.incidentTime}>🕐 {incident.time}</Text>
            </View>
          ))}
        </View>

        {/* Production Metrics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Production Metrics</Text>
          <View style={styles.productionRow}>
            <Text style={styles.productionLabel}>Target Tonnage:</Text>
            <Text style={styles.productionValue}>
              {shiftLog.productionMetrics.targetTonnage} tons
            </Text>
          </View>
          <View style={styles.productionRow}>
            <Text style={styles.productionLabel}>Achieved:</Text>
            <Text style={styles.productionValue}>
              {shiftLog.productionMetrics.achievedTonnage} tons
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${shiftLog.productionMetrics.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>
            {shiftLog.productionMetrics.percentage}% of target achieved
          </Text>
        </View>

        {/* Overman Remarks Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Overman Remarks</Text>
          <Text style={styles.remarksText}>{shiftLog.overmanRemarks}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={handleApprove}
            activeOpacity={0.7}
          >
            <Text style={styles.approveButtonText}>✓ Approve Shift Log</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clarificationButton}
            onPress={handleRequestClarification}
            activeOpacity={0.7}
          >
            <Text style={styles.clarificationButtonText}>
              ? Request Clarification
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Approve Success Modal */}
      <Modal
        visible={approveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setApproveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Shift Approved Successfully</Text>
            <Text style={styles.successMessage}>
              The shift log has been approved and will be recorded in the
              system.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setApproveModalVisible(false);
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clarification Request Modal */}
      <Modal
        visible={clarificationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClarificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clarificationModal}>
            <Text style={styles.clarificationTitle}>Request Clarification</Text>
            <Text style={styles.clarificationSubtitle}>
              Send feedback to Overman {shiftLog.overmanName}
            </Text>
            <TextInput
              style={styles.clarificationInput}
              placeholder="Type your clarification request..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={6}
              value={clarificationText}
              onChangeText={setClarificationText}
              textAlignVertical="top"
            />
            <Text style={styles.charCounter}>
              {clarificationText.length} / 500 characters
            </Text>
            <View style={styles.clarificationActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setClarificationModalVisible(false);
                  setClarificationText('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !clarificationText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSendClarification}
                disabled={!clarificationText.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>Send Request</Text>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a5f',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  attendanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  presentNumber: {
    color: '#10b981',
  },
  absentNumber: {
    color: '#ef4444',
  },
  lateNumber: {
    color: '#f59e0b',
  },
  attendanceLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  equipmentItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  equipmentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  equipmentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  equipmentLocation: {
    fontSize: 13,
    color: '#64748b',
  },
  safetyGrid: {
    gap: 12,
  },
  safetyItem: {
    paddingVertical: 8,
  },
  safetyLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  safetyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ventilationOk: {
    color: '#10b981',
  },
  safetyDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  incidentItem: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  incidentTime: {
    fontSize: 12,
    color: '#64748b',
  },
  productionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  productionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },
  remarksText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  approveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  clarificationButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  clarificationButtonText: {
    fontSize: 16,
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
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  clarificationModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    elevation: 5,
  },
  clarificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  clarificationSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  clarificationInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 150,
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: 20,
  },
  clarificationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ShiftLogDetail;
