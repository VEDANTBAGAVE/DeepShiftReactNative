import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type CreateShiftLogScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const CreateShiftLogScreen: React.FC = () => {
  const navigation = useNavigation<CreateShiftLogScreenNavigationProp>();

  const [remarks, setRemarks] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Demo data - Summary compiled from all sections
  const shiftSummary = {
    date: 'October 27, 2025',
    shiftType: 'Morning Shift',
    shiftTime: '06:00 AM - 02:00 PM',
    totalSections: 8,
    sectionsReviewed: 8,
    totalWorkers: 56,
    workersPresent: 51,
    workersAbsent: 5,
    totalIncidents: 2,
    criticalIncidents: 0,
    equipmentIssues: 3,
    safetyScore: 92,
    productionAchieved: 91,
    coalExtracted: '1,145 tons',
    targetCoal: '1,260 tons',
  };

  const handleSubmitShiftLog = () => {
    setSuccessModalVisible(true);
    setTimeout(() => {
      setSuccessModalVisible(false);
      // In real app: Navigate back to dashboard or submitted logs
      navigation.goBack();
    }, 2500);
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
        <Text style={styles.headerTitle}>Create Shift Log</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Finalize Shift Report</Text>
          <Text style={styles.pageSubtitle}>
            Review the compiled data and add your remarks before submission
          </Text>
        </View>

        {/* Basic Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>📅 Shift Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{shiftSummary.date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift Type</Text>
            <Text style={styles.infoValue}>{shiftSummary.shiftType}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift Time</Text>
            <Text style={styles.infoValue}>{shiftSummary.shiftTime}</Text>
          </View>
        </View>

        {/* Section Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📊 Section Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>
                {shiftSummary.totalSections}
              </Text>
              <Text style={styles.summaryLabel}>Total Sections</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
                {shiftSummary.sectionsReviewed}
              </Text>
              <Text style={styles.summaryLabel}>Reviewed</Text>
            </View>
          </View>
        </View>

        {/* Workers Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>👥 Workers Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>
                {shiftSummary.totalWorkers}
              </Text>
              <Text style={styles.summaryLabel}>Total Workers</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryNumber, { color: '#10b981' }]}>
                {shiftSummary.workersPresent}
              </Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text
                style={[
                  styles.summaryNumber,
                  {
                    color:
                      shiftSummary.workersAbsent > 0 ? '#f59e0b' : '#64748b',
                  },
                ]}
              >
                {shiftSummary.workersAbsent}
              </Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
          </View>
        </View>

        {/* Safety Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>🛡️ Safety Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryBox}>
              <Text
                style={[
                  styles.summaryNumber,
                  {
                    color:
                      shiftSummary.totalIncidents === 0 ? '#10b981' : '#ef4444',
                  },
                ]}
              >
                {shiftSummary.totalIncidents}
              </Text>
              <Text style={styles.summaryLabel}>Total Incidents</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text
                style={[
                  styles.summaryNumber,
                  {
                    color:
                      shiftSummary.criticalIncidents === 0
                        ? '#10b981'
                        : '#ef4444',
                  },
                ]}
              >
                {shiftSummary.criticalIncidents}
              </Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text
                style={[
                  styles.summaryNumber,
                  {
                    color:
                      shiftSummary.equipmentIssues === 0
                        ? '#10b981'
                        : '#f59e0b',
                  },
                ]}
              >
                {shiftSummary.equipmentIssues}
              </Text>
              <Text style={styles.summaryLabel}>Equipment Issues</Text>
            </View>
          </View>

          {/* Safety Score */}
          <View style={styles.safetyScoreContainer}>
            <Text style={styles.safetyScoreLabel}>Overall Safety Score</Text>
            <View style={styles.safetyScoreBox}>
              <Text
                style={[
                  styles.safetyScoreValue,
                  {
                    color:
                      shiftSummary.safetyScore >= 90
                        ? '#10b981'
                        : shiftSummary.safetyScore >= 75
                        ? '#f59e0b'
                        : '#ef4444',
                  },
                ]}
              >
                {shiftSummary.safetyScore}%
              </Text>
              <Text style={styles.safetyScoreStatus}>
                {shiftSummary.safetyScore >= 90
                  ? '✓ Excellent'
                  : shiftSummary.safetyScore >= 75
                  ? '⚠ Good'
                  : '⚠ Needs Attention'}
              </Text>
            </View>
          </View>
        </View>

        {/* Production Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>⛏️ Production Summary</Text>
          <View style={styles.productionContainer}>
            <View style={styles.productionItem}>
              <Text style={styles.productionLabel}>Coal Extracted</Text>
              <Text style={styles.productionValue}>
                {shiftSummary.coalExtracted}
              </Text>
            </View>
            <View style={styles.productionItem}>
              <Text style={styles.productionLabel}>Target Coal</Text>
              <Text style={styles.productionValue}>
                {shiftSummary.targetCoal}
              </Text>
            </View>
          </View>

          <View style={styles.achievementContainer}>
            <Text style={styles.achievementLabel}>Target Achievement</Text>
            <View style={styles.achievementBarContainer}>
              <View
                style={[
                  styles.achievementBar,
                  {
                    width: `${Math.min(shiftSummary.productionAchieved, 100)}%`,
                    backgroundColor:
                      shiftSummary.productionAchieved >= 100
                        ? '#10b981'
                        : shiftSummary.productionAchieved >= 80
                        ? '#3b82f6'
                        : '#f59e0b',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.achievementPercent,
                {
                  color:
                    shiftSummary.productionAchieved >= 100
                      ? '#10b981'
                      : shiftSummary.productionAchieved >= 80
                      ? '#3b82f6'
                      : '#f59e0b',
                },
              ]}
            >
              {shiftSummary.productionAchieved}%
            </Text>
          </View>
        </View>

        {/* Remarks Section */}
        <View style={styles.remarksCard}>
          <Text style={styles.cardTitle}>💬 Add Remarks</Text>
          <Text style={styles.remarksSubtitle}>
            Add your observations, comments, or special notes for this shift
          </Text>
          <TextInput
            style={styles.remarksInput}
            placeholder="Enter your remarks here... (e.g., overall shift performance, special observations, recommendations for next shift)"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={8}
            value={remarks}
            onChangeText={setRemarks}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{remarks.length} characters</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitShiftLog}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>📤 Submit Shift Log</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text style={styles.successTitle}>
              Shift Log Submitted Successfully
            </Text>
            <Text style={styles.successMessage}>
              Your shift report has been compiled and submitted to management.
            </Text>
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
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  safetyScoreContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  safetyScoreLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  safetyScoreBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  safetyScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  safetyScoreStatus: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  productionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productionItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productionLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  productionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  achievementContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  achievementLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 10,
  },
  achievementBarContainer: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  achievementBar: {
    height: '100%',
    borderRadius: 5,
  },
  achievementPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  remarksCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  remarksSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 16,
  },
  remarksInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    lineHeight: 20,
  },
  characterCount: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    elevation: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCheckmark: {
    fontSize: 48,
    color: '#10b981',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CreateShiftLogScreen;
