
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
  { value: 'bath', label: 'Bath', icon: 'water' },
  { value: 'brushing', label: 'Brushing', icon: 'brush' },
  { value: 'nails', label: 'Nail Trim', icon: 'cut' },
  { value: 'teeth', label: 'Teeth Cleaning', icon: 'medical' },
  { value: 'other', label: 'Other', icon: 'sparkles' },
];

const FREQUENCY_OPTIONS = [
  'Daily',
  'Every 2 days',
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'Every 2 months',
  'Every 3 months',
  'As needed',
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
            {initialData ? 'Edit Grooming' : 'Add Grooming'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Grooming Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GROOMING_TYPES.map((groomingType) => (
                  <TouchableOpacity
                    key={groomingType.value}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: type === groomingType.value ? colors.purple : colors.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: type === groomingType.value ? colors.purple : colors.border,
                    }}
                    onPress={() => setType(groomingType.value as any)}
                  >
                    <Icon 
                      name={groomingType.icon} 
                      size={16} 
                      color={type === groomingType.value ? colors.white : colors.text} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      color: type === groomingType.value ? colors.white : colors.text,
                      fontWeight: type === groomingType.value ? '600' : '400',
                    }}>
                      {groomingType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Frequency</Text>
              <TouchableOpacity
                style={commonStyles.input}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={commonStyles.text}>{frequency}</Text>
                  <Icon name="chevron-down" size={20} color={colors.textLight} />
                </View>
              </TouchableOpacity>
              {showFrequencyPicker && (
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  marginTop: 8,
                  maxHeight: 200,
                }}>
                  <ScrollView>
                    {FREQUENCY_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={{
                          padding: 16,
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
                          frequency === option && { color: colors.purple, fontWeight: '600' }
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Last Done</Text>
              <TouchableOpacity
                style={commonStyles.input}
                onPress={() => setShowLastDonePicker(true)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={commonStyles.text}>
                    {lastDone ? lastDone.toLocaleDateString() : 'Not set'}
                  </Text>
                  <TouchableOpacity onPress={() => setLastDone(null)}>
                    <Icon name="close-circle" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
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

            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.label, { marginBottom: 8 }]}>Next Due</Text>
              <TouchableOpacity
                style={commonStyles.input}
                onPress={() => setShowNextDuePicker(true)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={commonStyles.text}>
                    {nextDue ? nextDue.toLocaleDateString() : 'Not set'}
                  </Text>
                  <TouchableOpacity onPress={() => setNextDue(null)}>
                    <Icon name="close-circle" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
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
              text={initialData ? 'Update Grooming' : 'Add Grooming'}
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
