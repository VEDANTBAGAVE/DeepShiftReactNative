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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useForeman } from '../../context/ForemanContext';

type CreateRemarkScreenRouteProp = RouteProp<
  RootStackParamList,
  'CreateRemarkScreen'
>;
type CreateRemarkScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Severity = 'info' | 'warning';

const CreateRemarkScreen: React.FC = () => {
  const navigation = useNavigation<CreateRemarkScreenNavigationProp>();
  const route = useRoute<CreateRemarkScreenRouteProp>();
  const { workerId } = route.params;
  const { addRemark, getWorkerById } = useForeman();

  const worker = getWorkerById(workerId);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');
  const [requiresAction, setRequiresAction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please enter a remark message');
      return;
    }

    if (message.length < 10) {
      Alert.alert(
        'Validation Error',
        'Remark must be at least 10 characters long',
      );
      return;
    }

    if (message.length > 500) {
      Alert.alert('Validation Error', 'Remark must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      await addRemark({
        from: 'Foreman',
        message: message.trim(),
        summary:
          message.trim().substring(0, 50) + (message.length > 50 ? '...' : ''),
        isReopened: false,
        isRead: false,
        linkedShiftId: undefined,
        linkedWorkerId: workerId,
        severity,
        requiresAction,
      });

      Alert.alert('Success', `Remark sent to ${worker?.name || 'worker'}`, [
        {
          text: 'View Profile',
          onPress: () =>
            navigation.navigate('WorkerProfileSheet', { workerId }),
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add remark. Please try again.');
      setIsSubmitting(false);
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
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Remark</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Worker Info Banner */}
        {worker && (
          <View style={styles.workerBanner}>
            <View style={styles.workerBannerLeft}>
              <View style={styles.workerAvatar}>
                <Text style={styles.workerAvatarText}>
                  {worker.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerDetail}>
                  {worker.role} • {worker.section}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Remark Message <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea]}
            placeholder="Enter your remark for this worker..."
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={setMessage}
            maxLength={500}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={styles.charCountRow}>
            <Text
              style={[
                styles.charCount,
                message.length < 10 && styles.charCountError,
              ]}
            >
              {message.length < 10
                ? `${10 - message.length} more characters needed`
                : `${message.length}/500`}
            </Text>
          </View>
        </View>

        {/* Severity Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Severity Level</Text>
          <View style={styles.severityGroup}>
            <TouchableOpacity
              style={[
                styles.severityButton,
                severity === 'info' && styles.severityButtonInfoActive,
              ]}
              onPress={() => setSeverity('info')}
            >
              <Text style={styles.severityIcon}>ℹ️</Text>
              <Text
                style={[
                  styles.severityLabel,
                  severity === 'info' && styles.severityLabelActive,
                ]}
              >
                Information
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.severityButton,
                severity === 'warning' && styles.severityButtonWarningActive,
              ]}
              onPress={() => setSeverity('warning')}
            >
              <Text style={styles.severityIcon}>⚠️</Text>
              <Text
                style={[
                  styles.severityLabel,
                  severity === 'warning' && styles.severityLabelActive,
                ]}
              >
                Warning
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Requires Action Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setRequiresAction(!requiresAction)}
          >
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleLabel}>Requires Follow-up Action</Text>
              <Text style={styles.toggleHint}>
                Worker must acknowledge this remark
              </Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                requiresAction && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  requiresAction && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        {message.length >= 10 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>📝 Preview</Text>
            <View
              style={[
                styles.previewCard,
                severity === 'warning' && styles.previewCardWarning,
              ]}
            >
              <View style={styles.previewHeader}>
                <Text style={styles.previewIcon}>
                  {severity === 'info' ? 'ℹ️' : '⚠️'}
                </Text>
                <Text style={styles.previewSeverity}>
                  {severity === 'info' ? 'Information' : 'Warning'}
                </Text>
                {requiresAction && (
                  <View style={styles.previewActionBadge}>
                    <Text style={styles.previewActionBadgeText}>
                      Action Required
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.previewMessage}>{message}</Text>
              <Text style={styles.previewFrom}>From: Foreman</Text>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            This remark will be sent to {worker?.name || 'the worker'} and
            appear in their notifications.{' '}
            {severity === 'warning' && 'Warning remarks are highlighted.'}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || message.length < 10) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || message.length < 10}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Sending Remark...' : '✓ Send Remark'}
          </Text>
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
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  workerBanner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  workerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  workerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  workerDetail: {
    fontSize: 13,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  required: {
    color: '#ef4444',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    minHeight: 140,
    textAlignVertical: 'top',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  charCountError: {
    color: '#ef4444',
    fontWeight: '600',
  },
  severityGroup: {
    flexDirection: 'row',
  },
  severityButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 14,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonInfoActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  severityButtonWarningActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  severityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  severityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  severityLabelActive: {
    color: '#fff',
  },
  toggleRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  toggleHint: {
    fontSize: 12,
    color: '#64748b',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#cbd5e1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#10b981',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    elevation: 2,
  },
  previewCardWarning: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  previewSeverity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    flex: 1,
  },
  previewActionBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  previewActionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  previewMessage: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 8,
  },
  previewFrom: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreateRemarkScreen;
