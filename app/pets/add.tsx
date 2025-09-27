
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

export default function AddPetScreen() {
  const router = useRouter();
  const [pet, setPet] = useState<Partial<Pet>>({
    name: '',
    nickname: '',
    species: '',
    breed: '',
    color: '',
    uniqueFeatures: '',
    notes: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState<'birth' | 'adoption' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!pet.name?.trim()) {
      Alert.alert('Error', 'Please enter a name for your pet');
      return;
    }

    if (!pet.species?.trim()) {
      Alert.alert('Error', 'Please enter the species of your pet');
      return;
    }

    setSaving(true);
    try {
      const newPet: Pet = {
        id: Date.now().toString(),
        name: pet.name.trim(),
        nickname: pet.nickname?.trim(),
        species: pet.species.trim(),
        breed: pet.breed?.trim(),
        color: pet.color?.trim(),
        uniqueFeatures: pet.uniqueFeatures?.trim(),
        dateOfBirth: pet.dateOfBirth,
        adoptionDate: pet.adoptionDate,
        breeder: pet.breeder?.trim(),
        adoptionFee: pet.adoptionFee,
        notes: pet.notes?.trim(),
        isMemorial: false,
      };

      await savePet(newPet);
      console.log('Pet saved successfully:', newPet.name);
      Alert.alert('Success', 'Pet added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please try again.');
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
        setPet(prev => ({ ...prev, dateOfBirth: selectedDate }));
      } else if (showDatePicker === 'adoption') {
        setPet(prev => ({ ...prev, adoptionDate: selectedDate }));
      }
    }
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
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.subtitle, { flex: 1 }]}>Add New Pet</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            opacity: saving ? 0.6 : 1
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
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
                value={pet.name}
                onChangeText={(text) => setPet(prev => ({ ...prev, name: text }))}
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
                value={pet.nickname}
                onChangeText={(text) => setPet(prev => ({ ...prev, nickname: text }))}
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
                value={pet.species}
                onChangeText={(text) => setPet(prev => ({ ...prev, species: text }))}
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
                value={pet.breed}
                onChangeText={(text) => setPet(prev => ({ ...prev, breed: text }))}
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
                value={pet.color}
                onChangeText={(text) => setPet(prev => ({ ...prev, color: text }))}
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
                <Text style={{ fontSize: 16, color: pet.dateOfBirth ? colors.text : colors.textLight }}>
                  {pet.dateOfBirth ? pet.dateOfBirth.toLocaleDateString() : 'Select date of birth'}
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
                <Text style={{ fontSize: 16, color: pet.adoptionDate ? colors.text : colors.textLight }}>
                  {pet.adoptionDate ? pet.adoptionDate.toLocaleDateString() : 'Select adoption date'}
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
                value={pet.uniqueFeatures}
                onChangeText={(text) => setPet(prev => ({ ...prev, uniqueFeatures: text }))}
                placeholder="Describe unique features or markings"
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
                value={pet.notes}
                onChangeText={(text) => setPet(prev => ({ ...prev, notes: text }))}
                placeholder="Any additional notes about your pet"
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'birth' 
              ? pet.dateOfBirth || new Date()
              : pet.adoptionDate || new Date()
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
