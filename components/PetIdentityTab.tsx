
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Pet } from '../types';
import { savePet } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import PhotoPicker from './PhotoPicker';
import EnhancedButton from './EnhancedButton';

interface PetIdentityTabProps {
  pet: Pet;
  onPetUpdate: (pet: Pet) => void;
}

export default function PetIdentityTab({ pet, onPetUpdate }: PetIdentityTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPet, setEditedPet] = useState<Pet>(pet);
  const [showDatePicker, setShowDatePicker] = useState<'birth' | 'adoption' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editedPet.name?.trim()) {
      Alert.alert('Error', 'Pet name is required');
      return;
    }

    if (!editedPet.species?.trim()) {
      Alert.alert('Error', 'Pet species is required');
      return;
    }

    setSaving(true);
    try {
      await savePet(editedPet);
      onPetUpdate(editedPet);
      setIsEditing(false);
      console.log('Pet identity updated successfully');
      Alert.alert('Success', 'Pet information updated successfully!');
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPet(pet);
    setIsEditing(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(null);
    }
    
    if (selectedDate) {
      if (showDatePicker === 'birth') {
        setEditedPet(prev => ({ ...prev, dateOfBirth: selectedDate }));
      } else if (showDatePicker === 'adoption') {
        setEditedPet(prev => ({ ...prev, adoptionDate: selectedDate }));
      }
    }
  };

  const handlePhotoSelected = (uri: string) => {
    console.log('Photo selected for pet:', uri);
    setEditedPet(prev => ({ ...prev, profileImage: uri }));
  };

  const handlePhotoRemoved = () => {
    console.log('Photo removed from pet');
    setEditedPet(prev => ({ ...prev, profileImage: undefined }));
  };

  const calculateAge = (birthDate: Date): string => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMs = today.getTime() - birth.getTime();
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
    const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (ageInYears > 0) {
      return `${ageInYears} year${ageInYears > 1 ? 's' : ''} ${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
    } else {
      return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 20 }}>
        {/* Profile Photo Section */}
        <View style={[commonStyles.card, { marginBottom: 20, alignItems: 'center' }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Profile Photo</Text>
          
          <PhotoPicker
            currentPhoto={isEditing ? editedPet.profileImage : pet.profileImage}
            onPhotoSelected={isEditing ? handlePhotoSelected : () => {}}
            onPhotoRemoved={isEditing ? handlePhotoRemoved : () => {}}
            size={120}
          />
        </View>

        {/* Edit Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
          {!isEditing ? (
            <EnhancedButton
              text="Edit"
              onPress={() => setIsEditing(true)}
              variant="accent"
              size="medium"
              icon="create"
            />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <EnhancedButton
                text="Cancel"
                onPress={handleCancel}
                variant="outline"
                size="medium"
                disabled={saving}
              />
              <EnhancedButton
                text="Save"
                onPress={handleSave}
                variant="primary"
                size="medium"
                loading={saving}
                disabled={saving}
              />
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Basic Information</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Name</Text>
            {isEditing ? (
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
                value={editedPet.name}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, name: text }))}
                placeholder="Enter pet's name"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{pet.name}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Nickname</Text>
            {isEditing ? (
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
                value={editedPet.nickname || ''}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, nickname: text }))}
                placeholder="Enter nickname"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{pet.nickname || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Species</Text>
            {isEditing ? (
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
                value={editedPet.species}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, species: text }))}
                placeholder="Enter species"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{pet.species}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Breed</Text>
            {isEditing ? (
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
                value={editedPet.breed || ''}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, breed: text }))}
                placeholder="Enter breed"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{pet.breed || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Color</Text>
            {isEditing ? (
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
                value={editedPet.color || ''}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, color: text }))}
                placeholder="Enter color"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{pet.color || 'Not specified'}</Text>
            )}
          </View>
        </View>

        {/* Important Dates */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Important Dates</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Date of Birth</Text>
            {isEditing ? (
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
                <Text style={{ fontSize: 16, color: editedPet.dateOfBirth ? colors.text : colors.textLight }}>
                  {editedPet.dateOfBirth ? editedPet.dateOfBirth.toLocaleDateString() : 'Select date of birth'}
                </Text>
                <Icon name="calendar" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ) : (
              <View>
                <Text style={commonStyles.text}>
                  {pet.dateOfBirth ? pet.dateOfBirth.toLocaleDateString() : 'Not specified'}
                </Text>
                {pet.dateOfBirth && (
                  <Text style={[commonStyles.textLight, { marginTop: 4 }]}>
                    Age: {calculateAge(pet.dateOfBirth)}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Adoption Date</Text>
            {isEditing ? (
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
                <Text style={{ fontSize: 16, color: editedPet.adoptionDate ? colors.text : colors.textLight }}>
                  {editedPet.adoptionDate ? editedPet.adoptionDate.toLocaleDateString() : 'Select adoption date'}
                </Text>
                <Icon name="calendar" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ) : (
              <Text style={commonStyles.text}>
                {pet.adoptionDate ? pet.adoptionDate.toLocaleDateString() : 'Not specified'}
              </Text>
            )}
          </View>
        </View>

        {/* Additional Information */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Additional Information</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Unique Features</Text>
            {isEditing ? (
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
                value={editedPet.uniqueFeatures || ''}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, uniqueFeatures: text }))}
                placeholder="Describe unique features or markings"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{pet.uniqueFeatures || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Notes</Text>
            {isEditing ? (
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
                value={editedPet.notes || ''}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, notes: text }))}
                placeholder="Any additional notes about your pet"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{pet.notes || 'No additional notes'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'birth' 
              ? editedPet.dateOfBirth || new Date()
              : editedPet.adoptionDate || new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
}
