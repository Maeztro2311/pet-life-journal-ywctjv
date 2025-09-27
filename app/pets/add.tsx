
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { Pet } from '../../types';
import { savePet } from '../../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import PhotoPicker from '../../components/PhotoPicker';
import EnhancedButton from '../../components/EnhancedButton';

export default function AddPetScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'birth' | 'adoption' | null>(null);
  
  const [petData, setPetData] = useState<Partial<Pet>>({
    name: '',
    nickname: '',
    species: '',
    breed: '',
    color: '',
    uniqueFeatures: '',
    notes: '',
    profileImage: undefined,
    dateOfBirth: undefined,
    adoptionDate: undefined,
  });

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSave = async () => {
    if (!petData.name?.trim()) {
      Alert.alert('Error', 'Pet name is required');
      return;
    }

    if (!petData.species?.trim()) {
      Alert.alert('Error', 'Pet species is required');
      return;
    }

    setSaving(true);
    try {
      const newPet: Pet = {
        id: generateId(),
        name: petData.name.trim(),
        nickname: petData.nickname?.trim(),
        species: petData.species.trim(),
        breed: petData.breed?.trim(),
        color: petData.color?.trim(),
        uniqueFeatures: petData.uniqueFeatures?.trim(),
        notes: petData.notes?.trim(),
        profileImage: petData.profileImage,
        dateOfBirth: petData.dateOfBirth,
        adoptionDate: petData.adoptionDate,
        isMemorial: false,
      };

      await savePet(newPet);
      console.log('New pet added successfully:', newPet.name);
      Alert.alert('Success', 'Pet added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    
    if (selectedDate) {
      if (showDatePicker === 'birth') {
        setPetData(prev => ({ ...prev, dateOfBirth: selectedDate }));
      } else if (showDatePicker === 'adoption') {
        setPetData(prev => ({ ...prev, adoptionDate: selectedDate }));
      }
    }
  };

  const handlePhotoSelected = (uri: string) => {
    setPetData(prev => ({ ...prev, profileImage: uri }));
    console.log('Photo selected for new pet:', uri);
  };

  const handlePhotoRemoved = () => {
    setPetData(prev => ({ ...prev, profileImage: undefined }));
    console.log('Photo removed from new pet');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ marginRight: 16 }}
          disabled={saving}
        >
          <Icon name="arrow-back" size={24} color={saving ? colors.textLight : colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.subtitle}>Add New Pet</Text>
        </View>
        <EnhancedButton
          text="Save"
          onPress={handleSave}
          variant="primary"
          size="small"
          loading={saving}
          disabled={saving || !petData.name?.trim() || !petData.species?.trim()}
        />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Profile Photo Section */}
          <View style={[commonStyles.card, { marginBottom: 20, alignItems: 'center' }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Profile Photo</Text>
            <PhotoPicker
              currentPhoto={petData.profileImage}
              onPhotoSelected={handlePhotoSelected}
              onPhotoRemoved={handlePhotoRemoved}
              size={120}
            />
          </View>

          {/* Basic Information */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Basic Information</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Name *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={petData.name}
                onChangeText={(text) => setPetData(prev => ({ ...prev, name: text }))}
                placeholder="Enter pet's name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Nickname</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={petData.nickname}
                onChangeText={(text) => setPetData(prev => ({ ...prev, nickname: text }))}
                placeholder="Enter nickname (optional)"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Species *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={petData.species}
                onChangeText={(text) => setPetData(prev => ({ ...prev, species: text }))}
                placeholder="e.g., Dog, Cat, Bird"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Breed</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={petData.breed}
                onChangeText={(text) => setPetData(prev => ({ ...prev, breed: text }))}
                placeholder="Enter breed (optional)"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Color</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={petData.color}
                onChangeText={(text) => setPetData(prev => ({ ...prev, color: text }))}
                placeholder="Enter color (optional)"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          {/* Important Dates */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Important Dates</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Date of Birth</Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors.background,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onPress={() => setShowDatePicker('birth')}
              >
                <Text style={{ fontSize: 16, color: petData.dateOfBirth ? colors.text : colors.textLight }}>
                  {petData.dateOfBirth ? petData.dateOfBirth.toLocaleDateString() : 'Select date of birth (optional)'}
                </Text>
                <Icon name="calendar" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Adoption Date</Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors.background,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onPress={() => setShowDatePicker('adoption')}
              >
                <Text style={{ fontSize: 16, color: petData.adoptionDate ? colors.text : colors.textLight }}>
                  {petData.adoptionDate ? petData.adoptionDate.toLocaleDateString() : 'Select adoption date (optional)'}
                </Text>
                <Icon name="calendar" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Information */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Additional Information</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Unique Features</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={petData.uniqueFeatures}
                onChangeText={(text) => setPetData(prev => ({ ...prev, uniqueFeatures: text }))}
                placeholder="Describe unique features or markings (optional)"
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Notes</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={petData.notes}
                onChangeText={(text) => setPetData(prev => ({ ...prev, notes: text }))}
                placeholder="Any additional notes about your pet (optional)"
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>
          </View>

          {/* Save Button */}
          <EnhancedButton
            text="Add Pet"
            onPress={handleSave}
            variant="primary"
            size="large"
            fullWidth
            loading={saving}
            disabled={saving || !petData.name?.trim() || !petData.species?.trim()}
            icon="add"
          />
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'birth' 
              ? petData.dateOfBirth || new Date()
              : petData.adoptionDate || new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}
