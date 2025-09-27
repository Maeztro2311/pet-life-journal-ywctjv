
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
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
import Icon from './Icon';
import { 
  scheduleFeedingReminder, 
  scheduleGroomingReminder, 
  cancelNotification,
  requestNotificationPermissions 
} from '../utils/notifications';
import React, { useState, useEffect } from 'react';
import { Pet, DailyRoutine, FeedingSchedule, Activity, GroomingRoutine } from '../types';
import FeedingScheduleForm from './FeedingScheduleForm';
import GroomingForm from './GroomingForm';
import ActivityForm from './ActivityForm';
import HealthControl from './HealthControl';
import { commonStyles, colors } from '../styles/commonStyles';

interface PetRoutineTabProps {
  pet: Pet;
}

type TabType = 'feeding' | 'activity' | 'grooming' | 'health';

export default function PetRoutineTab({ pet }: PetRoutineTabProps) {
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('feeding');
  
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
      await requestNotificationPermissions();
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const loadRoutineData = async () => {
    try {
      console.log('Loading routine data for pet:', pet.id);
      const routineData = await getDailyRoutineByPetId(pet.id);
      setRoutine(routineData);
      console.log('Routine loaded:', routineData);
    } catch (error) {
      console.error('Error loading routine:', error);
      Alert.alert('Error', 'Failed to load routine data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedingReminder = async (feeding: FeedingSchedule) => {
    try {
      const updatedFeeding = { ...feeding, reminderEnabled: !feeding.reminderEnabled };
      
      if (updatedFeeding.reminderEnabled) {
        // Schedule notification
        const notificationId = await scheduleFeedingReminder(
          pet.name,
          feeding.time,
          feeding.foodType
        );
        if (notificationId) {
          updatedFeeding.notificationId = notificationId;
        }
      } else {
        // Cancel notification
        if (feeding.notificationId) {
          await cancelNotification(feeding.notificationId);
        }
        updatedFeeding.notificationId = undefined;
      }

      await updateFeedingSchedule(pet.id, updatedFeeding);
      await loadRoutineData();
    } catch (error) {
      console.error('Error toggling feeding reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const toggleGroomingReminder = async (grooming: GroomingRoutine) => {
    try {
      const updatedGrooming = { ...grooming, reminderEnabled: !grooming.reminderEnabled };
      
      if (updatedGrooming.reminderEnabled && grooming.nextDue) {
        // Schedule notification
        const notificationId = await scheduleGroomingReminder(
          pet.name,
          grooming.type,
          grooming.nextDue
        );
        if (notificationId) {
          updatedGrooming.notificationId = notificationId;
        }
      } else {
        // Cancel notification
        if (grooming.notificationId) {
          await cancelNotification(grooming.notificationId);
        }
        updatedGrooming.notificationId = undefined;
      }

      await updateGroomingRoutine(pet.id, updatedGrooming);
      await loadRoutineData();
    } catch (error) {
      console.error('Error toggling grooming reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  // Feeding Schedule handlers
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
      setShowFeedingForm(false);
      setEditingFeeding(null);
    } catch (error) {
      console.error('Error saving feeding schedule:', error);
      Alert.alert('Error', 'Failed to save feeding schedule');
    }
  };

  const handleDeleteFeeding = (feedingId: string) => {
    Alert.alert(
      'Delete Feeding Schedule',
      'Are you sure you want to delete this feeding schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFeedingSchedule(pet.id, feedingId);
              await loadRoutineData();
            } catch (error) {
              console.error('Error deleting feeding schedule:', error);
              Alert.alert('Error', 'Failed to delete feeding schedule');
            }
          },
        },
      ]
    );
  };

  // Activity handlers
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
      setShowActivityForm(false);
      setEditingActivity(null);
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
              await deleteActivity(pet.id, activityId);
              await loadRoutineData();
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  // Grooming handlers
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
      setShowGroomingForm(false);
      setEditingGrooming(null);
    } catch (error) {
      console.error('Error saving grooming routine:', error);
      Alert.alert('Error', 'Failed to save grooming routine');
    }
  };

  const handleDeleteGrooming = (groomingId: string) => {
    Alert.alert(
      'Delete Grooming Routine',
      'Are you sure you want to delete this grooming routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroomingRoutine(pet.id, groomingId);
              await loadRoutineData();
            } catch (error) {
              console.error('Error deleting grooming routine:', error);
              Alert.alert('Error', 'Failed to delete grooming routine');
            }
          },
        },
      ]
    );
  };

  // Quick log handlers
  const handleQuickLogFeeding = () => {
    Alert.alert('Quick Log', 'Feeding logged successfully!');
  };

  const handleQuickLogActivity = () => {
    Alert.alert('Quick Log', 'Activity logged successfully!');
  };

  const handleQuickLogGrooming = () => {
    Alert.alert('Quick Log', 'Grooming logged successfully!');
  };

  if (loading) {
    return (
      <View style={[commonStyles.content, { justifyContent: 'center' }]}>
        <Text style={commonStyles.text}>Loading routine...</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'feeding', label: 'Feeding', icon: 'restaurant' },
    { id: 'activity', label: 'Activity', icon: 'fitness' },
    { id: 'grooming', label: 'Grooming', icon: 'cut' },
    { id: 'health', label: 'Health', icon: 'medical' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feeding':
        return (
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={commonStyles.subtitle}>Feeding Schedule</Text>
                  <TouchableOpacity
                    style={[commonStyles.card, { 
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }]}
                    onPress={handleAddFeeding}
                  >
                    <Icon name="add" size={16} color={colors.card} />
                    <Text style={[commonStyles.text, { color: colors.card, marginLeft: 4, marginBottom: 0 }]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>

                {routine?.feedingSchedule.length === 0 ? (
                  <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
                    <Icon name="restaurant" size={48} color={colors.textLight} />
                    <Text style={[commonStyles.textLight, { marginTop: 16, textAlign: 'center' }]}>
                      No feeding schedule set up yet. Add your first feeding time to get started.
                    </Text>
                  </View>
                ) : (
                  routine?.feedingSchedule.map((feeding) => (
                    <View key={feeding.id} style={commonStyles.card}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={[commonStyles.subtitle, { fontSize: 18 }]}>
                          {feeding.time}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Switch
                            value={feeding.reminderEnabled || false}
                            onValueChange={() => toggleFeedingReminder(feeding)}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.card}
                          />
                          <TouchableOpacity
                            onPress={() => handleEditFeeding(feeding)}
                            style={{ marginLeft: 12, marginRight: 8 }}
                          >
                            <Icon name="create" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteFeeding(feeding.id)}>
                            <Icon name="trash" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                        Food: {feeding.foodType}
                      </Text>
                      <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                        Portion: {feeding.portionSize}
                      </Text>
                      
                      {feeding.notes && (
                        <Text style={[commonStyles.textLight, { fontStyle: 'italic' }]}>
                          {feeding.notes}
                        </Text>
                      )}
                      
                      {feeding.reminderEnabled && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <Icon name="notifications" size={14} color={colors.primary} />
                          <Text style={[commonStyles.textLight, { marginLeft: 4, fontSize: 12 }]}>
                            Reminder enabled
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'activity':
        return (
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={commonStyles.subtitle}>Activity Log</Text>
                  <TouchableOpacity
                    style={[commonStyles.card, { 
                      backgroundColor: colors.secondary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }]}
                    onPress={handleAddActivity}
                  >
                    <Icon name="add" size={16} color={colors.card} />
                    <Text style={[commonStyles.text, { color: colors.card, marginLeft: 4, marginBottom: 0 }]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>

                {routine?.activityLog.length === 0 ? (
                  <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
                    <Icon name="fitness" size={48} color={colors.textLight} />
                    <Text style={[commonStyles.textLight, { marginTop: 16, textAlign: 'center' }]}>
                      No activities logged yet. Add your first activity to start tracking.
                    </Text>
                  </View>
                ) : (
                  routine?.activityLog
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 10)
                    .map((activity) => (
                      <View key={activity.id} style={commonStyles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={[commonStyles.subtitle, { fontSize: 16 }]}>
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                              onPress={() => handleEditActivity(activity)}
                              style={{ marginRight: 8 }}
                            >
                              <Icon name="create" size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)}>
                              <Icon name="trash" size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <Text style={[commonStyles.textLight, { marginBottom: 4 }]}>
                          {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        
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
                          <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                            Toys: {activity.favoriteToys.join(', ')}
                          </Text>
                        )}
                      </View>
                    ))
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'grooming':
        return (
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={commonStyles.subtitle}>Grooming Routine</Text>
                  <TouchableOpacity
                    style={[commonStyles.card, { 
                      backgroundColor: colors.accent,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }]}
                    onPress={handleAddGrooming}
                  >
                    <Icon name="add" size={16} color={colors.card} />
                    <Text style={[commonStyles.text, { color: colors.card, marginLeft: 4, marginBottom: 0 }]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>

                {!routine?.groomingRoutine || routine.groomingRoutine.length === 0 ? (
                  <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
                    <Icon name="cut" size={48} color={colors.textLight} />
                    <Text style={[commonStyles.textLight, { marginTop: 16, textAlign: 'center' }]}>
                      No grooming routine set up yet. Add grooming tasks to keep track of your pet's care.
                    </Text>
                  </View>
                ) : (
                  routine.groomingRoutine.map((grooming) => (
                    <View key={grooming.id} style={commonStyles.card}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={[commonStyles.subtitle, { fontSize: 18 }]}>
                          {grooming.type.charAt(0).toUpperCase() + grooming.type.slice(1)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Switch
                            value={grooming.reminderEnabled || false}
                            onValueChange={() => toggleGroomingReminder(grooming)}
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={colors.card}
                          />
                          <TouchableOpacity
                            onPress={() => handleEditGrooming(grooming)}
                            style={{ marginLeft: 12, marginRight: 8 }}
                          >
                            <Icon name="create" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteGrooming(grooming.id)}>
                            <Icon name="trash" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                        Frequency: {grooming.frequency}
                      </Text>
                      
                      {grooming.lastDone && (
                        <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                          Last done: {grooming.lastDone.toLocaleDateString()}
                        </Text>
                      )}
                      
                      {grooming.nextDue && (
                        <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                          Next due: {grooming.nextDue.toLocaleDateString()}
                        </Text>
                      )}
                      
                      {grooming.notes && (
                        <Text style={[commonStyles.textLight, { fontStyle: 'italic' }]}>
                          {grooming.notes}
                        </Text>
                      )}
                      
                      {grooming.reminderEnabled && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <Icon name="notifications" size={14} color={colors.accent} />
                          <Text style={[commonStyles.textLight, { marginLeft: 4, fontSize: 12 }]}>
                            Reminder enabled
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'health':
        return <HealthControl pet={pet} />;

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.id ? colors.primary : 'transparent',
            }}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Icon 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? colors.primary : colors.textLight} 
            />
            <Text style={[
              commonStyles.textLight,
              { 
                fontSize: 12,
                marginTop: 4,
                color: activeTab === tab.id ? colors.primary : colors.textLight,
                fontWeight: activeTab === tab.id ? '600' : '400',
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Forms */}
      <FeedingScheduleForm
        isVisible={showFeedingForm}
        onClose={() => {
          setShowFeedingForm(false);
          setEditingFeeding(null);
        }}
        onSave={handleSaveFeeding}
        initialData={editingFeeding}
      />

      <ActivityForm
        isVisible={showActivityForm}
        onClose={() => {
          setShowActivityForm(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        initialData={editingActivity}
      />

      <GroomingForm
        isVisible={showGroomingForm}
        onClose={() => {
          setShowGroomingForm(false);
          setEditingGrooming(null);
        }}
        onSave={handleSaveGrooming}
        initialData={editingGrooming}
      />
    </View>
  );
}
