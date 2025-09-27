
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

const MOODS = [
  { id: 'happy', label: 'Happy', icon: 'happy', color: colors.secondary },
  { id: 'excited', label: 'Excited', icon: 'flash', color: colors.warning },
  { id: 'calm', label: 'Calm', icon: 'leaf', color: colors.accent },
  { id: 'playful', label: 'Playful', icon: 'game-controller', color: colors.purple },
  { id: 'tired', label: 'Tired', icon: 'bed', color: colors.primary },
  { id: 'sad', label: 'Sad', icon: 'sad', color: colors.textLight },
];

export default function AddDiaryEntryScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [entry, setEntry] = useState<Partial<DiaryEntry>>({
    title: '',
    memo: '',
    date: new Date(),
    mood: 'happy',
    petId: undefined,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPetsData();
  }, []);

  const loadPetsData = async () => {
    try {
      const petsData = await loadPets();
      setPets(petsData);
      console.log(`Loaded ${petsData.length} pets for diary entry`);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const handleSave = async () => {
    if (!entry.memo?.trim()) {
      Alert.alert('Error', 'Please write something in your diary entry');
      return;
    }

    setSaving(true);
    try {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        petId: entry.petId,
        date: entry.date || new Date(),
        title: entry.title?.trim(),
        memo: entry.memo.trim(),
        mood: entry.mood as any,
        photos: [],
        videos: [],
      };

      await saveDiaryEntry(newEntry);
      console.log('Diary entry saved successfully');
      Alert.alert('Success', 'Diary entry saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving diary entry:', error);
      Alert.alert('Error', 'Failed to save diary entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setEntry(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime && entry.date) {
      const newDate = new Date(entry.date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEntry(prev => ({ ...prev, date: newDate }));
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
        <Text style={[commonStyles.subtitle, { flex: 1 }]}>New Diary Entry</Text>
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
          {/* Date and Time */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>When</Text>
            
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
                  {entry.date?.toLocaleDateString()}
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
                  {entry.date?.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
                <Icon name="time" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pet Selection */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>About</Text>
            
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Pet (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: !entry.petId ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginRight: 8
                }}
                onPress={() => setEntry(prev => ({ ...prev, petId: undefined }))}
              >
                <Text style={{
                  color: !entry.petId ? colors.text : colors.textLight,
                  fontWeight: !entry.petId ? '600' : '400'
                }}>
                  General
                </Text>
              </TouchableOpacity>
              
              {pets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: entry.petId === pet.id ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: 8
                  }}
                  onPress={() => setEntry(prev => ({ ...prev, petId: pet.id }))}
                >
                  <Text style={{
                    color: entry.petId === pet.id ? colors.text : colors.textLight,
                    fontWeight: entry.petId === pet.id ? '600' : '400'
                  }}>
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Mood Selection */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.text, { marginBottom: 12, fontWeight: '600' }]}>Mood</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MOODS.map(mood => (
                <TouchableOpacity
                  key={mood.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: entry.mood === mood.id ? mood.color : colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => setEntry(prev => ({ ...prev, mood: mood.id as any }))}
                >
                  <Icon 
                    name={mood.icon as any} 
                    size={16} 
                    color={entry.mood === mood.id ? colors.text : colors.textLight}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{
                    color: entry.mood === mood.id ? colors.text : colors.textLight,
                    fontWeight: entry.mood === mood.id ? '600' : '400'
                  }}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Title (Optional)</Text>
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
              value={entry.title}
              onChangeText={(text) => setEntry(prev => ({ ...prev, title: text }))}
              placeholder="Give your entry a title"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Memo */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>What happened today? *</Text>
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
              value={entry.memo}
              onChangeText={(text) => setEntry(prev => ({ ...prev, memo: text }))}
              placeholder="Write about your pet's day, special moments, or anything noteworthy..."
              placeholderTextColor={colors.textLight}
              multiline
            />
          </View>

          {/* Future: Photo/Video Upload */}
          <View style={[commonStyles.card, { marginBottom: 40 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Media (Coming Soon)</Text>
            <View style={{
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: 'dashed',
              borderRadius: 12,
              padding: 40,
              alignItems: 'center'
            }}>
              <Icon name="camera" size={32} color={colors.textLight} style={{ marginBottom: 8 }} />
              <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
                Photo and video uploads coming soon!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={entry.date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={entry.date || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
