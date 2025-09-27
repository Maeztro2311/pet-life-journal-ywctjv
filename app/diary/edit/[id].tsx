
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '../../../components/Icon';
import { DiaryEntry, Pet } from '../../../types';
import { loadDiaryEntries, loadPets, saveDiaryEntry } from '../../../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import EnhancedButton from '../../../components/EnhancedButton';

const MOODS = [
  { value: 'happy', label: 'Happy', icon: 'happy', color: colors.secondary },
  { value: 'sad', label: 'Sad', icon: 'sad', color: colors.textLight },
  { value: 'excited', label: 'Excited', icon: 'flash', color: colors.warning },
  { value: 'calm', label: 'Calm', icon: 'leaf', color: colors.accent },
  { value: 'playful', label: 'Playful', icon: 'game-controller', color: colors.purple },
  { value: 'tired', label: 'Tired', icon: 'bed', color: colors.primary },
];

export default function EditDiaryEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (id) {
      loadEntryData();
    }
  }, [id]);

  const loadEntryData = async () => {
    try {
      console.log('Loading diary entry for edit:', id);
      const [entriesData, petsData] = await Promise.all([
        loadDiaryEntries(),
        loadPets()
      ]);
      
      const foundEntry = entriesData.find(e => e.id === id);
      if (foundEntry) {
        setEntry(foundEntry);
        setPets(petsData);
        
        // Populate form fields
        setTitle(foundEntry.title || '');
        setMemo(foundEntry.memo || '');
        setSelectedPetId(foundEntry.petId || '');
        setSelectedMood(foundEntry.mood || '');
        
        const entryDate = new Date(foundEntry.date);
        setSelectedDate(entryDate);
        setSelectedTime(entryDate);
        
        console.log('Diary entry loaded for editing successfully');
      } else {
        console.error('Diary entry not found for editing:', id);
        Alert.alert('Error', 'Diary entry not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading diary entry for edit:', error);
      Alert.alert('Error', 'Failed to load diary entry');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSave = async () => {
    if (!memo.trim()) {
      Alert.alert('Error', 'Please enter a memo for your diary entry');
      return;
    }

    setSaving(true);
    try {
      // Combine date and time
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());

      const updatedEntry: DiaryEntry = {
        id: entry?.id || generateId(),
        petId: selectedPetId || undefined,
        date: combinedDateTime,
        title: title.trim() || undefined,
        memo: memo.trim(),
        photos: entry?.photos || [],
        mood: selectedMood as any || undefined,
      };

      await saveDiaryEntry(updatedEntry);
      console.log('Diary entry updated successfully');
      Alert.alert('Success', 'Diary entry updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating diary entry:', error);
      Alert.alert('Error', 'Failed to update diary entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Entry not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginHorizontal: 16 }]}>
          Edit Entry
        </Text>
        
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Title */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Title (Optional)</Text>
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
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title for your entry"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Pet Selection */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Pet (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: !selectedPetId ? colors.primary : colors.backgroundAlt,
                    borderWidth: 1,
                    borderColor: !selectedPetId ? colors.primary : colors.border
                  }}
                  onPress={() => setSelectedPetId('')}
                >
                  <Text style={{
                    color: !selectedPetId ? colors.text : colors.textLight,
                    fontWeight: !selectedPetId ? '600' : 'normal'
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
                      backgroundColor: selectedPetId === pet.id ? colors.primary : colors.backgroundAlt,
                      borderWidth: 1,
                      borderColor: selectedPetId === pet.id ? colors.primary : colors.border
                    }}
                    onPress={() => setSelectedPetId(pet.id)}
                  >
                    <Text style={{
                      color: selectedPetId === pet.id ? colors.text : colors.textLight,
                      fontWeight: selectedPetId === pet.id ? '600' : 'normal'
                    }}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Date and Time */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Date & Time</Text>
            
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
                  {selectedDate.toLocaleDateString()}
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
                  {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Icon name="time" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mood Selection */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Mood (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: !selectedMood ? colors.primary : colors.backgroundAlt,
                    borderWidth: 1,
                    borderColor: !selectedMood ? colors.primary : colors.border
                  }}
                  onPress={() => setSelectedMood('')}
                >
                  <Icon name="remove" size={20} color={!selectedMood ? colors.text : colors.textLight} />
                  <Text style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: !selectedMood ? colors.text : colors.textLight,
                    fontWeight: !selectedMood ? '600' : 'normal'
                  }}>
                    None
                  </Text>
                </TouchableOpacity>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={{
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: selectedMood === mood.value ? mood.color : colors.backgroundAlt,
                      borderWidth: 1,
                      borderColor: selectedMood === mood.value ? mood.color : colors.border
                    }}
                    onPress={() => setSelectedMood(mood.value)}
                  >
                    <Icon name={mood.icon as any} size={20} color={colors.text} />
                    <Text style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: colors.text,
                      fontWeight: selectedMood === mood.value ? '600' : 'normal'
                    }}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Memo */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Memo</Text>
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
              value={memo}
              onChangeText={setMemo}
              placeholder="What happened today? How is your pet doing?"
              placeholderTextColor={colors.textLight}
              multiline
            />
          </View>

          {/* Save Button */}
          <EnhancedButton
            text="Update Entry"
            onPress={handleSave}
            variant="primary"
            size="large"
            loading={saving}
            disabled={saving}
            style={{ marginBottom: 40 }}
          />
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
