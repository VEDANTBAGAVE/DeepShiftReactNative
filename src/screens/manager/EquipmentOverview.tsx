import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type EquipmentOverviewNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

interface Equipment {
  id: string;
  name: string;
  category: string;
  condition: 'Functional' | 'Needs Maintenance' | 'Faulty';
  location: string;
  responsiblePerson: string;
  lastChecked: string;
  nextMaintenance: string;
}

const EquipmentOverview: React.FC = () => {
  const navigation = useNavigation<EquipmentOverviewNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'functional' | 'maintenance' | 'faulty'
  >('all');

  // Demo equipment data
  const equipment: Equipment[] = [
    {
      id: 'PUMP-01',
      name: 'Water Pump Unit 1',
      category: 'Pumping',
      condition: 'Functional',
      location: 'Panel A-1',
      responsiblePerson: 'Foreman Singh',
      lastChecked: '2 hours ago',
      nextMaintenance: '5 days',
    },
    {
      id: 'DRILL-03',
      name: 'Drill Machine 3',
      category: 'Drilling',
      condition: 'Needs Maintenance',
      location: 'Panel A-3',
      responsiblePerson: 'Overman Patil',
      lastChecked: '4 hours ago',
      nextMaintenance: 'Overdue',
    },
    {
      id: 'VENT-02',
      name: 'Ventilation Fan 2',
      category: 'Ventilation',
      condition: 'Faulty',
      location: 'Main Tunnel',
      responsiblePerson: 'Foreman Kumar',
      lastChecked: '1 hour ago',
      nextMaintenance: 'Immediate',
    },
    {
      id: 'CONV-05',
      name: 'Conveyor Belt 5',
      category: 'Transport',
      condition: 'Functional',
      location: 'Section C',
      responsiblePerson: 'Foreman Das',
      lastChecked: '3 hours ago',
      nextMaintenance: '12 days',
    },
    {
      id: 'PUMP-03',
      name: 'Water Pump Unit 3',
      category: 'Pumping',
      condition: 'Needs Maintenance',
      location: 'Panel B-2',
      responsiblePerson: 'Overman Sharma',
      lastChecked: '5 hours ago',
      nextMaintenance: '2 days',
    },
    {
      id: 'DRILL-07',
      name: 'Drill Machine 7',
      category: 'Drilling',
      condition: 'Functional',
      location: 'Panel A-2',
      responsiblePerson: 'Overman Patil',
      lastChecked: '1 hour ago',
      nextMaintenance: '8 days',
    },
    {
      id: 'VENT-01',
      name: 'Ventilation Fan 1',
      category: 'Ventilation',
      condition: 'Functional',
      location: 'Section B',
      responsiblePerson: 'Foreman Singh',
      lastChecked: '2 hours ago',
      nextMaintenance: '15 days',
    },
    {
      id: 'CONV-02',
      name: 'Conveyor Belt 2',
      category: 'Transport',
      condition: 'Needs Maintenance',
      location: 'Panel B-1',
      responsiblePerson: 'Overman Kumar',
      lastChecked: '6 hours ago',
      nextMaintenance: '1 day',
    },
  ];

  const getConditionColor = (condition: Equipment['condition']) => {
    switch (condition) {
      case 'Functional':
        return '#10b981';
      case 'Needs Maintenance':
        return '#f59e0b';
      case 'Faulty':
        return '#ef4444';
    }
  };

  const getConditionIcon = (condition: Equipment['condition']) => {
    switch (condition) {
      case 'Functional':
        return '✓';
      case 'Needs Maintenance':
        return '⚠️';
      case 'Faulty':
        return '✗';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pumping':
        return '💧';
      case 'Drilling':
        return '🔨';
      case 'Ventilation':
        return '💨';
      case 'Transport':
        return '🚚';
      default:
        return '⚙️';
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'functional') return item.condition === 'Functional';
    if (selectedFilter === 'maintenance')
      return item.condition === 'Needs Maintenance';
    if (selectedFilter === 'faulty') return item.condition === 'Faulty';
    return true;
  });

  const counts = {
    total: equipment.length,
    functional: equipment.filter(e => e.condition === 'Functional').length,
    maintenance: equipment.filter(e => e.condition === 'Needs Maintenance')
      .length,
    faulty: equipment.filter(e => e.condition === 'Faulty').length,
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Equipment Overview</Text>
          <Text style={styles.headerSubtitle}>Machinery Health Monitor</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderTopColor: '#1e3a5f' }]}>
            <Text style={styles.summaryValue}>{counts.total}</Text>
            <Text style={styles.summaryLabel}>Total Equipment</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: '#10b981' }]}>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              {counts.functional}
            </Text>
            <Text style={styles.summaryLabel}>Functional</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: '#f59e0b' }]}>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
              {counts.maintenance}
            </Text>
            <Text style={styles.summaryLabel}>Maintenance</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: '#ef4444' }]}>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
              {counts.faulty}
            </Text>
            <Text style={styles.summaryLabel}>Faulty</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'all' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'all' && styles.filterTabTextActive,
                ]}
              >
                All ({counts.total})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'functional' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('functional')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'functional' && styles.filterTabTextActive,
                ]}
              >
                ✓ Functional ({counts.functional})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'maintenance' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('maintenance')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'maintenance' &&
                    styles.filterTabTextActive,
                ]}
              >
                ⚠️ Maintenance ({counts.maintenance})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'faulty' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('faulty')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'faulty' && styles.filterTabTextActive,
                ]}
              >
                ✗ Faulty ({counts.faulty})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Equipment Cards */}
        {filteredEquipment.length > 0 ? (
          <View style={styles.equipmentList}>
            {filteredEquipment.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.equipmentCard}
                activeOpacity={0.7}
                onPress={() => console.log('View equipment details:', item.id)}
              >
                <View style={styles.equipmentHeader}>
                  <View style={styles.equipmentHeaderLeft}>
                    <Text style={styles.categoryIcon}>
                      {getCategoryIcon(item.category)}
                    </Text>
                    <View>
                      <Text style={styles.equipmentId}>{item.id}</Text>
                      <Text style={styles.equipmentCategory}>
                        {item.category}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.conditionBadge,
                      { backgroundColor: getConditionColor(item.condition) },
                    ]}
                  >
                    <Text style={styles.conditionIcon}>
                      {getConditionIcon(item.condition)}
                    </Text>
                    <Text style={styles.conditionText}>{item.condition}</Text>
                  </View>
                </View>

                <Text style={styles.equipmentName}>{item.name}</Text>

                <View style={styles.equipmentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{item.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>👤</Text>
                    <Text style={styles.detailText}>
                      {item.responsiblePerson}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🔍</Text>
                    <Text style={styles.detailText}>
                      Checked: {item.lastChecked}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🔧</Text>
                    <Text
                      style={[
                        styles.detailText,
                        (item.nextMaintenance === 'Overdue' ||
                          item.nextMaintenance === 'Immediate') &&
                          styles.maintenanceUrgent,
                      ]}
                    >
                      Next: {item.nextMaintenance}
                    </Text>
                  </View>
                </View>

                <View style={styles.equipmentFooter}>
                  <Text style={styles.viewDetailsText}>
                    Tap to view details →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No equipment in this category</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1e3a5f',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderTopWidth: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    gap: 8,
    paddingHorizontal: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#1e3a5f',
    borderColor: '#1e3a5f',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  equipmentList: {
    gap: 16,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  equipmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  equipmentId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  equipmentCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  conditionIcon: {
    fontSize: 14,
    color: '#fff',
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  equipmentName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  equipmentDetails: {
    gap: 10,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
  },
  maintenanceUrgent: {
    color: '#ef4444',
    fontWeight: '600',
  },
  equipmentFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#1e3a5f',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
});

export default EquipmentOverview;
