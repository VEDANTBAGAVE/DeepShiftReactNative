import React from 'react';
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
import { useWorker } from '../../context/WorkerContext';

type ShiftHistoryNavigationProp = StackNavigationProp<RootStackParamList>;

const STATUS_COLORS = {
  draft: '#94a3b8',
  submitted: '#10b981',
  reopened: '#f59e0b',
  acknowledged: '#3b82f6',
};

const ShiftHistoryScreen: React.FC = () => {
  const navigation = useNavigation<ShiftHistoryNavigationProp>();
  const { shifts } = useWorker();

  const sortedShifts = [...shifts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shift History</Text>
          <Text style={styles.headerSubtitle}>{shifts.length} shifts</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('NewShiftScreen')}>
          <Text style={styles.newShiftButton}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {sortedShifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Shifts Yet</Text>
            <Text style={styles.emptyText}>Create your first shift log</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('NewShiftScreen')}
            >
              <Text style={styles.emptyButtonText}>+ Create First Shift</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedShifts.map(shift => (
            <TouchableOpacity
              key={shift.id}
              style={styles.shiftCard}
              onPress={() =>
                navigation.navigate('ShiftDetailScreen', { shiftId: shift.id })
              }
            >
              <View style={styles.shiftHeader}>
                <View>
                  <Text style={styles.shiftDate}>{shift.date}</Text>
                  <Text style={styles.shiftInfo}>
                    {shift.shiftType.toUpperCase()} • {shift.area}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[shift.status] },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {shift.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {shift.reopenedReason && (
                <View style={styles.reopenedBanner}>
                  <Text style={styles.reopenedText}>
                    🔄 {shift.reopenedReason}
                  </Text>
                </View>
              )}

              <View style={styles.shiftStats}>
                <Text style={styles.shiftStat}>
                  ⚙️ {shift.equipment.length} equipment
                </Text>
                <Text style={styles.shiftStat}>
                  ⚠️ {shift.incidentIds.length} incidents
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
