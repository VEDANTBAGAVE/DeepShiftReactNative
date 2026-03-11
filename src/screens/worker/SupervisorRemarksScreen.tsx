import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/database';

type SupervisorRemarksNavigationProp = StackNavigationProp<RootStackParamList>;

const SupervisorRemarksScreen: React.FC = () => {
  const navigation = useNavigation<SupervisorRemarksNavigationProp>();
  const { user } = useAuth();

  const [remarks, setRemarks] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = remarks.filter(r => !r.is_read).length;

  const fetchRemarks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await notificationService.getRemarks(user.id);
      setRemarks(result);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRemarks();
  }, [fetchRemarks]);

  const handleMarkRead = async (remark: Notification) => {
    if (remark.is_read) return;
    try {
      await notificationService.markAsRead(remark.id);
      setRemarks(prev =>
        prev.map(r => (r.id === remark.id ? { ...r, is_read: true } : r)),
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    try {
      await notificationService.markAllRead(user.id);
      setRemarks(prev => prev.map(r => ({ ...r, is_read: true })));
    } catch {}
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.remarkCard, !item.is_read && styles.remarkCardUnread]}
      onPress={() => handleMarkRead(item)}
      activeOpacity={0.75}
    >
      {!item.is_read && <View style={styles.unreadDot} />}
      <View style={styles.remarkHeader}>
        <Text
          style={[
            styles.remarkTitle,
            !item.is_read && styles.remarkTitleUnread,
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.remarkTime}>{formatTime(item.created_at)}</Text>
      </View>
      {item.body ? <Text style={styles.remarkBody}>{item.body}</Text> : null}
    </TouchableOpacity>
  );

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
            {unreadCount} unread · {remarks.length} total
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
        </View>
      ) : (
        <FlatList
          data={remarks}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                fetchRemarks();
              }}
              colors={['#1e3a5f']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No Remarks Yet</Text>
              <Text style={styles.emptyText}>
                Your foreman's remarks and messages will appear here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e3a5f',
    elevation: 4,
  },
  backButton: { paddingVertical: 6, paddingHorizontal: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerPlaceholder: { width: 60 },
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
  markAllReadText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center' },
  remarkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  remarkCardUnread: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
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
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  remarkTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
    marginRight: 8,
  },
  remarkTitleUnread: { fontWeight: '700', color: '#1e293b' },
  remarkTime: { fontSize: 11, color: '#94a3b8' },
  remarkBody: { fontSize: 14, color: '#64748b', lineHeight: 20 },
});

export default SupervisorRemarksScreen;
