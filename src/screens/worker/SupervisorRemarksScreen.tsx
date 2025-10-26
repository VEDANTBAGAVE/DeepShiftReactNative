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

type SupervisorRemarksNavigationProp = StackNavigationProp<RootStackParamList>;

const SupervisorRemarksScreen: React.FC = () => {
  const navigation = useNavigation<SupervisorRemarksNavigationProp>();
  const {
    remarks,
    markRemarkAsRead,
    markAllRemarksAsRead,
    getUnreadRemarksCount,
  } = useWorker();

  const unreadCount = getUnreadRemarksCount();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleRemarkPress = async (remarkId: string) => {
    await markRemarkAsRead(remarkId);
  };

  const handleMarkAllRead = async () => {
    await markAllRemarksAsRead();
  };

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
          <Text style={styles.headerTitle}>Foreman Remarks</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} unread • {remarks.length} total
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={handleMarkAllRead}
          >
            <Text style={styles.markAllReadText}>✓ Mark All Read</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {remarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Remarks Yet</Text>
            <Text style={styles.emptyText}>
              Your foreman's remarks and messages will appear here
            </Text>
          </View>
        ) : (
          remarks.map(remark => (
            <TouchableOpacity
              key={remark.id}
              style={[
                styles.remarkCard,
                !remark.isRead && styles.remarkCardUnread,
                remark.isReopened && styles.remarkCardReopened,
              ]}
              onPress={() => handleRemarkPress(remark.id)}
            >
              {!remark.isRead && <View style={styles.unreadDot} />}

              {remark.isReopened && (
                <View style={styles.reopenedBadge}>
                  <Text style={styles.reopenedBadgeText}>REOPENED</Text>
                </View>
              )}

              <View style={styles.remarkHeader}>
                <Text style={styles.remarkFrom}>{remark.from}</Text>
                <Text style={styles.remarkTime}>
                  {formatTime(remark.createdAt)}
                </Text>
              </View>

              <Text style={styles.remarkSummary}>{remark.summary}</Text>
              <Text style={styles.remarkMessage}>{remark.message}</Text>

              {remark.linkedShiftId && (
                <TouchableOpacity
                  style={styles.viewShiftButton}
                  onPress={() =>
                    navigation.navigate('ShiftDetailScreen', {
                      shiftId: remark.linkedShiftId!,
                    })
                  }
                >
                  <Text style={styles.viewShiftText}>View Shift →</Text>
                </TouchableOpacity>
              )}
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
  headerPlaceholder: {
    width: 60,
  },
  actionBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  markAllReadButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  markAllReadText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
    textAlign: 'center',
  },
  remarkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    position: 'relative',
  },
  remarkCardUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  remarkCardReopened: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  reopenedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reopenedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remarkFrom: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  remarkTime: {
    fontSize: 12,
    color: '#64748b',
  },
  remarkSummary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  remarkMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  viewShiftButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  viewShiftText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default SupervisorRemarksScreen;
