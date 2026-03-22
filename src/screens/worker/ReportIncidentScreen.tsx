import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { incidentService } from '../../services/incidentService';
import { IncidentReport } from '../../types/database';

type IncidentViewerNavigationProp = StackNavigationProp<RootStackParamList>;

type Filter = 'all' | 'high' | 'medium' | 'low';

const ReportIncidentScreen: React.FC = () => {
  const navigation = useNavigation<IncidentViewerNavigationProp>();
  const { user } = useAuth();

  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const loadIncidents = async () => {
    if (!user?.section_id) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const data = await incidentService.getIncidents({
        section_id: user.section_id,
      });
      setIncidents(data);
    } catch {
      setIncidents([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [user?.section_id]);

  const filteredIncidents = useMemo(() => {
    if (filter === 'all') return incidents;
    return incidents.filter(i => i.severity_level === filter);
  }, [incidents, filter]);

  const severityColor = (level: string) => {
    if (level === 'high') return '#ef4444';
    if (level === 'medium') return '#f59e0b';
    return '#10b981';
  };

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
          <Text style={styles.headerTitle}>Incident Reports</Text>
          <Text style={styles.headerSubtitle}>Viewer Mode</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.noticeBar}>
        <Text style={styles.noticeText}>
          ℹ️ Reporting is handled by foreman/supervisor. Workers can view
          section safety incidents here.
        </Text>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'high', 'medium', 'low'] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityLabel={`Filter incidents by ${f}`}
            accessibilityState={{ selected: filter === f }}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1e3a5f" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadIncidents();
              }}
              colors={['#1e3a5f']}
            />
          }
        >
          {filteredIncidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No Incidents Found</Text>
              <Text style={styles.emptyText}>
                No incidents available for your section with selected filter.
              </Text>
            </View>
          ) : (
            filteredIncidents.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {item.title || 'Incident'}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: severityColor(item.severity_level) },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.severity_level.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.metaText}>
                  Type: {item.incident_type} •{' '}
                  {new Date(item.created_at).toLocaleString()}
                </Text>

                <Text style={styles.description}>{item.description}</Text>

                <Text style={styles.statusText}>
                  Status: {item.is_resolved ? 'Resolved' : 'Open'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerPlaceholder: { width: 60 },
  noticeBar: {
    backgroundColor: '#e0f2fe',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  noticeText: { fontSize: 12, color: '#0369a1', fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: '#1e3a5f' },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  filterChipTextActive: { color: '#fff' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  metaText: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  description: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  statusText: { color: '#0f766e', fontSize: 12, fontWeight: '700' },
});

export default ReportIncidentScreen;
