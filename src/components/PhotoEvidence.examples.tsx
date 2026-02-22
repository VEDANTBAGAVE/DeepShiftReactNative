/**
 * PhotoEvidence Component - Usage Examples
 *
 * This file demonstrates how to use the PhotoEvidence component
 * in different contexts throughout the app.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import PhotoEvidence, { PhotoItem } from './PhotoEvidence';

/**
 * Example 1: Required Photo Evidence for Incidents
 * Use case: Incident reporting where photos are mandatory
 */
export const IncidentPhotoExample = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  return (
    <View style={styles.container}>
      <PhotoEvidence
        photos={photos}
        onPhotosChange={setPhotos}
        maxPhotos={5}
        required={true}
        evidenceType="incident"
        title="Incident Photos"
        description="Capture photos of the incident location, damaged equipment, or any relevant evidence."
      />
    </View>
  );
};

/**
 * Example 2: Optional Photo Evidence for Equipment
 * Use case: Equipment maintenance where photos are recommended but not required
 */
export const EquipmentPhotoExample = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  return (
    <View style={styles.container}>
      <PhotoEvidence
        photos={photos}
        onPhotosChange={setPhotos}
        maxPhotos={3}
        required={false}
        evidenceType="equipment"
        title="Equipment Condition"
        description="Add photos to document equipment condition and maintenance needs."
      />
    </View>
  );
};

/**
 * Example 3: General Photo Evidence
 * Use case: General documentation in shift reports
 */
export const GeneralPhotoExample = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  return (
    <View style={styles.container}>
      <PhotoEvidence
        photos={photos}
        onPhotosChange={setPhotos}
        maxPhotos={10}
        required={false}
        evidenceType="general"
        title="Shift Documentation"
        description="Add photos to support your shift report (optional)."
      />
    </View>
  );
};

/**
 * Example 4: Integration with Form Validation
 * Shows how to validate photos in a form submission
 */
export const FormWithPhotoValidation = () => {
  const [incidentPhotos, setIncidentPhotos] = useState<PhotoItem[]>([]);
  const [equipmentPhotos, setEquipmentPhotos] = useState<PhotoItem[]>([]);

  const validateAndSubmit = () => {
    // Check if required photos are provided
    if (incidentPhotos.length === 0) {
      // Show error message or prevent submission
      console.log('⚠️ Incident photos are required');
      return false;
    }

    // Submit form with photos
    const formData = {
      incidentPhotos: incidentPhotos.map(p => ({
        uri: p.uri,
        timestamp: p.timestamp,
      })),
      equipmentPhotos: equipmentPhotos.map(p => ({
        uri: p.uri,
        timestamp: p.timestamp,
      })),
    };

    console.log('✅ Submitting form:', formData);
    return true;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Incident Report</Text>

      <PhotoEvidence
        photos={incidentPhotos}
        onPhotosChange={setIncidentPhotos}
        maxPhotos={5}
        required={true}
        evidenceType="incident"
        title="Incident Evidence"
      />

      <PhotoEvidence
        photos={equipmentPhotos}
        onPhotosChange={setEquipmentPhotos}
        maxPhotos={3}
        required={false}
        evidenceType="equipment"
        title="Equipment Photos"
      />

      {/* Your submit button would call validateAndSubmit() */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
});

/**
 * Features of PhotoEvidence Component:
 *
 * ✅ Camera Integration: Launch camera to capture new photos
 * ✅ Gallery Selection: Pick existing photos from device gallery
 * ✅ Multiple Photos: Support for multiple photos with configurable max limit
 * ✅ Thumbnail Grid: Horizontal scrollable grid of photo thumbnails
 * ✅ Zoom View: Full-screen modal to view photos in detail
 * ✅ Delete Function: Remove individual photos with confirmation dialog
 * ✅ Compression: Tracks file size and dimensions for optimization
 * ✅ Validation: Required/optional states with visual indicators
 * ✅ Evidence Rules: Different rules for incident/equipment/general types
 * ✅ Professional UI: Consistent styling with app theme (amber/navy/green)
 * ✅ Loading States: Shows spinner while capturing/selecting photos
 * ✅ Error Handling: Graceful handling of camera/gallery errors
 *
 * Props:
 * - photos: PhotoItem[] - Array of current photos
 * - onPhotosChange: (photos: PhotoItem[]) => void - Callback when photos change
 * - maxPhotos?: number - Maximum number of photos (default: 5)
 * - required?: boolean - Whether photos are required (default: false)
 * - evidenceType?: 'incident' | 'equipment' | 'general' - Type of evidence (default: 'general')
 * - title?: string - Header title (default: 'Photo Evidence')
 * - description?: string - Help text below title
 *
 * PhotoItem Interface:
 * {
 *   id: string;           // Unique identifier
 *   uri: string;          // Local file URI
 *   timestamp: number;    // When photo was added
 *   size?: number;        // File size in bytes
 *   width?: number;       // Image width in pixels
 *   height?: number;      // Image height in pixels
 * }
 */
