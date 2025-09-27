
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { FeedingSchedule } from '../types';
import Icon from './Icon';
import EnhancedButton from './EnhancedButton';

interface FeedingScheduleFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (feeding: FeedingSchedule) => void;
  initialData?: FeedingSchedule | null;
}

export default function FeedingScheduleForm({ isVisible, onClose, onSave, initialData }: FeedingScheduleFormProps) {
  const [time, setTime] = useState(initialData?.time || '');
  const [foodType, setFoodType] = useState(initialData?.foodType || '');
  const [portionSize, setPortionSize] = useState(initialData?.portionSize || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSave = () => {
    if (!time.trim() || !foodType.trim() || !portionSize.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const feeding: FeedingSchedule = {
      id: initialData?.id || Date.now().toString(),
      time: time.trim(),
      foodType: foodType.trim(),
      portionSize: portionSize.trim(),
      notes: notes.trim() || undefined,
    };

    onSave(feeding);
    handleClose();
  };

  const handleClose = () => {
    setTime(initialData?.time || '');
    setFoodType(initialData?.foodType || '');
    setPortionSize(initialData?.portionSize || '');
    setNotes(initialData?.notes || '');
    onClose();
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
            {initialData ? 'Edit Feeding' : 'Add Feeding'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>Time *</Text>
            <TextInput
              style={commonStyles.input}
              value={time}
              onChangeText={setTime}
              placeholder="e.g., 08:00, 6:00 PM"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>Food Type *</Text>
            <TextInput
              style={commonStyles.input}
              value={foodType}
              onChangeText={setFoodType}
              placeholder="e.g., Dry kibble, Wet food"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>Portion Size *</Text>
            <TextInput
              style={commonStyles.input}
              value={portionSize}
              onChangeText={setPortionSize}
              placeholder="e.g., 1 cup, 1/2 can"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>Notes</Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes..."
              placeholderTextColor={colors.textLight}
              multiline
            />
          </View>

          <EnhancedButton
            text={initialData ? 'Update Feeding' : 'Add Feeding'}
            onPress={handleSave}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
