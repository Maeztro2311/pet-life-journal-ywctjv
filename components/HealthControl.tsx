
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from './Icon';
import EnhancedButton from './EnhancedButton';
import { commonStyles, colors } from '../styles/commonStyles';
import { Pet, HealthSchedule } from '../types';
import { getHealthSchedulesByPetId, saveHealthSchedule, deleteHealthSchedule } from '../utils/storage';
import { scheduleHealthReminder, cancelNotification } from '../utils/notifications';

interface HealthControlProps {
  pet: Pet;
}

const HEALTH_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: 'medical', color: colors.error },
  { value: 'checkup', label: 'Regular Checkup', icon: 'heart', color: colors.accent },
  { value: 'medicine', label: 'Medicine', icon: 'medical-bag', color: colors.purple },
  { value: 'deworming', label: 'Deworming', icon: 'bug', color: colors.yellow },
  { value: 'grooming', label: 'Professional Grooming', icon: 'cut', color: colors.secondary },
];

const FREQUENCY_OPTIONS = [
  'Daily',
  'Weekly',
  'Monthly',
  'Annually',
];

export default function HealthControl({ pet }: HealthControlProps) {
  const [schedules, setSchedules] = useState<HealthSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<HealthSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    type: 'vaccination' as HealthSchedule['type'],
    name: '',
    frequency: 'Monthly' as HealthSchedule['frequency'],
    lastDone: new Date(),
    nextDue: new Date(),
    reminderEnabled: true,
    notes: '',
  });

  const [showLastDonePicker, setShowLastDonePicker] = useState(false);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  useEffect(() => {
    loadHealthSchedules();
  }, []);

  const loadHealthSchedules = async () => {
    try {
      const healthSchedules = await getHealthSchedulesByPetId(pet.id);
      setSchedules(healthSchedules);
    } catch (error) {
      console.error('Error loading health schedules:', error);
      Alert.alert('Error', 'Failed to load health schedules');
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      type: 'vaccination',
      name: '',
      frequency: 'Monthly',
      lastDone: new Date(),
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      reminderEnabled: true,
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditSchedule = (schedule: HealthSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      type: schedule.type,
      name: schedule.name,
      frequency: schedule.frequency,
      lastDone: schedule.lastDone || new Date(),
      nextDue: schedule.nextDue || new Date(),
      reminderEnabled: schedule.reminderEnabled || false,
      notes: schedule.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter a name for this health schedule');
        return;
      }

      let notificationId = editingSchedule?.notificationId;

      // Cancel existing notification if editing
      if (editingSchedule?.notificationId) {
        await cancelNotification(editingSchedule.notificationId);
      }

      // Schedule new notification if enabled
      if (formData.reminderEnabled && formData.nextDue) {
        notificationId = await scheduleHealthReminder(
          pet.name,
          formData.name,
          formData.nextDue
        );
      }

      const schedule: HealthSchedule = {
        id: editingSchedule?.id || generateId(),
        petId: pet.id,
        type: formData.type,
        name: formData.name,
        frequency: formData.frequency,
        lastDone: formData.lastDone,
        nextDue: formData.nextDue,
        reminderEnabled: formData.reminderEnabled,
        notificationId: notificationId || undefined,
        notes: formData.notes,
      };

      await saveHealthSchedule(schedule);
      await loadHealthSchedules();
      setShowForm(false);
      
      Alert.alert(
        'Success', 
        editingSchedule ? 'Health schedule updated successfully' : 'Health schedule added successfully'
      );
    } catch (error) {
      console.error('Error saving health schedule:', error);
      Alert.alert('Error', 'Failed to save health schedule');
    }
  };

  const handleDeleteSchedule = (schedule: HealthSchedule) => {
    Alert.alert(
      'Delete Health Schedule',
      `Are you sure you want to delete "${schedule.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (schedule.notificationId) {
                await cancelNotification(schedule.notificationId);
              }
              await deleteHealthSchedule(schedule.id);
              await loadHealthSchedules();
              Alert.alert('Success', 'Health schedule deleted successfully');
            } catch (error) {
              console.error('Error deleting health schedule:', error);
              Alert.alert('Error', 'Failed to delete health schedule');
            }
          },
        },
      ]
    );
  };

  const calculateNextDue = (lastDone: Date, frequency: string): Date => {
    const nextDue = new Date(lastDone);
    
    switch (frequency.toLowerCase()) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'annually':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      default:
        nextDue.setMonth(nextDue.getMonth() + 1);
    }
    
    return nextDue;
  };

  const handleLastDoneChange = (event: any, selectedDate?: Date) => {
    setShowLastDonePicker(false);
    if (selectedDate) {
      const nextDue = calculateNextDue(selectedDate, formData.frequency);
      setFormData(prev => ({
        ...prev,
        lastDone: selectedDate,
        nextDue: nextDue,
      }));
    }
  };

  const handleNextDueChange = (event: any, selectedDate?: Date) => {
    setShowNextDuePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        nextDue: selectedDate,
      }));
    }
  };

  const getTypeInfo = (type: string) => {
    return HEALTH_TYPES.find(t => t.value === type) || HEALTH_TYPES[0];
  };

  const isOverdue = (nextDue?: Date) => {
    if (!nextDue) return false;
    return nextDue < new Date();
  };

  if (loading) {
    return (
      <View style={[commonStyles.content, { justifyContent: 'center' }]}>
        <Text style={commonStyles.text}>Loading health schedules...</Text>
      </View>
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
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
      }}>
        <Text style={[commonStyles.title, { fontWeight: '700' }]}>Health Control</Text>
        <EnhancedButton
          text="Add Schedule"
          onPress={handleAddSchedule}
          variant="primary"
          size="small"
          icon="add"
        />
      </View>

      {schedules.length === 0 ? (
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="medical" size={64} color={colors.textLight} />
          <Text style={[commonStyles.subtitle, { marginTop: 20, marginBottom: 8, textAlign: 'center' }]}>
            No health schedules yet
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 32, paddingHorizontal: 40 }]}>
            Add health schedules to track vaccinations, checkups, and medical care for {pet.name}
          </Text>
          <EnhancedButton
            text="Add First Schedule"
            onPress={handleAddSchedule}
            variant="primary"
            size="large"
            icon="add"
          />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {schedules.map((schedule) => {
              const typeInfo = getTypeInfo(schedule.type);
              return (
                <View key={schedule.id} style={[
                  commonStyles.card, 
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: isOverdue(schedule.nextDue) ? colors.error : typeInfo.color,
                    marginBottom: 16,
                  }
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View style={{
                      backgroundColor: typeInfo.color,
                      padding: 8,
                      borderRadius: 8,
                      marginRight: 12,
                    }}>
                      <Icon name={typeInfo.icon} size={20} color={colors.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.subtitle, { marginBottom: 4, fontWeight: '600' }]}>
                        {schedule.name}
                      </Text>
                      <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                        {typeInfo.label}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {schedule.reminderEnabled && (
                        <Icon name="notifications" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                      )}
                      <TouchableOpacity
                        onPress={() => handleEditSchedule(schedule)}
                        style={{ marginRight: 8, padding: 4 }}
                      >
                        <Icon name="create" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteSchedule(schedule)}
                        style={{ padding: 4 }}
                      >
                        <Icon name="trash" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    marginBottom: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                  }}>
                    <View style={{ flex: 1, marginRight: 16 }}>
                      <Text style={[commonStyles.textLight, { fontSize: 12, marginBottom: 4, fontWeight: '600' }]}>
                        Last Done
                      </Text>
                      <Text style={[commonStyles.text, { fontSize: 14 }]}>
                        {schedule.lastDone ? schedule.lastDone.toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.textLight, { fontSize: 12, marginBottom: 4, fontWeight: '600' }]}>
                        Next Due
                      </Text>
                      <Text style={[
                        commonStyles.text,
                        { 
                          fontSize: 14,
                          color: isOverdue(schedule.nextDue) ? colors.error : colors.text,
                          fontWeight: isOverdue(schedule.nextDue) ? '600' : '400',
                        }
                      ]}>
                        {schedule.nextDue ? schedule.nextDue.toLocaleDateString() : 'Not set'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="repeat" size={14} color={colors.textLight} style={{ marginRight: 6 }} />
                    <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                      Frequency: {schedule.frequency}
                    </Text>
                  </View>

                  {schedule.notes && (
                    <Text style={[commonStyles.textLight, { fontSize: 12, fontStyle: 'italic', marginBottom: 8 }]}>
                      {schedule.notes}
                    </Text>
                  )}

                  {isOverdue(schedule.nextDue) && (
                    <View style={{
                      backgroundColor: colors.error,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      alignSelf: 'flex-start',
                    }}>
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>
                        OVERDUE
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Add/Edit Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.container}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.card,
            }}>
              <TouchableOpacity onPress={() => setShowForm(false)} style={{ padding: 4 }}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[commonStyles.subtitle, { fontWeight: '600' }]}>
                {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
              </Text>
              <TouchableOpacity onPress={handleSaveSchedule} style={{ padding: 4 }}>
                <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                {/* Health Type */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Health Type
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  >
                    {HEALTH_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={{
                          alignItems: 'center',
                          backgroundColor: formData.type === type.value ? type.color : colors.card,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: formData.type === type.value ? type.color : colors.border,
                          marginRight: 12,
                          minWidth: 100,
                        }}
                        onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                      >
                        <Icon 
                          name={type.icon} 
                          size={24} 
                          color={formData.type === type.value ? colors.white : colors.text}
                          style={{ marginBottom: 4 }}
                        />
                        <Text style={{
                          textAlign: 'center',
                          color: formData.type === type.value ? colors.white : colors.text,
                          fontWeight: formData.type === type.value ? '600' : '400',
                          fontSize: 12,
                        }}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Name */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Name *
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
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., Annual Vaccination, Monthly Checkup"
                    placeholderTextColor={colors.textLight}
                  />
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
                      {formData.frequency}
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
                              setFormData(prev => ({ 
                                ...prev, 
                                frequency: option as any,
                                nextDue: calculateNextDue(prev.lastDone, option),
                              }));
                              setShowFrequencyPicker(false);
                            }}
                          >
                            <Text style={[
                              commonStyles.text,
                              { 
                                fontWeight: formData.frequency === option ? '600' : '400',
                                color: formData.frequency === option ? colors.primary : colors.text 
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

                {/* Last Done Date */}
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
                        {formData.lastDone.toLocaleDateString()}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>

                {/* Next Due Date */}
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
                        {formData.nextDue.toLocaleDateString()}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>

                {/* Reminder Toggle */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
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
                      Get notified when this is due
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: formData.reminderEnabled ? colors.primary : colors.border,
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                    onPress={() => setFormData(prev => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                  >
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: colors.card,
                        alignSelf: formData.reminderEnabled ? 'flex-end' : 'flex-start',
                      }}
                    />
                  </TouchableOpacity>
                </View>

                {/* Notes */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Notes (Optional)
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
                    value={formData.notes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                    placeholder="Additional notes about this health schedule..."
                    placeholderTextColor={colors.textLight}
                    multiline
                  />
                </View>

                {/* Save Button */}
                <EnhancedButton
                  text={editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                  onPress={handleSaveSchedule}
                  variant="primary"
                  fullWidth
                  size="large"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Date Pickers */}
        {showLastDonePicker && (
          <DateTimePicker
            value={formData.lastDone}
            mode="date"
            display="default"
            onChange={handleLastDoneChange}
          />
        )}

        {showNextDuePicker && (
          <DateTimePicker
            value={formData.nextDue}
            mode="date"
            display="default"
            onChange={handleNextDueChange}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}
