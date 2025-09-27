
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
  { value: 'vaccination', label: 'Vaccination', icon: '💉' },
  { value: 'checkup', label: 'Regular Checkup', icon: '🏥' },
  { value: 'medicine', label: 'Medicine', icon: '💊' },
  { value: 'deworming', label: 'Deworming', icon: '🐛' },
  { value: 'grooming', label: 'Professional Grooming', icon: '✂️' },
];

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Every 3 Months' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
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
    frequency: 'monthly' as HealthSchedule['frequency'],
    lastDone: new Date(),
    nextDue: new Date(),
    reminderEnabled: true,
    notes: '',
  });

  const [showLastDonePicker, setShowLastDonePicker] = useState(false);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);

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
      frequency: 'monthly',
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
    
    switch (frequency) {
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'yearly':
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

  const getTypeIcon = (type: string) => {
    const healthType = HEALTH_TYPES.find(t => t.value === type);
    return healthType?.icon || '🏥';
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
        borderBottomColor: colors.border
      }}>
        <Text style={commonStyles.title}>Health Control</Text>
        <EnhancedButton
          text="Add Schedule"
          onPress={handleAddSchedule}
          variant="primary"
          size="small"
          icon="add"
        />
      </View>

      {schedules.length === 0 ? (
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Icon name="medical" size={64} color={colors.textLight} />
          <Text style={[commonStyles.subtitle, { marginTop: 20, marginBottom: 8 }]}>
            No health schedules yet
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 32 }]}>
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
            {schedules.map((schedule) => (
              <View key={schedule.id} style={[commonStyles.card, {
                borderLeftWidth: 4,
                borderLeftColor: isOverdue(schedule.nextDue) ? colors.error : colors.success,
              }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {getTypeIcon(schedule.type)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>
                      {schedule.name}
                    </Text>
                    <Text style={commonStyles.textLight}>
                      {HEALTH_TYPES.find(t => t.value === schedule.type)?.label}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {schedule.reminderEnabled && (
                      <Icon name="notifications" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                    )}
                    <TouchableOpacity
                      onPress={() => handleEditSchedule(schedule)}
                      style={{ marginRight: 8 }}
                    >
                      <Icon name="create" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSchedule(schedule)}>
                      <Icon name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={[commonStyles.textLight, { fontSize: 12, marginBottom: 2 }]}>
                      Last Done
                    </Text>
                    <Text style={commonStyles.text}>
                      {schedule.lastDone ? schedule.lastDone.toLocaleDateString() : 'Not set'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.textLight, { fontSize: 12, marginBottom: 2 }]}>
                      Next Due
                    </Text>
                    <Text style={[
                      commonStyles.text,
                      { color: isOverdue(schedule.nextDue) ? colors.error : colors.text }
                    ]}>
                      {schedule.nextDue ? schedule.nextDue.toLocaleDateString() : 'Not set'}
                    </Text>
                  </View>
                </View>

                <Text style={[commonStyles.textLight, { fontSize: 12, marginBottom: 4 }]}>
                  Frequency: {FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency)?.label}
                </Text>

                {schedule.notes && (
                  <Text style={[commonStyles.textLight, { fontSize: 12, fontStyle: 'italic' }]}>
                    {schedule.notes}
                  </Text>
                )}

                {isOverdue(schedule.nextDue) && (
                  <View style={{
                    backgroundColor: colors.error,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    marginTop: 8,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ color: colors.card, fontSize: 12, fontWeight: '600' }}>
                      OVERDUE
                    </Text>
                  </View>
                )}
              </View>
            ))}
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
              borderBottomColor: colors.border
            }}>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={commonStyles.subtitle}>
                {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
              </Text>
              <TouchableOpacity onPress={handleSaveSchedule}>
                <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                {/* Health Type */}
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>Health Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {HEALTH_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        commonStyles.card,
                        {
                          marginRight: 12,
                          minWidth: 120,
                          alignItems: 'center',
                          backgroundColor: formData.type === type.value ? colors.primary : colors.card,
                        }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                    >
                      <Text style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</Text>
                      <Text style={[
                        commonStyles.textLight,
                        { 
                          textAlign: 'center',
                          color: formData.type === type.value ? colors.card : colors.text,
                          fontWeight: formData.type === type.value ? '600' : '400',
                        }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Name */}
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>Name</Text>
                <TextInput
                  style={[commonStyles.card, { marginBottom: 20 }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Annual Vaccination, Monthly Checkup"
                  placeholderTextColor={colors.textLight}
                />

                {/* Frequency */}
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>Frequency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <TouchableOpacity
                      key={freq.value}
                      style={[
                        commonStyles.card,
                        {
                          marginRight: 12,
                          paddingHorizontal: 16,
                          backgroundColor: formData.frequency === freq.value ? colors.secondary : colors.card,
                        }
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          frequency: freq.value as any,
                          nextDue: calculateNextDue(prev.lastDone, freq.value),
                        }));
                      }}
                    >
                      <Text style={[
                        commonStyles.text,
                        { 
                          color: formData.frequency === freq.value ? colors.card : colors.text,
                          fontWeight: formData.frequency === freq.value ? '600' : '400',
                        }
                      ]}>
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Last Done Date */}
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>Last Done</Text>
                <TouchableOpacity
                  style={[commonStyles.card, { marginBottom: 20 }]}
                  onPress={() => setShowLastDonePicker(true)}
                >
                  <Text style={commonStyles.text}>
                    {formData.lastDone.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                {/* Next Due Date */}
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>Next Due</Text>
                <TouchableOpacity
                  style={[commonStyles.card, { marginBottom: 20 }]}
                  onPress={() => setShowNextDuePicker(true)}
                >
                  <Text style={commonStyles.text}>
                    {formData.nextDue.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                {/* Reminder Toggle */}
                <View style={[commonStyles.card, { 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 20 
                }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>Enable Reminder</Text>
                    <Text style={commonStyles.textLight}>
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
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>Notes (Optional)</Text>
                <TextInput
                  style={[commonStyles.card, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Additional notes about this health schedule..."
                  placeholderTextColor={colors.textLight}
                  multiline
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
