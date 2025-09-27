
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Pet, DailyRoutine, FeedingSchedule, Activity, GroomingRoutine } from '../types';
import { 
  getDailyRoutineByPetId, 
  addFeedingSchedule, 
  updateFeedingSchedule, 
  deleteFeedingSchedule,
  addActivity,
  updateActivity,
  deleteActivity,
  addGroomingRoutine,
  updateGroomingRoutine,
  deleteGroomingRoutine
} from '../utils/storage';
import { 
  scheduleFeedingReminder, 
  scheduleGroomingReminder, 
  cancelNotification,
  requestNotificationPermissions 
} from '../utils/notifications';
import FeedingScheduleForm from './FeedingScheduleForm';
import ActivityForm from './ActivityForm';
import GroomingForm from './GroomingForm';

interface PetRoutineTabProps {
  pet: Pet;
}

export default function PetRoutineTab({ pet }: PetRoutineTabProps) {
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Form states
  const [showFeedingForm, setShowFeedingForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showGroomingForm, setShowGroomingForm] = useState(false);
  const [editingFeeding, setEditingFeeding] = useState<FeedingSchedule | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingGrooming, setEditingGrooming] = useState<GroomingRoutine | null>(null);

  useEffect(() => {
    loadRoutineData();
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      setNotificationsEnabled(hasPermission);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setNotificationsEnabled(false);
    }
  };

  const loadRoutineData = async () => {
    try {
      setLoading(true);
      const routineData = await getDailyRoutineByPetId(pet.id);
      setRoutine(routineData);
      console.log('Routine data loaded for pet:', pet.id);
    } catch (error) {
      console.error('Error loading routine data:', error);
      Alert.alert('Error', 'Failed to load routine data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedingReminder = async (feeding: FeedingSchedule) => {
    try {
      const updatedFeeding = { ...feeding };
      
      if (feeding.reminderEnabled && feeding.notificationId) {
        // Cancel existing notification
        await cancelNotification(feeding.notificationId);
        updatedFeeding.reminderEnabled = false;
        updatedFeeding.notificationId = undefined;
      } else {
        // Schedule new notification
        const notificationId = await scheduleFeedingReminder(
          pet.name,
          feeding.time,
          feeding.foodType
        );
        
        if (notificationId) {
          updatedFeeding.reminderEnabled = true;
          updatedFeeding.notificationId = notificationId;
        } else {
          Alert.alert('Error', 'Failed to schedule reminder');
          return;
        }
      }
      
      await updateFeedingSchedule(pet.id, updatedFeeding);
      await loadRoutineData();
      console.log('Feeding reminder toggled successfully');
    } catch (error) {
      console.error('Error toggling feeding reminder:', error);
      Alert.alert('Error', 'Failed to toggle reminder');
    }
  };

  const toggleGroomingReminder = async (grooming: GroomingRoutine) => {
    try {
      if (!grooming.nextDue) {
        Alert.alert('Error', 'Please set a due date first');
        return;
      }

      const updatedGrooming = { ...grooming };
      
      if (grooming.reminderEnabled && grooming.notificationId) {
        // Cancel existing notification
        await cancelNotification(grooming.notificationId);
        updatedGrooming.reminderEnabled = false;
        updatedGrooming.notificationId = undefined;
      } else {
        // Schedule new notification
        const notificationId = await scheduleGroomingReminder(
          pet.name,
          grooming.type,
          grooming.nextDue
        );
        
        if (notificationId) {
          updatedGrooming.reminderEnabled = true;
          updatedGrooming.notificationId = notificationId;
        } else {
          Alert.alert('Error', 'Failed to schedule reminder');
          return;
        }
      }
      
      await updateGroomingRoutine(pet.id, updatedGrooming);
      await loadRoutineData();
      console.log('Grooming reminder toggled successfully');
    } catch (error) {
      console.error('Error toggling grooming reminder:', error);
      Alert.alert('Error', 'Failed to toggle reminder');
    }
  };

  const handleAddFeeding = () => {
    setEditingFeeding(null);
    setShowFeedingForm(true);
  };

  const handleEditFeeding = (feeding: FeedingSchedule) => {
    setEditingFeeding(feeding);
    setShowFeedingForm(true);
  };

  const handleSaveFeeding = async (feeding: FeedingSchedule) => {
    try {
      if (editingFeeding) {
        await updateFeedingSchedule(pet.id, feeding);
      } else {
        await addFeedingSchedule(pet.id, feeding);
      }
      await loadRoutineData();
      console.log('Feeding schedule saved successfully');
    } catch (error) {
      console.error('Error saving feeding schedule:', error);
      Alert.alert('Error', 'Failed to save feeding schedule');
    }
  };

  const handleDeleteFeeding = (feedingId: string) => {
    Alert.alert(
      'Delete Feeding',
      'Are you sure you want to delete this feeding schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const feeding = routine?.feedingSchedule.find(f => f.id === feedingId);
              if (feeding?.notificationId) {
                await cancelNotification(feeding.notificationId);
              }
              await deleteFeedingSchedule(pet.id, feedingId);
              await loadRoutineData();
              console.log('Feeding schedule deleted successfully');
            } catch (error) {
              console.error('Error deleting feeding schedule:', error);
              Alert.alert('Error', 'Failed to delete feeding schedule');
            }
          },
        },
      ]
    );
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleSaveActivity = async (activity: Activity) => {
    try {
      if (editingActivity) {
        await updateActivity(pet.id, activity);
      } else {
        await addActivity(pet.id, activity);
      }
      await loadRoutineData();
      console.log('Activity saved successfully');
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const activity = routine?.activityLog.find(a => a.id === activityId);
              if (activity?.notificationId) {
                await cancelNotification(activity.notificationId);
              }
              await deleteActivity(pet.id, activityId);
              await loadRoutineData();
              console.log('Activity deleted successfully');
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  const handleAddGrooming = () => {
    setEditingGrooming(null);
    setShowGroomingForm(true);
  };

  const handleEditGrooming = (grooming: GroomingRoutine) => {
    setEditingGrooming(grooming);
    setShowGroomingForm(true);
  };

  const handleSaveGrooming = async (grooming: GroomingRoutine) => {
    try {
      if (editingGrooming) {
        await updateGroomingRoutine(pet.id, grooming);
      } else {
        await addGroomingRoutine(pet.id, grooming);
      }
      await loadRoutineData();
      console.log('Grooming routine saved successfully');
    } catch (error) {
      console.error('Error saving grooming routine:', error);
      Alert.alert('Error', 'Failed to save grooming routine');
    }
  };

  const handleDeleteGrooming = (groomingId: string) => {
    Alert.alert(
      'Delete Grooming',
      'Are you sure you want to delete this grooming routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const grooming = routine?.groomingRoutine?.find(g => g.id === groomingId);
              if (grooming?.notificationId) {
                await cancelNotification(grooming.notificationId);
              }
              await deleteGroomingRoutine(pet.id, groomingId);
              await loadRoutineData();
              console.log('Grooming routine deleted successfully');
            } catch (error) {
              console.error('Error deleting grooming routine:', error);
              Alert.alert('Error', 'Failed to delete grooming routine');
            }
          },
        },
      ]
    );
  };

  const handleQuickLogFeeding = async () => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const quickFeeding: FeedingSchedule = {
        id: Date.now().toString(),
        time: timeString,
        foodType: 'Quick log',
        portionSize: '1 serving',
        notes: `Logged on ${now.toLocaleDateString()}`,
      };

      await handleSaveFeeding(quickFeeding);
    } catch (error) {
      console.error('Error quick logging feeding:', error);
      Alert.alert('Error', 'Failed to log feeding');
    }
  };

  const handleQuickLogActivity = async () => {
    try {
      const quickActivity: Activity = {
        id: Date.now().toString(),
        date: new Date(),
        type: 'other',
        description: 'Quick activity log',
        duration: 15,
      };

      await handleSaveActivity(quickActivity);
    } catch (error) {
      console.error('Error quick logging activity:', error);
      Alert.alert('Error', 'Failed to log activity');
    }
  };

  const handleQuickLogGrooming = async () => {
    try {
      const quickGrooming: GroomingRoutine = {
        id: Date.now().toString(),
        type: 'other',
        frequency: 'As needed',
        lastDone: new Date(),
        notes: 'Quick grooming log',
      };

      await handleSaveGrooming(quickGrooming);
    } catch (error) {
      console.error('Error quick logging grooming:', error);
      Alert.alert('Error', 'Failed to log grooming');
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.content, { justifyContent: 'center' }]}>
        <Text style={commonStyles.text}>Loading routine...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Notifications Status */}
          {!notificationsEnabled && (
            <View style={[commonStyles.card, { marginBottom: 20, backgroundColor: colors.warning + '20', borderColor: colors.warning, borderWidth: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="notifications-off" size={24} color={colors.warning} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                    Notifications Disabled
                  </Text>
                  <Text style={commonStyles.textLight}>
                    Enable notifications in your device settings to receive reminders
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Feeding Schedule */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={commonStyles.subtitle}>Feeding Schedule</Text>
              <TouchableOpacity onPress={handleAddFeeding}>
                <Icon name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {routine?.feedingSchedule && routine.feedingSchedule.length > 0 ? (
              routine.feedingSchedule.map((feeding) => (
                <View key={feeding.id} style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.secondary
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>{feeding.time}</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => handleEditFeeding(feeding)}>
                        <Icon name="create" size={16} color={colors.textLight} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteFeeding(feeding.id)}>
                        <Icon name="trash" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                    <Text style={{ fontWeight: '600' }}>Food: </Text>{feeding.foodType}
                  </Text>
                  <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                    <Text style={{ fontWeight: '600' }}>Portion: </Text>{feeding.portionSize}
                  </Text>
                  {feeding.notes && (
                    <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>{feeding.notes}</Text>
                  )}
                  
                  {/* Reminder Toggle */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="notifications" size={16} color={feeding.reminderEnabled ? colors.primary : colors.textLight} style={{ marginRight: 8 }} />
                      <Text style={[commonStyles.text, { color: feeding.reminderEnabled ? colors.primary : colors.textLight }]}>
                        Daily Reminder
                      </Text>
                    </View>
                    <Switch
                      value={feeding.reminderEnabled || false}
                      onValueChange={() => toggleFeedingReminder(feeding)}
                      disabled={!notificationsEnabled}
                      trackColor={{ false: colors.border, true: colors.primary + '40' }}
                      thumbColor={feeding.reminderEnabled ? colors.primary : colors.textLight}
                    />
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="restaurant" size={32} color={colors.textLight} style={{ marginBottom: 8 }} />
                <Text style={commonStyles.textLight}>No feeding schedule set</Text>
              </View>
            )}
          </View>

          {/* Recent Activities */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={commonStyles.subtitle}>Recent Activities</Text>
              <TouchableOpacity onPress={handleAddActivity}>
                <Icon name="add-circle" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            
            {routine?.activityLog && routine.activityLog.length > 0 ? (
              routine.activityLog
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((activity) => (
                <View key={activity.id} style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.accent
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon 
                        name={activity.type === 'walk' ? 'walk' : activity.type === 'playtime' ? 'game-controller' : activity.type === 'training' ? 'school' : 'fitness'} 
                        size={20} 
                        color={colors.accent} 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[commonStyles.text, { fontWeight: '600', textTransform: 'capitalize' }]}>
                        {activity.type}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={commonStyles.textLight}>
                        {activity.date.toLocaleDateString()}
                      </Text>
                      <TouchableOpacity onPress={() => handleEditActivity(activity)}>
                        <Icon name="create" size={16} color={colors.textLight} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)}>
                        <Icon name="trash" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {activity.duration && (
                    <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                      Duration: {activity.duration} minutes
                    </Text>
                  )}
                  {activity.description && (
                    <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                      {activity.description}
                    </Text>
                  )}
                  {activity.favoriteToys && activity.favoriteToys.length > 0 && (
                    <Text style={commonStyles.textLight}>
                      Toys: {activity.favoriteToys.join(', ')}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="fitness" size={32} color={colors.textLight} style={{ marginBottom: 8 }} />
                <Text style={commonStyles.textLight}>No activities recorded</Text>
              </View>
            )}
          </View>

          {/* Grooming Routine */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={commonStyles.subtitle}>Grooming Routine</Text>
              <TouchableOpacity onPress={handleAddGrooming}>
                <Icon name="add-circle" size={24} color={colors.purple} />
              </TouchableOpacity>
            </View>
            
            {routine?.groomingRoutine && routine.groomingRoutine.length > 0 ? (
              routine.groomingRoutine.map((grooming) => (
                <View key={grooming.id} style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.purple
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon 
                        name={grooming.type === 'bath' ? 'water' : grooming.type === 'brushing' ? 'brush' : grooming.type === 'nails' ? 'cut' : grooming.type === 'teeth' ? 'medical' : 'sparkles'} 
                        size={20} 
                        color={colors.purple} 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[commonStyles.text, { fontWeight: '600', textTransform: 'capitalize' }]}>
                        {grooming.type}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => handleEditGrooming(grooming)}>
                        <Icon name="create" size={16} color={colors.textLight} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteGrooming(grooming.id)}>
                        <Icon name="trash" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                    <Text style={{ fontWeight: '600' }}>Frequency: </Text>{grooming.frequency}
                  </Text>
                  {grooming.lastDone && (
                    <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                      <Text style={{ fontWeight: '600' }}>Last done: </Text>
                      {grooming.lastDone.toLocaleDateString()}
                    </Text>
                  )}
                  {grooming.nextDue && (
                    <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                      <Text style={{ fontWeight: '600' }}>Next due: </Text>
                      {grooming.nextDue.toLocaleDateString()}
                    </Text>
                  )}
                  {grooming.notes && (
                    <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>{grooming.notes}</Text>
                  )}
                  
                  {/* Reminder Toggle */}
                  {grooming.nextDue && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="notifications" size={16} color={grooming.reminderEnabled ? colors.primary : colors.textLight} style={{ marginRight: 8 }} />
                        <Text style={[commonStyles.text, { color: grooming.reminderEnabled ? colors.primary : colors.textLight }]}>
                          Due Date Reminder
                        </Text>
                      </View>
                      <Switch
                        value={grooming.reminderEnabled || false}
                        onValueChange={() => toggleGroomingReminder(grooming)}
                        disabled={!notificationsEnabled}
                        trackColor={{ false: colors.border, true: colors.primary + '40' }}
                        thumbColor={grooming.reminderEnabled ? colors.primary : colors.textLight}
                      />
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="cut" size={32} color={colors.textLight} style={{ marginBottom: 8 }} />
                <Text style={commonStyles.textLight}>No grooming routine set</Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: colors.secondary,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginRight: 8
                }}
                onPress={handleQuickLogFeeding}
              >
                <Icon name="restaurant" size={24} color={colors.text} />
                <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>
                  Log Feeding
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: colors.accent,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginHorizontal: 4
                }}
                onPress={handleQuickLogActivity}
              >
                <Icon name="walk" size={24} color={colors.text} />
                <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>
                  Log Activity
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: colors.purple,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  marginLeft: 8
                }}
                onPress={handleQuickLogGrooming}
              >
                <Icon name="cut" size={24} color={colors.text} />
                <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>
                  Log Grooming
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Forms */}
      <FeedingScheduleForm
        isVisible={showFeedingForm}
        onClose={() => setShowFeedingForm(false)}
        onSave={handleSaveFeeding}
        initialData={editingFeeding}
      />

      <ActivityForm
        isVisible={showActivityForm}
        onClose={() => setShowActivityForm(false)}
        onSave={handleSaveActivity}
        initialData={editingActivity}
      />

      <GroomingForm
        isVisible={showGroomingForm}
        onClose={() => setShowGroomingForm(false)}
        onSave={handleSaveGrooming}
        initialData={editingGrooming}
      />
    </>
  );
}
