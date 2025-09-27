
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { Activity } from '../types';
import Icon from './Icon';
import EnhancedButton from './EnhancedButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface ActivityFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  initialData?: Activity | null;
}

const ACTIVITY_TYPES = [
  { value: 'walk', label: 'Walk', icon: 'walk', color: colors.secondary },
  { value: 'playtime', label: 'Playtime', icon: 'game-controller', color: colors.accent },
  { value: 'training', label: 'Training', icon: 'school', color: colors.purple },
  { value: 'other', label: 'Other', icon: 'fitness', color: colors.yellow },
];

export default function ActivityForm({ isVisible, onClose, onSave, initialData }: ActivityFormProps) {
  const [date, setDate] = useState(initialData?.date || new Date());
  const [type, setType] = useState<'walk' | 'playtime' | 'training' | 'other'>(initialData?.type || 'walk');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [favoriteToys, setFavoriteToys] = useState(initialData?.favoriteToys?.join(', ') || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please add a description');
      return;
    }

    const activity: Activity = {
      id: initialData?.id || Date.now().toString(),
      date,
      type,
      duration: duration ? parseInt(duration) : undefined,
      description: description.trim(),
      favoriteToys: favoriteToys.trim() ? favoriteToys.split(',').map(toy => toy.trim()).filter(toy => toy) : undefined,
    };

    onSave(activity);
    handleClose();
  };

  const handleClose = () => {
    setDate(initialData?.date || new Date());
    setType(initialData?.type || 'walk');
    setDuration(initialData?.duration?.toString() || '');
    setDescription(initialData?.description || '');
    setFavoriteToys(initialData?.favoriteToys?.join(', ') || '');
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getSelectedActivityType = () => {
    return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[0];
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        }}>
          <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { fontSize: 18, fontWeight: '600' }]}>
            {initialData ? 'Edit Activity' : 'Add Activity'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {/* Date Picker */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Date
              </Text>
              <TouchableOpacity
                style={[
                  commonStyles.input,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="calendar" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '500' }]}>
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color={colors.textLight} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Activity Type */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Activity Type
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {ACTIVITY_TYPES.map((activityType) => (
                  <TouchableOpacity
                    key={activityType.value}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: type === activityType.value ? activityType.color : colors.card,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 25,
                      borderWidth: 2,
                      borderColor: type === activityType.value ? activityType.color : colors.border,
                      marginRight: 12,
                      minWidth: 120,
                    }}
                    onPress={() => setType(activityType.value as any)}
                  >
                    <Icon 
                      name={activityType.icon} 
                      size={18} 
                      color={type === activityType.value ? colors.white : colors.text} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      color: type === activityType.value ? colors.white : colors.text,
                      fontWeight: type === activityType.value ? '600' : '500',
                      fontSize: 14,
                    }}>
                      {activityType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Duration */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Duration (minutes)
              </Text>
              <TextInput
                style={[
                  commonStyles.input,
                  {
                    paddingVertical: 16,
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: colors.border,
                  }
                ]}
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 30"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Description *
              </Text>
              <TextInput
                style={[
                  commonStyles.input,
                  {
                    height: 100,
                    textAlignVertical: 'top',
                    paddingVertical: 16,
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: colors.border,
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what you did during this activity..."
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>

            {/* Favorite Toys */}
            <View style={{ marginBottom: 32 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Toys Used
              </Text>
              <TextInput
                style={[
                  commonStyles.input,
                  {
                    paddingVertical: 16,
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: colors.border,
                  }
                ]}
                value={favoriteToys}
                onChangeText={setFavoriteToys}
                placeholder="e.g., Ball, Rope toy, Frisbee (comma separated)"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Save Button */}
            <EnhancedButton
              text={initialData ? 'Update Activity' : 'Add Activity'}
              onPress={handleSave}
              variant="primary"
              fullWidth
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
