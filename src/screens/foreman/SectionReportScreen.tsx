import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type SectionReportScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const SectionReportScreen: React.FC = () => {
  const navigation = useNavigation<SectionReportScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);

  // Form Data State
  const [formData, setFormData] = useState({
    // Step 1: Report Details
    date: new Date().toISOString().split('T')[0],
    shift: 'Morning Shift',
    section: 'Panel 5-A',
    foremanName: 'Rajesh Kumar',

    // Step 2: Crew Summary
    crewPresent: '7',
    crewAbsent: '1',
    crewLate: '0',
    crewEarlyDeparture: '0',
    crewRemarks: '',

    // Step 3: Equipment Status
    equipmentOperational: '5',
    equipmentMaintenance: '1',
    equipmentBreakdown: '0',
    equipmentNotes: '',

    // Step 4: Safety & Environment
    safetyChecksCompleted: 'Yes',
    incidentsReported: '0',
    hazardsIdentified: '0',
    airQuality: 'Good',
    safetyRemarks: '',

    // Step 5: Work Progress
    productionTarget: '50',
    productionActual: '45',
    workDelays: '',
    progressRemarks: '',

    // Step 6: Permits & Compliance
    permitsValid: 'Yes',
    inspectionsDone: 'Yes',
    violationsFound: '0',
    complianceNotes: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Report',
      'Are you sure you want to submit this section report to the Overman?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'default',
          onPress: () => {
            Alert.alert('Success', 'Section report submitted successfully!');
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your report has been saved as a draft.');
  };

  const renderStep1 = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📋</Text>
        <View>
          <Text style={styles.sectionTitle}>Step 1: Report Details</Text>
          <Text style={styles.sectionDescription}>
            Basic report information
          </Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Date *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.date}
          onChangeText={value => updateField('date', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Shift *</Text>
        <View style={styles.radioGroup}>
          {['Morning Shift', 'Evening Shift', 'Night Shift'].map(shift => (
            <TouchableOpacity
              key={shift}
              style={[
                styles.radioButton,
                formData.shift === shift && styles.radioButtonActive,
              ]}
              onPress={() => updateField('shift', shift)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.shift === shift && styles.radioTextActive,
                ]}
              >
                {shift}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Section *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.section}
          onChangeText={value => updateField('section', value)}
          placeholder="e.g., Panel 5-A"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Foreman Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.foremanName}
          onChangeText={value => updateField('foremanName', value)}
          placeholder="Enter foreman name"
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>👷</Text>
        <View>
          <Text style={styles.sectionTitle}>Step 2: Crew Summary</Text>
          <Text style={styles.sectionDescription}>
            Workforce attendance details
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Present</Text>
          <TextInput
            style={styles.statInput}
            value={formData.crewPresent}
            onChangeText={value => updateField('crewPresent', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Absent</Text>
          <TextInput
            style={styles.statInput}
            value={formData.crewAbsent}
            onChangeText={value => updateField('crewAbsent', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Late Arrivals</Text>
          <TextInput
            style={styles.statInput}
            value={formData.crewLate}
            onChangeText={value => updateField('crewLate', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Early Departures</Text>
          <TextInput
            style={styles.statInput}
            value={formData.crewEarlyDeparture}
            onChangeText={value => updateField('crewEarlyDeparture', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Additional Remarks</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.crewRemarks}
          onChangeText={value => updateField('crewRemarks', value)}
          placeholder="Any attendance-related notes..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>🔧</Text>
        <View>
          <Text style={styles.sectionTitle}>Step 3: Equipment Status</Text>
          <Text style={styles.sectionDescription}>
            Equipment condition report
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Operational</Text>
          <TextInput
            style={styles.statInput}
            value={formData.equipmentOperational}
            onChangeText={value => updateField('equipmentOperational', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Under Maintenance</Text>
          <TextInput
            style={styles.statInput}
            value={formData.equipmentMaintenance}
            onChangeText={value => updateField('equipmentMaintenance', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Breakdown Count</Text>
        <TextInput
          style={styles.textInput}
          value={formData.equipmentBreakdown}
          onChangeText={value => updateField('equipmentBreakdown', value)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Equipment Notes</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.equipmentNotes}
          onChangeText={value => updateField('equipmentNotes', value)}
          placeholder="Describe any equipment issues, maintenance needs..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>⚠️</Text>
        <View>
          <Text style={styles.sectionTitle}>Step 4: Safety & Environment</Text>
          <Text style={styles.sectionDescription}>
            Safety compliance status
          </Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Safety Checks Completed? *</Text>
        <View style={styles.radioGroup}>
          {['Yes', 'No', 'Partial'].map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioButton,
                formData.safetyChecksCompleted === option &&
                  styles.radioButtonActive,
              ]}
              onPress={() => updateField('safetyChecksCompleted', option)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.safetyChecksCompleted === option &&
                    styles.radioTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Incidents Reported</Text>
          <TextInput
            style={styles.statInput}
            value={formData.incidentsReported}
            onChangeText={value => updateField('incidentsReported', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Hazards Identified</Text>
          <TextInput
            style={styles.statInput}
            value={formData.hazardsIdentified}
            onChangeText={value => updateField('hazardsIdentified', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Air Quality</Text>
        <View style={styles.radioGroup}>
          {['Good', 'Fair', 'Poor'].map(quality => (
            <TouchableOpacity
              key={quality}
              style={[
                styles.radioButton,
                formData.airQuality === quality && styles.radioButtonActive,
              ]}
              onPress={() => updateField('airQuality', quality)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.airQuality === quality && styles.radioTextActive,
                ]}
              >
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Safety Remarks</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.safetyRemarks}
          onChangeText={value => updateField('safetyRemarks', value)}
          placeholder="Safety concerns, near misses, corrective actions..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📊</Text>
        <View>
          <Text style={styles.sectionTitle}>Step 5: Work Progress</Text>
          <Text style={styles.sectionDescription}>Production metrics</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Target (tons)</Text>
          <TextInput
            style={styles.statInput}
            value={formData.productionTarget}
            onChangeText={value => updateField('productionTarget', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Actual (tons)</Text>
          <TextInput
            style={styles.statInput}
            value={formData.productionActual}
            onChangeText={value => updateField('productionActual', value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Work Delays (if any)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.workDelays}
          onChangeText={value => updateField('workDelays', value)}
          placeholder="Describe any delays, reasons, duration..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Progress Remarks</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.progressRemarks}
          onChangeText={value => updateField('progressRemarks', value)}
          placeholder="Work completed, challenges faced, achievements..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📄</Text>
        <View>
          <Text style={styles.sectionTitle}>Step 6: Permits & Compliance</Text>
          <Text style={styles.sectionDescription}>Regulatory compliance</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>All Permits Valid? *</Text>
        <View style={styles.radioGroup}>
          {['Yes', 'No', 'Some Expired'].map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioButton,
                formData.permitsValid === option && styles.radioButtonActive,
              ]}
              onPress={() => updateField('permitsValid', option)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.permitsValid === option && styles.radioTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Inspections Completed? *</Text>
        <View style={styles.radioGroup}>
          {['Yes', 'No', 'Pending'].map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioButton,
                formData.inspectionsDone === option && styles.radioButtonActive,
              ]}
              onPress={() => updateField('inspectionsDone', option)}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.inspectionsDone === option && styles.radioTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Violations Found</Text>
        <TextInput
          style={styles.textInput}
          value={formData.violationsFound}
          onChangeText={value => updateField('violationsFound', value)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Compliance Notes</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.complianceNotes}
          onChangeText={value => updateField('complianceNotes', value)}
          placeholder="Permit details, inspection findings, compliance issues..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
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
        <Text style={styles.headerTitle}>Section Report</Text>
        <TouchableOpacity
          onPress={handleSaveDraft}
          style={styles.draftIconButton}
        >
          <Text style={styles.draftIconText}>💾</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Stepper */}
      <View style={styles.stepperContainer}>
        <Text style={styles.stepperTitle}>6-Step Report Form</Text>
        <View style={styles.stepperRow}>
          {[1, 2, 3, 4, 5, 6].map(step => (
            <View key={step} style={styles.stepItem}>
              <TouchableOpacity
                style={[
                  styles.stepCircle,
                  currentStep === step && styles.stepCircleActive,
                  currentStep > step && styles.stepCircleCompleted,
                ]}
                onPress={() => setCurrentStep(step)}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (currentStep === step || currentStep > step) &&
                      styles.stepNumberActive,
                  ]}
                >
                  {currentStep > step ? '✓' : step}
                </Text>
              </TouchableOpacity>
              {step < 6 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > step && styles.stepLineCompleted,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={handlePrevious}
            >
              <Text style={styles.prevButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep < 6 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>✓ Submit Report</Text>
            </TouchableOpacity>
          )}
        </View>
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
  draftIconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftIconText: {
    fontSize: 24,
  },
  stepperContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  stepperTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  stepCircleActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#10b981',
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  sectionIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  radioButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  radioTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  statInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 0,
  },
  navigationButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  prevButton: {
    backgroundColor: '#64748b',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  prevButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SectionReportScreen;
