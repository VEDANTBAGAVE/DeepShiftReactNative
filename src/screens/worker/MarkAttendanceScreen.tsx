import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { workerLogService } from '../../services/workerLogService';
import { shiftService } from '../../services/shiftService';
import { WorkerShiftLog } from '../../types/database';

type ShiftType = 'morning' | 'evening' | 'night';
type PresenceStatus = 'present' | 'absent';

type MarkAttendanceNavigationProp = StackNavigationProp<RootStackParamList>;

const SHIFT_TYPES: { value: ShiftType; label: string; icon: string }[] = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'evening', label: 'Evening', icon: '☀️' },
  { value: 'night', label: 'Night', icon: '🌙' },
];

const AREAS = [
  'Panel 5',
  'Panel 6',
  'Section A-12',
  'Section B-3',
  'Underground Level 2',
];

const MarkAttendanceScreen: React.FC = () => {
  const navigation = useNavigation<MarkAttendanceNavigationProp>();
  const { user } = useAuth();

  const [shiftType, setShiftType] = useState<ShiftType>('morning');
  const [presenceStatus, setPresenceStatus] = useState<PresenceStatus>('present');
  const [remarks, setRemarks] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLog, setCurrentLog] = useState<WorkerShiftLog | null>(null);

  // Fetch today's attendance log from Supabase on mount
  useEffect(() => {
    const loadTodayLog = async () => {
      if (!user?.section_id) { setIsLoading(false); return; }
      try {
        const shifts = await shiftService.getTodayShifts(user.section_id);
        if (shifts.length > 0) {
          const log = await workerLogService.getOrCreateWorkerLog(shifts[0].id, user.id);
          setCurrentLog(log);
          if (log.attendance_status) {
            setPresenceStatus(log.attendance_status as PresenceStatus);
            setRemarks(log.remarks || '');
            if (log.check_in_time) setConfirmedAt(new Date(log.check_in_time).getTime());
            setSaved(log.check_in_time != null);
          }
          setShiftType((shifts[0].shift_type as ShiftType) || 'morning');
        }
      } catch (e) {
        console.error('Failed to load attendance:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTodayLog();
  }, [user]);

  const handleOpenConfirmModal = () => {
    if (presenceStatus === 'absent') {
      handleSave();
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPresence = async () => {
    const timestamp = Date.now();
    setConfirmedAt(timestamp);
    setShowConfirmModal(false);
    await handleSave(timestamp);
  };

  const handleSave = async (confirmTimestamp?: number) => {
    if (!user?.section_id) {
      Alert.alert('Error', 'No section assigned to your account.');
      return;
    }
    try {
      const shifts = await shiftService.getTodayShifts(user.section_id);
      if (shifts.length === 0) {
        Alert.alert('No Active Shift', 'No shift found for today in your section.');
        return;
      }
      const log = await workerLogService.markAttendance(
        shifts[0].id,
        user.id,
        presenceStatus,
        remarks.trim() || undefined,
      );
      setCurrentLog(log);
      setSaved(true);
      if (confirmTimestamp) setConfirmedAt(confirmTimestamp);
      Alert.alert(
        '✓ Attendance Marked',
        `Your ${presenceStatus} status has been recorded for ${shiftType} shift.`,
        [{ text: 'OK', onPress: () => navigation.navigate('WorkerDashboard') }],
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save attendance');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSubtitle}>Quick & Simple</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {saved && currentLog && (
          <View style={styles.alreadyMarkedBanner}>
            <Text style={styles.alreadyMarkedIcon}>✓</Text>
            <View style={styles.alreadyMarkedContent}>
              <Text style={styles.alreadyMarkedTitle}>Already Marked</Text>
              <Text style={styles.alreadyMarkedText}>
                {currentLog.attendance_status === 'present' ? 'Present' : 'Absent'}{' '}
                • {shiftType} shift
              </Text>
              {currentLog.check_in_time && (
                <Text style={styles.alreadyMarkedTime}>
                  Confirmed at {formatTime(new Date(currentLog.check_in_time).getTime())}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Shift Type */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>🕐 Shift Type</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.shiftTypeGrid}>
            {SHIFT_TYPES.map(shift => (
              <TouchableOpacity
                key={shift.value}
                activeOpacity={0.7}
                style={[
                  styles.shiftTypeCard,
                  shiftType === shift.value && styles.shiftTypeCardActive,
                ]}
                onPress={() => {
                  console.log('Shift type pressed:', shift.value);
                  setShiftType(shift.value);
                }}
              >
                <Text style={styles.shiftTypeIcon}>{shift.icon}</Text>
                <Text
                  style={[
                    styles.shiftTypeLabel,
                    shiftType === shift.value && styles.shiftTypeLabelActive,
                  ]}
                >
                  {shift.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Area / Section - auto-populated from user profile */}
        <View style={styles.section}>
          <Text style={styles.label}>📍 Section</Text>
          <View style={[styles.areaButton, styles.areaButtonActive]}>
            <Text style={styles.areaButtonTextActive}>
              {user?.section_id ? 'Your Assigned Section' : 'No section assigned'}
            </Text>
          </View>
        </View>

        {/* Presence Status */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <View style={styles.presenceToggleRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.presenceToggle,
                styles.presenceTogglePresent,
                presenceStatus === 'present' &&
                  styles.presenceTogglePresentActive,
              ]}
              onPress={() => {
                console.log('Present pressed');
                setPresenceStatus('present');
              }}
            >
              <Text style={styles.presenceToggleIcon}>✓</Text>
              <Text
                style={[
                  styles.presenceToggleText,
                  presenceStatus === 'present' &&
                    styles.presenceToggleTextActive,
                ]}
              >
                Present
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.presenceToggle,
                styles.presenceToggleAbsent,
                presenceStatus === 'absent' &&
                  styles.presenceToggleAbsentActive,
              ]}
              onPress={() => {
                console.log('Absent pressed');
                setPresenceStatus('absent');
              }}
            >
              <Text style={styles.presenceToggleIcon}>✕</Text>
              <Text
                style={[
                  styles.presenceToggleText,
                  presenceStatus === 'absent' &&
                    styles.presenceToggleTextActive,
                ]}
              >
                Absent
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Optional Remarks */}
        <View style={styles.section}>
          <Text style={styles.label}>📝 Remarks (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any additional notes..."
            placeholderTextColor="#94a3b8"
            value={remarks}
            onChangeText={text => {
              console.log('Remarks changed:', text);
              setRemarks(text);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Confirmation Status */}
        {confirmedAt && (
          <View style={styles.confirmationBadge}>
            <Text style={styles.confirmationIcon}>✓</Text>
            <Text style={styles.confirmationText}>
              Presence confirmed at {formatTime(confirmedAt)}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        {!saved && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.submitButton,
              presenceStatus === 'present'
                ? styles.submitButtonPresent
                : styles.submitButtonAbsent,
            ]}
            onPress={() => {
              console.log('Submit button pressed');
              handleOpenConfirmModal();
            }}
          >
            <Text style={styles.submitButtonText}>
              {presenceStatus === 'present'
                ? '✓ Confirm Presence'
                : '✓ Mark Absent'}
            </Text>
          </TouchableOpacity>
        )}

        {saved && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('WorkerDashboard')}
          >
            <Text style={styles.doneButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Confirm Presence Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>👤</Text>
              <Text style={styles.modalTitle}>Confirm Your Presence</Text>
            </View>

            <Text style={styles.modalDescription}>
              By confirming, you declare that you are physically present at the
              work location and ready to begin your shift.
            </Text>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoLabel}>Location:</Text>
              <Text style={styles.modalInfoValue}>{user?.section_id ?? 'Your Section'}</Text>
              <Text style={styles.modalInfoLabel}>Shift:</Text>
              <Text style={styles.modalInfoValue}>
                {shiftType.toUpperCase()}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleConfirmPresence}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  ✓ Confirm I am present now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
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
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  alreadyMarkedBanner: {
    flexDirection: 'row',
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  alreadyMarkedIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  alreadyMarkedContent: {
    flex: 1,
  },
  alreadyMarkedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 4,
  },
  alreadyMarkedText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 2,
  },
  alreadyMarkedTime: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
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
  shiftTypeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  shiftTypeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    minHeight: 90,
  },
  shiftTypeCardActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  shiftTypeIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  shiftTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  shiftTypeLabelActive: {
    color: '#fff',
  },
  areaGrid: {
    flexDirection: 'column',
  },
  areaButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
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
  presenceToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  presenceToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 60,
  },
  presenceTogglePresent: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  presenceTogglePresentActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  presenceToggleAbsent: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  presenceToggleAbsentActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  presenceToggleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  presenceToggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  presenceToggleTextActive: {
    color: '#fff',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#e2e8f0',
    color: '#64748b',
  },
  confirmationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  confirmationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 24,
  },
  submitButtonPresent: {
    backgroundColor: '#10b981',
  },
  submitButtonAbsent: {
    backgroundColor: '#ef4444',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  doneButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    marginBottom: 24,
  },
  doneButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
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
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInfoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'column',
  },
  modalButtonPrimary: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 12,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonSecondary: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  modalButtonSecondaryText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MarkAttendanceScreen;
