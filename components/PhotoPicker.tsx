
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface PhotoPickerProps {
  currentPhoto?: string;
  onPhotoSelected: (uri: string) => void;
  onPhotoRemoved: () => void;
  size?: number;
  style?: any;
}

export default function PhotoPicker({ 
  currentPhoto, 
  onPhotoSelected, 
  onPhotoRemoved, 
  size = 120,
  style 
}: PhotoPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
        console.log('Photo selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
        console.log('Photo taken:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showRemoveOptions = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Remove', onPress: onPhotoRemoved, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.photoContainer,
          { width: size, height: size },
          isLoading && styles.loading
        ]}
        onPress={currentPhoto ? showRemoveOptions : showPhotoOptions}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {currentPhoto ? (
          <>
            <Image 
              source={{ uri: currentPhoto }} 
              style={[styles.photo, { width: size, height: size }]}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Icon name="camera" size={20} color={colors.card} />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Icon 
              name={isLoading ? "hourglass" : "camera"} 
              size={size * 0.3} 
              color={colors.textLight} 
            />
            <Text style={styles.placeholderText}>
              {isLoading ? 'Loading...' : 'Add Photo'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {!currentPhoto && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={showPhotoOptions}
            disabled={isLoading}
          >
            <Icon name="camera" size={16} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  photoContainer: {
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  photo: {
    borderRadius: 60,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  loading: {
    opacity: 0.6,
  },
  buttonContainer: {
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
