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
import { useWorker } from '../../context/WorkerContext';
import { IncidentRecord, IncidentSeverity, Photo } from '../../types/worker';

type ReportIncidentNavigationProp = StackNavigationProp<RootStackParamList>;

const SEVERITIES: {
  value: IncidentSeverity;
  label: string;
  color: string;
  icon: string;
}[] = [
  { value: 'low', label: 'Low', color: '#10b981', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '🟡' },
  { value: 'high', label: 'High', color: '#ef4444', icon: '🔴' },
];

const AREAS = [
  'Panel 5',
  'Panel 6',
  'Section A-12',
  'Section B-3',
  'Underground Level 2',
  'Other',
];

const ReportIncidentScreen: React.FC = () => {
  const navigation = useNavigation<ReportIncidentNavigationProp>();
  const { addIncident, shifts } = useWorker();

  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('low');
  const [area, setArea] = useState('Panel 5');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [linkedShiftId, setLinkedShiftId] = useState<string | undefined>(
    undefined,
  );

  // Get recent shifts for linking
  const recentShifts = shifts
    .filter(s => s.status === 'submitted' || s.status === 'draft')
    .slice(0, 5);

  const handleAddPhoto = () => {
    // TODO: Implement image picker
    // For now, add placeholder
    Alert.alert(
      'Photo Capture',
      'Camera/Gallery picker will be implemented here',
      [
        {
          text: 'Add Demo Photo',
          onPress: () => {
            const demoPhoto: Photo = {
              id: `photo-${Date.now()}`,
              uri: 'demo-photo-uri',
              timestamp: Date.now(),
            };
            setPhotos([...photos, demoPhoto]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const validate = (): boolean => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter incident description');
      return false;
    }

    if (description.trim().length < 10) {
      Alert.alert(
        'Validation Error',
        'Description must be at least 10 characters',
      );
      return false;
    }

    if ((severity === 'medium' || severity === 'high') && photos.length === 0) {
      Alert.alert(
        'Photo Required',
        `At least one photo is required for ${severity} severity incidents`,
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const incident: IncidentRecord = {
      id: `incident-${Date.now()}`,
      description: description.trim(),
      severity,
      area,
      photos,
      linkedShiftId,
      createdAt: Date.now(),
    };

    await addIncident(incident);

    const linkedShift = linkedShiftId
      ? shifts.find(s => s.id === linkedShiftId)
      : null;

    Alert.alert(
      '✓ Incident Reported',
      `Your ${severity} severity incident has been recorded.${
        linkedShift
          ? `\n\nLinked to shift: ${linkedShift.date} ${linkedShift.shiftType}`
          : ''
      }`,
      [
        {
          text: 'View Shift',
          onPress: () =>
            linkedShiftId &&
            navigation.navigate('ShiftDetailScreen', {
              shiftId: linkedShiftId,
            }),
        },
        {
          text: 'Done',
          onPress: () => navigation.navigate('WorkerDashboard'),
        },
      ],
    );
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Report Incident</Text>
          <Text style={styles.headerSubtitle}>Fast & Secure</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Description */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>📝 Description</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what happened in detail..."
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />
          <Text style={styles.helperText}>
            {description.length}/500 • Minimum 10 characters
          </Text>
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>⚠️ Severity</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.severityGrid}>
            {SEVERITIES.map(sev => (
              <TouchableOpacity
                key={sev.value}
                style={[
                  styles.severityCard,
                  severity === sev.value && {
                    backgroundColor: sev.color,
                    borderColor: sev.color,
                  },
                ]}
                onPress={() => setSeverity(sev.value)}
              >
                <Text style={styles.severityIcon}>{sev.icon}</Text>
                <Text
                  style={[
                    styles.severityLabel,
                    severity === sev.value && styles.severityLabelActive,
                  ]}
                >
                  {sev.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {(severity === 'medium' || severity === 'high') && (
            <View style={styles.photoRequiredBanner}>
              <Text style={styles.photoRequiredIcon}>📷</Text>
              <Text style={styles.photoRequiredText}>
                Photo required for {severity} severity
              </Text>
            </View>
          )}
        </View>

        {/* Location / Area */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>📍 Location</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.areaGrid}>
            {AREAS.map(areaOption => (
              <TouchableOpacity
                key={areaOption}
                style={[
                  styles.areaButton,
                  area === areaOption && styles.areaButtonActive,
                ]}
                onPress={() => setArea(areaOption)}
              >
                <Text
                  style={[
                    styles.areaButtonText,
                    area === areaOption && styles.areaButtonTextActive,
                  ]}
                >
                  {areaOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>📷 Photos</Text>
            {(severity === 'medium' || severity === 'high') && (
              <Text style={styles.required}>*</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
          >
            <Text style={styles.addPhotoIcon}>📸</Text>
            <Text style={styles.addPhotoText}>
              Add Photo (Camera / Gallery)
            </Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photoList}>
              {photos.map((photo, index) => (
                <View key={photo.id} style={styles.photoItem}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>
                      Photo {index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(photo.id)}
                  >
                    <Text style={styles.removePhotoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Link to Shift (Optional) */}
        {recentShifts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>🔗 Link to Shift (Optional)</Text>
            <View style={styles.shiftList}>
              <TouchableOpacity
                style={[
                  styles.shiftItem,
                  !linkedShiftId && styles.shiftItemActive,
                ]}
                onPress={() => setLinkedShiftId(undefined)}
              >
                <Text
                  style={[
                    styles.shiftItemText,
                    !linkedShiftId && styles.shiftItemTextActive,
                  ]}
                >
                  None
                </Text>
              </TouchableOpacity>

              {recentShifts.map(shift => (
                <TouchableOpacity
                  key={shift.id}
                  style={[
                    styles.shiftItem,
                    linkedShiftId === shift.id && styles.shiftItemActive,
                  ]}
                  onPress={() => setLinkedShiftId(shift.id)}
                >
                  <Text
                    style={[
                      styles.shiftItemText,
                      linkedShiftId === shift.id && styles.shiftItemTextActive,
                    ]}
                  >
                    {shift.date} • {shift.shiftType} • {shift.area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>✓ Submit Incident Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  required: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  severityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  severityCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  severityIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  severityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  severityLabelActive: {
    color: '#fff',
  },
  photoRequiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  photoRequiredIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  photoRequiredText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  areaGrid: {
    gap: 10,
  },
  areaButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  areaButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  areaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  areaButtonTextActive: {
    color: '#fff',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 2,
    gap: 8,
  },
  addPhotoIcon: {
    fontSize: 20,
  },
  addPhotoText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  photoList: {
    marginTop: 12,
    gap: 10,
  },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  photoPlaceholder: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  removePhotoButton: {
    marginLeft: 12,
    padding: 8,
  },
  removePhotoText: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  shiftList: {
    gap: 10,
  },
  shiftItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  shiftItemActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  shiftItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  shiftItemTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 12,
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
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ReportIncidentScreen;
