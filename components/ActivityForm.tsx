
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
  { value: 'walk', label: 'Walk', icon: 'walk' },
  { value: 'playtime', label: 'Playtime', icon: 'game-controller' },
  { value: 'training', label: 'Training', icon: 'school' },
  { value: 'other', label: 'Other', icon: 'fitness' },
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

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity onPress={handleClose}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { fontSize: 18 }]}>
            {initialData ? 'Edit Activity' : 'Add Activity'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Date</Text>
              <TouchableOpacity
                style={commonStyles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={commonStyles.text}>{date.toLocaleDateString()}</Text>
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

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Activity Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ACTIVITY_TYPES.map((activityType) => (
                  <TouchableOpacity
                    key={activityType.value}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: type === activityType.value ? colors.primary : colors.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: type === activityType.value ? colors.primary : colors.border,
                    }}
                    onPress={() => setType(activityType.value as any)}
                  >
                    <Icon 
                      name={activityType.icon} 
                      size={16} 
                      color={type === activityType.value ? colors.white : colors.text} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      color: type === activityType.value ? colors.white : colors.text,
                      fontWeight: type === activityType.value ? '600' : '400',
                    }}>
                      {activityType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Duration (minutes)</Text>
              <TextInput
                style={commonStyles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 30"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Description *</Text>
              <TextInput
                style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the activity..."
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Favorite Toys</Text>
              <TextInput
                style={commonStyles.input}
                value={favoriteToys}
                onChangeText={setFavoriteToys}
                placeholder="e.g., Ball, Rope toy, Frisbee (comma separated)"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <EnhancedButton
              text={initialData ? 'Update Activity' : 'Add Activity'}
              onPress={handleSave}
              variant="primary"
              fullWidth
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
