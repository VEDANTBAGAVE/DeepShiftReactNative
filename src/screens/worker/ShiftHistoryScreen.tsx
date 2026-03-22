import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { shiftService } from '../../services/shiftService';
import { Shift } from '../../types/database';

type ShiftHistoryNavigationProp = StackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  submitted: '#10b981',
  approved: '#3b82f6',
  archived: '#64748b',
  flagged: '#f97316',
};

const ShiftHistoryScreen: React.FC = () => {
  const navigation = useNavigation<ShiftHistoryNavigationProp>();
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.section_id) return;
    shiftService
      .getShifts({ section_id: user.section_id })
      .then(setShifts)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  const sortedShifts = [...shifts].sort(
    (a, b) =>
      new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime(),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shift Participation</Text>
          <Text style={styles.headerSubtitle}>
            {sortedShifts.length} shifts
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#1e3a5f"
            style={{ marginTop: 60 }}
          />
        ) : sortedShifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Shifts Yet</Text>
            <Text style={styles.emptyText}>
              No shift records found for your section
            </Text>
          </View>
        ) : (
          sortedShifts.map(shift => (
            <TouchableOpacity
              key={shift.id}
              style={styles.shiftCard}
              onPress={() =>
                navigation.navigate('ShiftDetailScreen', { shiftId: shift.id })
              }
              accessibilityRole="button"
              accessibilityLabel={`Open shift details for ${shift.shift_date} ${shift.shift_type} shift`}
            >
              <View style={styles.shiftHeader}>
                <View>
                  <Text style={styles.shiftDate}>{shift.shift_date}</Text>
                  <Text style={styles.shiftInfo}>
                    {shift.shift_type.toUpperCase()} SHIFT
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: STATUS_COLORS[shift.status] ?? '#94a3b8',
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {shift.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {shift.handover_notes ? (
                <View style={styles.reopenedBanner}>
                  <Text style={styles.reopenedText}>
                    📝 {shift.handover_notes}
                  </Text>
                </View>
              ) : null}

              <View style={styles.shiftStats}>
                <Text style={styles.shiftStat}>
                  📅{' '}
                  {shift.submitted_at
                    ? `Submitted ${new Date(
                        shift.submitted_at,
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Not yet submitted'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  newShiftButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftDate: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  shiftInfo: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  reopenedBanner: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  reopenedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  shiftStats: {
    flexDirection: 'row',
    gap: 16,
  },
  shiftStat: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default ShiftHistoryScreen;
