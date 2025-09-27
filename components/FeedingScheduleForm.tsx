
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Modal, Switch, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { FeedingSchedule } from '../types';
import Icon from './Icon';
import EnhancedButton from './EnhancedButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface FeedingScheduleFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (feeding: FeedingSchedule) => void;
  initialData?: FeedingSchedule | null;
}

export default function FeedingScheduleForm({ isVisible, onClose, onSave, initialData }: FeedingScheduleFormProps) {
  const [time, setTime] = useState(() => {
    if (initialData?.time) {
      // Parse existing time string to Date object
      const [hours, minutes] = initialData.time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date;
    }
    return new Date();
  });
  const [foodType, setFoodType] = useState(initialData?.foodType || '');
  const [portionSize, setPortionSize] = useState(initialData?.portionSize || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [reminderEnabled, setReminderEnabled] = useState(initialData?.reminderEnabled || false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (!foodType.trim() || !portionSize.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Format time as HH:MM string
    const timeString = time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const feeding: FeedingSchedule = {
      id: initialData?.id || Date.now().toString(),
      time: timeString,
      foodType: foodType.trim(),
      portionSize: portionSize.trim(),
      notes: notes.trim() || undefined,
      reminderEnabled,
      notificationId: initialData?.notificationId,
    };

    onSave(feeding);
    handleClose();
  };

  const handleClose = () => {
    if (initialData?.time) {
      const [hours, minutes] = initialData.time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setTime(date);
    } else {
      setTime(new Date());
    }
    setFoodType(initialData?.foodType || '');
    setPortionSize(initialData?.portionSize || '');
    setNotes(initialData?.notes || '');
    setReminderEnabled(initialData?.reminderEnabled || false);
    onClose();
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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
            {initialData ? 'Edit Feeding' : 'Add Feeding'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {/* Time Picker */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Feeding Time *
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
                onPress={() => setShowTimePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="time" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '500' }]}>
                    {formatDisplayTime(time)}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color={colors.textLight} />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* Food Type */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Food Type *
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
                value={foodType}
                onChangeText={setFoodType}
                placeholder="e.g., Dry kibble, Wet food, Raw diet"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Portion Size */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Portion Size *
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
                value={portionSize}
                onChangeText={setPortionSize}
                placeholder="e.g., 1 cup, 1/2 can, 200g"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Notes
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
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional feeding instructions or notes..."
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>

            {/* Reminder Toggle */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
              paddingVertical: 20,
              paddingHorizontal: 20,
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: colors.border,
            }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4, fontSize: 16 }]}>
                  Enable Reminder
                </Text>
                <Text style={[commonStyles.textLight, { fontSize: 14, lineHeight: 20 }]}>
                  Get notified at feeding time every day
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
                ios_backgroundColor={colors.border}
              />
            </View>

            {/* Save Button */}
            <EnhancedButton
              text={initialData ? 'Update Feeding Schedule' : 'Add Feeding Schedule'}
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
