
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { GroomingRoutine } from '../types';
import Icon from './Icon';
import EnhancedButton from './EnhancedButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface GroomingFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (grooming: GroomingRoutine) => void;
  initialData?: GroomingRoutine | null;
}

const GROOMING_TYPES = [
  { value: 'bath', label: 'Bath', icon: 'water', color: colors.accent },
  { value: 'brushing', label: 'Brushing', icon: 'brush', color: colors.secondary },
  { value: 'nails', label: 'Nail Trim', icon: 'cut', color: colors.purple },
  { value: 'teeth', label: 'Teeth Cleaning', icon: 'medical', color: colors.yellow },
  { value: 'other', label: 'Other', icon: 'sparkles', color: colors.primary },
];

const FREQUENCY_OPTIONS = [
  'Daily',
  'Weekly', 
  'Monthly',
  'Annually',
];

export default function GroomingForm({ isVisible, onClose, onSave, initialData }: GroomingFormProps) {
  const [type, setType] = useState<'bath' | 'brushing' | 'nails' | 'teeth' | 'other'>(initialData?.type || 'brushing');
  const [frequency, setFrequency] = useState(initialData?.frequency || 'Weekly');
  const [lastDone, setLastDone] = useState(initialData?.lastDone || null);
  const [nextDue, setNextDue] = useState(initialData?.nextDue || null);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showLastDonePicker, setShowLastDonePicker] = useState(false);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const handleSave = () => {
    const grooming: GroomingRoutine = {
      id: initialData?.id || Date.now().toString(),
      type,
      frequency,
      lastDone: lastDone || undefined,
      nextDue: nextDue || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(grooming);
    handleClose();
  };

  const handleClose = () => {
    setType(initialData?.type || 'brushing');
    setFrequency(initialData?.frequency || 'Weekly');
    setLastDone(initialData?.lastDone || null);
    setNextDue(initialData?.nextDue || null);
    setNotes(initialData?.notes || '');
    onClose();
  };

  const handleLastDoneChange = (event: any, selectedDate?: Date) => {
    setShowLastDonePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setLastDone(selectedDate);
    }
  };

  const handleNextDueChange = (event: any, selectedDate?: Date) => {
    setShowNextDuePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNextDue(selectedDate);
    }
  };

  const getSelectedGroomingType = () => {
    return GROOMING_TYPES.find(t => t.value === type) || GROOMING_TYPES[0];
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
            {initialData ? 'Edit Grooming' : 'Add Grooming'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {/* Grooming Type */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Grooming Type
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {GROOMING_TYPES.map((groomingType) => (
                  <TouchableOpacity
                    key={groomingType.value}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: type === groomingType.value ? groomingType.color : colors.card,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 25,
                      borderWidth: 2,
                      borderColor: type === groomingType.value ? groomingType.color : colors.border,
                      marginRight: 12,
                      minWidth: 120,
                    }}
                    onPress={() => setType(groomingType.value as any)}
                  >
                    <Icon 
                      name={groomingType.icon} 
                      size={18} 
                      color={type === groomingType.value ? colors.white : colors.text} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      color: type === groomingType.value ? colors.white : colors.text,
                      fontWeight: type === groomingType.value ? '600' : '500',
                      fontSize: 14,
                    }}>
                      {groomingType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Frequency */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Frequency
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
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '500' }]}>
                  {frequency}
                </Text>
                <Icon name="chevron-down" size={20} color={colors.textLight} />
              </TouchableOpacity>
              
              {showFrequencyPicker && (
                <View style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  marginTop: 8,
                  borderWidth: 2,
                  borderColor: colors.border,
                  maxHeight: 200,
                }}>
                  <ScrollView>
                    {FREQUENCY_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={{
                          paddingVertical: 16,
                          paddingHorizontal: 20,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                        onPress={() => {
                          setFrequency(option);
                          setShowFrequencyPicker(false);
                        }}
                      >
                        <Text style={[
                          commonStyles.text,
                          { 
                            fontWeight: frequency === option ? '600' : '400',
                            color: frequency === option ? colors.primary : colors.text 
                          }
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Last Done */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Last Done
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
                onPress={() => setShowLastDonePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="calendar" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '500' }]}>
                    {lastDone ? lastDone.toLocaleDateString() : 'Not set'}
                  </Text>
                </View>
                {lastDone && (
                  <TouchableOpacity onPress={() => setLastDone(null)} style={{ padding: 4 }}>
                    <Icon name="close-circle" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {showLastDonePicker && (
                <DateTimePicker
                  value={lastDone || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleLastDoneChange}
                />
              )}
            </View>

            {/* Next Due */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                Next Due
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
                onPress={() => setShowNextDuePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="calendar" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '500' }]}>
                    {nextDue ? nextDue.toLocaleDateString() : 'Not set'}
                  </Text>
                </View>
                {nextDue && (
                  <TouchableOpacity onPress={() => setNextDue(null)} style={{ padding: 4 }}>
                    <Icon name="close-circle" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {showNextDuePicker && (
                <DateTimePicker
                  value={nextDue || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleNextDueChange}
                />
              )}
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 32 }}>
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
                placeholder="Additional grooming notes..."
                placeholderTextColor={colors.textLight}
                multiline
              />
            </View>

            {/* Save Button */}
            <EnhancedButton
              text={initialData ? 'Update Grooming' : 'Add Grooming'}
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
