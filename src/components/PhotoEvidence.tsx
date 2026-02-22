import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PhotoItem {
  id: string;
  uri: string;
  timestamp: number;
  size?: number; // file size in bytes
  width?: number;
  height?: number;
}

interface PhotoEvidenceProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
  required?: boolean;
  evidenceType?: 'incident' | 'equipment' | 'general';
  title?: string;
  description?: string;
}

const PhotoEvidence: React.FC<PhotoEvidenceProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  required = false,
  evidenceType = 'general',
  title = 'Photo Evidence',
  description,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Compress image to reduce file size
  const compressImage = (asset: Asset): PhotoItem => {
    // In production, you'd use a library like react-native-image-resizer
    // For now, we'll just use the asset as-is
    return {
      id: `photo-${Date.now()}-${Math.random()}`,
      uri: asset.uri || '',
      timestamp: Date.now(),
      size: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  };

  const handleCameraCapture = async () => {
    setShowPicker(false);
    setIsLoading(true);

    try {
      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        saveToPhotos: true,
      });

      if (result.didCancel) {
        setIsLoading(false);
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to capture photo');
        setIsLoading(false);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const newPhoto = compressImage(result.assets[0]);
        onPhotosChange([...photos, newPhoto]);
      }

      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
      setIsLoading(false);
    }
  };

  const handleGalleryPick = async () => {
    setShowPicker(false);
    setIsLoading(true);

    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        selectionLimit: Math.max(1, maxPhotos - photos.length),
      });

      if (result.didCancel) {
        setIsLoading(false);
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select photo');
        setIsLoading(false);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const newPhotos = result.assets.map(asset => compressImage(asset));
        onPhotosChange([...photos, ...newPhotos]);
      }

      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onPhotosChange(photos.filter(p => p.id !== photoId));
          setSelectedPhoto(null);
        },
      },
    ]);
  };

  const handleViewPhoto = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
  };

  const getEvidenceRuleText = () => {
    switch (evidenceType) {
      case 'incident':
        return '📷 Photo evidence is required for all incidents';
      case 'equipment':
        return '📷 Photo evidence recommended for equipment issues';
      case 'general':
      default:
        return '📷 Add photos to provide visual evidence';
    }
  };

  const canAddMorePhotos = photos.length < maxPhotos;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {required && <Text style={styles.requiredBadge}>Required</Text>}
        </View>
        <View style={styles.photoCount}>
          <Text style={styles.photoCountText}>
            {photos.length}/{maxPhotos}
          </Text>
        </View>
      </View>

      {description && <Text style={styles.description}>{description}</Text>}

      {/* Evidence Rule */}
      <View
        style={[
          styles.ruleBox,
          evidenceType === 'incident' && styles.ruleBoxRequired,
        ]}
      >
        <Text
          style={[
            styles.ruleText,
            evidenceType === 'incident' && styles.ruleTextRequired,
          ]}
        >
          {getEvidenceRuleText()}
        </Text>
      </View>

      {/* Thumbnail Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.thumbnailGrid}>
          {photos.map(photo => (
            <TouchableOpacity
              key={photo.id}
              style={styles.thumbnail}
              onPress={() => handleViewPhoto(photo)}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.thumbnailImage}
              />
              <TouchableOpacity
                style={styles.deleteThumbnail}
                onPress={() => handleDeletePhoto(photo.id)}
              >
                <Text style={styles.deleteThumbnailText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Add Photo Button */}
          {canAddMorePhotos && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => setShowPicker(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#f59e0b" />
              ) : (
                <>
                  <Text style={styles.addPhotoIcon}>📷</Text>
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Validation Message */}
      {required && photos.length === 0 && (
        <View style={styles.validationBox}>
          <Text style={styles.validationText}>
            ⚠️ At least one photo is required
          </Text>
        </View>
      )}

      {/* Photo Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add Photo</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.pickerOption}
              onPress={handleCameraCapture}
            >
              <Text style={styles.pickerOptionIcon}>📸</Text>
              <View style={styles.pickerOptionContent}>
                <Text style={styles.pickerOptionTitle}>Take Photo</Text>
                <Text style={styles.pickerOptionDescription}>
                  Use camera to capture evidence
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerOption}
              onPress={handleGalleryPick}
            >
              <Text style={styles.pickerOptionIcon}>🖼️</Text>
              <View style={styles.pickerOptionContent}>
                <Text style={styles.pickerOptionTitle}>
                  Choose from Gallery
                </Text>
                <Text style={styles.pickerOptionDescription}>
                  Select existing photos (max {maxPhotos - photos.length})
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Zoom Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.zoomModalOverlay}>
          <View style={styles.zoomHeader}>
            <TouchableOpacity
              style={styles.zoomCloseButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Text style={styles.zoomCloseText}>✕ Close</Text>
            </TouchableOpacity>
            {selectedPhoto && (
              <TouchableOpacity
                style={styles.zoomDeleteButton}
                onPress={() => handleDeletePhoto(selectedPhoto.id)}
              >
                <Text style={styles.zoomDeleteText}>🗑️ Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.zoomScrollView}
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            )}
          </ScrollView>

          {selectedPhoto && (
            <View style={styles.zoomFooter}>
              <Text style={styles.zoomFooterText}>
                Added: {new Date(selectedPhoto.timestamp).toLocaleString()}
              </Text>
              {selectedPhoto.size && (
                <Text style={styles.zoomFooterText}>
                  Size: {(selectedPhoto.size / 1024).toFixed(0)} KB
                </Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  requiredBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  photoCount: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },
  ruleBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  ruleBoxRequired: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  ruleText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  ruleTextRequired: {
    color: '#991b1b',
  },
  thumbnailGrid: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  deleteThumbnail: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteThumbnailText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  validationBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  validationText: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  pickerClose: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: 'bold',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  pickerOptionIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  pickerOptionContent: {
    flex: 1,
  },
  pickerOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  pickerOptionDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  pickerCancel: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  zoomModalOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  zoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  zoomCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  zoomCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  zoomDeleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  zoomDeleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  zoomScrollView: {
    flex: 1,
  },
  zoomContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 150,
  },
  zoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  zoomFooterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default PhotoEvidence;
