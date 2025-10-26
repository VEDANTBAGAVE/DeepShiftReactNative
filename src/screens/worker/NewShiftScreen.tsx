import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NewShiftNavigationProp = StackNavigationProp<RootStackParamList>;

const NewShiftScreen: React.FC = () => {
  const navigation = useNavigation<NewShiftNavigationProp>();

  const handleUseExisting = () => {
    // Navigate to existing NewShiftLogScreen for now
    navigation.navigate('NewShiftLogScreen');
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
          <Text style={styles.headerTitle}>New Shift</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>🚧</Text>
          <Text style={styles.comingSoonTitle}>Enhanced Shift Form</Text>
          <Text style={styles.comingSoonText}>
            The new 6-section shift form with autosave, photo capture, and
            validation is under construction.
          </Text>
          <Text style={styles.comingSoonText}>
            For now, you can use the existing shift log form.
          </Text>

          <TouchableOpacity
            style={styles.existingButton}
            onPress={handleUseExisting}
          >
            <Text style={styles.existingButtonText}>
              Use Existing Shift Log Form →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featurePreview}>
          <Text style={styles.previewTitle}>Coming Soon Features:</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>
              ✓ Step 1 of 6 progress indicator
            </Text>
            <Text style={styles.featureItem}>
              ✓ Auto-save draft every 30 seconds
            </Text>
            <Text style={styles.featureItem}>
              ✓ Equipment section with photo requirements
            </Text>
            <Text style={styles.featureItem}>
              ✓ Safety gas readings validation
            </Text>
            <Text style={styles.featureItem}>
              ✓ Work summary with character counter
            </Text>
            <Text style={styles.featureItem}>
              ✓ Attachments with camera/gallery
            </Text>
          </View>
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
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  comingSoon: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 24,
  },
  comingSoonIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  existingButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  existingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featurePreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});

export default NewShiftScreen;
