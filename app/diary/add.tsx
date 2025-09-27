
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { DiaryEntry, Pet } from '../../types';
import { saveDiaryEntry, loadPets } from '../../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import EnhancedButton from '../../components/EnhancedButton';

const MOODS = [
  { id: 'happy', label: 'Happy', icon: 'happy', color: colors.success },
  { id: 'sad', label: 'Sad', icon: 'sad', color: colors.error },
  { id: 'excited', label: 'Excited', icon: 'flash', color: colors.warning },
  { id: 'calm', label: 'Calm', icon: 'leaf', color: colors.accent },
  { id: 'playful', label: 'Playful', icon: 'football', color: colors.primary },
  { id: 'tired', label: 'Tired', icon: 'bed', color: colors.textLight },
];

export default function AddDiaryEntryScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [entryData, setEntryData] = useState<Partial<DiaryEntry>>({
    title: '',
    memo: '',
    date: new Date(),
    mood: undefined,
    petId: undefined,
    photos: [],
  });

  useEffect(() => {
    loadPetsData();
  }, []);

  const loadPetsData = async () => {
    try {
      const petsData = await loadPets();
      setPets(petsData);
      console.log('Pets loaded for diary entry:', petsData.length);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSave = async () => {
    if (!entryData.memo?.trim()) {
      Alert.alert('Error', 'Please write something in your diary entry');
      return;
    }

    setSaving(true);
    try {
      const newEntry: DiaryEntry = {
        id: generateId(),
        title: entryData.title?.trim(),
        memo: entryData.memo.trim(),
        date: entryData.date || new Date(),
        mood: entryData.mood as any,
        petId: entryData.petId,
        photos: entryData.photos || [],
        videos: [],
      };

      await saveDiaryEntry(newEntry);
      console.log('New diary entry added successfully');
      Alert.alert('Success', 'Diary entry added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding diary entry:', error);
      Alert.alert('Error', 'Failed to add diary entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setEntryData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime && entryData.date) {
      const newDate = new Date(entryData.date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEntryData(prev => ({ ...prev, date: newDate }));
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
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ marginRight: 16 }}
          disabled={saving}
        >
          <Icon name="arrow-back" size={24} color={saving ? colors.textLight : colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.subtitle}>New Diary Entry</Text>
        </View>
        <EnhancedButton
          text="Save"
          onPress={handleSave}
          variant="primary"
          size="small"
          loading={saving}
          disabled={saving || !entryData.memo?.trim()}
        />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Date and Time */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Date & Time</Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
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
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {entryData.date?.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={20} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
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
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {entryData.date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Icon name="time" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pet Selection */}
          {pets.length > 0 && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Pet (Optional)</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: !entryData.petId ? colors.primary : colors.backgroundAlt,
                      borderWidth: 1,
                      borderColor: !entryData.petId ? colors.primary : colors.border,
                    }}
                    onPress={() => setEntryData(prev => ({ ...prev, petId: undefined }))}
                  >
                    <Text style={{ 
                      color: !entryData.petId ? colors.card : colors.text,
                      fontWeight: '600'
                    }}>
                      General
                    </Text>
                  </TouchableOpacity>
                  
                  {pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: entryData.petId === pet.id ? colors.primary : colors.backgroundAlt,
                        borderWidth: 1,
                        borderColor: entryData.petId === pet.id ? colors.primary : colors.border,
                      }}
                      onPress={() => setEntryData(prev => ({ ...prev, petId: pet.id }))}
                    >
                      <Text style={{ 
                        color: entryData.petId === pet.id ? colors.card : colors.text,
                        fontWeight: '600'
                      }}>
                        {pet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Mood Selection */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Mood (Optional)</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: entryData.mood === mood.id ? mood.color : colors.backgroundAlt,
                    borderWidth: 1,
                    borderColor: entryData.mood === mood.id ? mood.color : colors.border,
                  }}
                  onPress={() => setEntryData(prev => ({ 
                    ...prev, 
                    mood: prev.mood === mood.id ? undefined : mood.id as any
                  }))}
                >
                  <Icon 
                    name={mood.icon as any} 
                    size={16} 
                    color={entryData.mood === mood.id ? colors.card : colors.text}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ 
                    color: entryData.mood === mood.id ? colors.card : colors.text,
                    fontWeight: '600',
                    fontSize: 12
                  }}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Title (Optional)</Text>
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
              value={entryData.title}
              onChangeText={(text) => setEntryData(prev => ({ ...prev, title: text }))}
              placeholder="Give your entry a title"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Diary Entry */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Your Entry</Text>
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
                minHeight: 120,
                textAlignVertical: 'top'
              }}
              value={entryData.memo}
              onChangeText={(text) => setEntryData(prev => ({ ...prev, memo: text }))}
              placeholder="What happened today? Share your thoughts, memories, or observations about your pets..."
              placeholderTextColor={colors.textLight}
              multiline
            />
          </View>

          {/* Save Button */}
          <EnhancedButton
            text="Save Entry"
            onPress={handleSave}
            variant="primary"
            size="large"
            fullWidth
            loading={saving}
            disabled={saving || !entryData.memo?.trim()}
            icon="checkmark"
          />
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={entryData.date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={entryData.date || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
