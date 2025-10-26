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
import { RootStackParamList } from '../navigation/types';

type NewShiftLogScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface EquipmentEntry {
  id: string;
  name: string;
  condition: 'good' | 'faulty' | 'maintenance';
  notes: string;
  photoRequired: boolean;
}

const NewShiftLogScreen: React.FC = () => {
  const navigation = useNavigation<NewShiftLogScreenNavigationProp>();

  // Shift Details Section
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'night'>(
    'morning',
  );
  const [workArea, setWorkArea] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<
    'present' | 'late' | 'absent'
  >('present');

  // Crew Details Section
  const [crewMembers, setCrewMembers] = useState('');
  const [supervisorName, setSupervisorName] = useState('');

  // Equipment Section
  const [equipment, setEquipment] = useState<EquipmentEntry[]>([]);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentCondition, setEquipmentCondition] = useState<
    'good' | 'faulty' | 'maintenance'
  >('good');
  const [equipmentNotes, setEquipmentNotes] = useState('');

  // Safety Section
  const [gasReadingCO, setGasReadingCO] = useState('');
  const [gasReadingCH4, setGasReadingCH4] = useState('');
  const [gasReadingO2, setGasReadingO2] = useState('');
  const [ventilationStatus, setVentilationStatus] = useState<
    'adequate' | 'insufficient' | 'not-checked'
  >('adequate');
  const [ppeUsed, setPpeUsed] = useState<string[]>([
    'helmet',
    'boots',
    'gloves',
  ]);

  // Work Summary Section
  const [tasksPerformed, setTasksPerformed] = useState('');
  const [productionAchieved, setProductionAchieved] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');

  const handleAddEquipment = () => {
    if (!equipmentName.trim()) {
      Alert.alert('Validation Error', 'Please enter equipment name');
      return;
    }

    const newEquipment: EquipmentEntry = {
      id: Date.now().toString(),
      name: equipmentName,
      condition: equipmentCondition,
      notes: equipmentNotes,
      photoRequired:
        equipmentCondition === 'faulty' || equipmentCondition === 'maintenance',
    };

    setEquipment([...equipment, newEquipment]);
    setEquipmentName('');
    setEquipmentCondition('good');
    setEquipmentNotes('');
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipment(equipment.filter(item => item.id !== id));
  };

  const togglePPE = (item: string) => {
    if (ppeUsed.includes(item)) {
      setPpeUsed(ppeUsed.filter(ppe => ppe !== item));
    } else {
      setPpeUsed([...ppeUsed, item]);
    }
  };

  const validateForm = (): boolean => {
    if (!workArea.trim()) {
      Alert.alert('Validation Error', 'Please enter work area');
      return false;
    }
    if (!supervisorName.trim()) {
      Alert.alert('Validation Error', 'Please enter supervisor name');
      return false;
    }
    if (!tasksPerformed.trim()) {
      Alert.alert('Validation Error', 'Please enter tasks performed');
      return false;
    }
    if (!gasReadingCO.trim() || !gasReadingCH4.trim() || !gasReadingO2.trim()) {
      Alert.alert(
        'Validation Error',
        'Please complete all gas readings for safety compliance',
      );
      return false;
    }
    if (ppeUsed.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please select at least one PPE item used',
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const shiftLogData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'Submitted',
      shiftDetails: {
        shiftType,
        workArea,
        attendanceStatus,
      },
      crew: {
        members: crewMembers,
        supervisor: supervisorName,
      },
      equipment,
      safety: {
        gasReadings: {
          co: gasReadingCO,
          ch4: gasReadingCH4,
          o2: gasReadingO2,
        },
        ventilationStatus,
        ppeUsed,
      },
      workSummary: {
        tasksPerformed,
        productionAchieved,
        problemsEncountered,
      },
    };

    // TODO: Store in AsyncStorage and/or send to backend API
    console.log('Shift Log Submitted:', shiftLogData);

    Alert.alert(
      'Success',
      'Your shift log has been submitted successfully and is pending supervisor review.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('WorkerDashboard'),
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard this shift log? All entered data will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Shift Log</Text>
          <Text style={styles.headerSubtitle}>Complete all sections</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shift Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Shift Details</Text>

          <Text style={styles.label}>Shift Type *</Text>
          <View style={styles.radioGroup}>
            {(['morning', 'afternoon', 'night'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioButton,
                  shiftType === type && styles.radioButtonActive,
                ]}
                onPress={() => setShiftType(type)}
              >
                <Text
                  style={[
                    styles.radioText,
                    shiftType === type && styles.radioTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Work Area / Zone *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Panel 5, Zone A-12"
            placeholderTextColor="#94a3b8"
            value={workArea}
            onChangeText={setWorkArea}
          />

          <Text style={styles.label}>Attendance Status *</Text>
          <View style={styles.radioGroup}>
            {(['present', 'late', 'absent'] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.radioButton,
                  attendanceStatus === status && styles.radioButtonActive,
                ]}
                onPress={() => setAttendanceStatus(status)}
              >
                <Text
                  style={[
                    styles.radioText,
                    attendanceStatus === status && styles.radioTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crew Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Crew Details</Text>

          <Text style={styles.label}>Crew Members (Names)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter crew member names, one per line"
            placeholderTextColor="#94a3b8"
            value={crewMembers}
            onChangeText={setCrewMembers}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Supervisor Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter supervisor's full name"
            placeholderTextColor="#94a3b8"
            value={supervisorName}
            onChangeText={setSupervisorName}
          />
        </View>

        {/* Equipment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Equipment Used</Text>

          <Text style={styles.label}>Equipment Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Drill Machine #5"
            placeholderTextColor="#94a3b8"
            value={equipmentName}
            onChangeText={setEquipmentName}
          />

          <Text style={styles.label}>Condition</Text>
          <View style={styles.radioGroup}>
            {(['good', 'faulty', 'maintenance'] as const).map(condition => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.radioButton,
                  equipmentCondition === condition && styles.radioButtonActive,
                ]}
                onPress={() => setEquipmentCondition(condition)}
              >
                <Text
                  style={[
                    styles.radioText,
                    equipmentCondition === condition && styles.radioTextActive,
                  ]}
                >
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(equipmentCondition === 'faulty' ||
            equipmentCondition === 'maintenance') && (
            <>
              <Text style={styles.label}>Notes / Issue Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue or maintenance needed"
                placeholderTextColor="#94a3b8"
                value={equipmentNotes}
                onChangeText={setEquipmentNotes}
                multiline
                numberOfLines={2}
              />
              <Text style={styles.helperText}>
                📷 Photo upload required for faulty/maintenance equipment
              </Text>
            </>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddEquipment}
          >
            <Text style={styles.addButtonText}>+ Add Equipment</Text>
          </TouchableOpacity>

          {equipment.length > 0 && (
            <View style={styles.equipmentList}>
              {equipment.map(item => (
                <View key={item.id} style={styles.equipmentItem}>
                  <View style={styles.equipmentItemContent}>
                    <Text style={styles.equipmentItemName}>{item.name}</Text>
                    <View
                      style={[
                        styles.conditionBadge,
                        item.condition === 'good' && styles.conditionGood,
                        item.condition === 'faulty' && styles.conditionFaulty,
                        item.condition === 'maintenance' &&
                          styles.conditionMaintenance,
                      ]}
                    >
                      <Text style={styles.conditionBadgeText}>
                        {item.condition}
                      </Text>
                    </View>
                    {item.notes && (
                      <Text style={styles.equipmentNotes}>{item.notes}</Text>
                    )}
                    {item.photoRequired && (
                      <Text style={styles.photoRequired}>
                        📷 Photo required
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveEquipment(item.id)}
                  >
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Safety Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Safety Checks</Text>

          <Text style={styles.label}>Gas Readings *</Text>
          <View style={styles.gasReadingsGrid}>
            <View style={styles.gasReadingItem}>
              <Text style={styles.gasLabel}>CO (ppm)</Text>
              <TextInput
                style={styles.gasInput}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                value={gasReadingCO}
                onChangeText={setGasReadingCO}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.gasReadingItem}>
              <Text style={styles.gasLabel}>CH₄ (%)</Text>
              <TextInput
                style={styles.gasInput}
                placeholder="0.0"
                placeholderTextColor="#94a3b8"
                value={gasReadingCH4}
                onChangeText={setGasReadingCH4}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.gasReadingItem}>
              <Text style={styles.gasLabel}>O₂ (%)</Text>
              <TextInput
                style={styles.gasInput}
                placeholder="21"
                placeholderTextColor="#94a3b8"
                value={gasReadingO2}
                onChangeText={setGasReadingO2}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Ventilation Status *</Text>
          <View style={styles.radioGroup}>
            {(['adequate', 'insufficient', 'not-checked'] as const).map(
              status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.radioButton,
                    ventilationStatus === status && styles.radioButtonActive,
                  ]}
                  onPress={() => setVentilationStatus(status)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      ventilationStatus === status && styles.radioTextActive,
                    ]}
                  >
                    {status === 'not-checked'
                      ? 'Not Checked'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <Text style={styles.label}>PPE Used *</Text>
          <View style={styles.checkboxGroup}>
            {['helmet', 'boots', 'gloves', 'mask', 'goggles', 'vest'].map(
              item => (
                <TouchableOpacity
                  key={item}
                  style={styles.checkboxItem}
                  onPress={() => togglePPE(item)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      ppeUsed.includes(item) && styles.checkboxChecked,
                    ]}
                  >
                    {ppeUsed.includes(item) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Work Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Work Summary</Text>

          <Text style={styles.label}>Tasks Performed *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe all tasks completed during the shift"
            placeholderTextColor="#94a3b8"
            value={tasksPerformed}
            onChangeText={setTasksPerformed}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Production Achieved</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Tons mined, meters drilled, etc."
            placeholderTextColor="#94a3b8"
            value={productionAchieved}
            onChangeText={setProductionAchieved}
            multiline
            numberOfLines={2}
          />

          <Text style={styles.label}>Problems Encountered</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe any issues, delays, or incidents"
            placeholderTextColor="#94a3b8"
            value={problemsEncountered}
            onChangeText={setProblemsEncountered}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>✓ Submit Shift Log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  radioButtonActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  radioText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 6,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  equipmentList: {
    marginTop: 16,
    gap: 10,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  equipmentItemContent: {
    flex: 1,
  },
  equipmentItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  conditionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  conditionGood: {
    backgroundColor: '#d1fae5',
  },
  conditionFaulty: {
    backgroundColor: '#fee2e2',
  },
  conditionMaintenance: {
    backgroundColor: '#fef3c7',
  },
  conditionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  equipmentNotes: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  photoRequired: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  removeButton: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  gasReadingsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gasReadingItem: {
    flex: 1,
  },
  gasLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  gasInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e293b',
    textAlign: 'center',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  submitSection: {
    marginTop: 12,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default NewShiftLogScreen;
