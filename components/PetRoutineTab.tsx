
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Pet, DailyRoutine, FeedingSchedule, Activity, GroomingRoutine } from '../types';

interface PetRoutineTabProps {
  pet: Pet;
}

export default function PetRoutineTab({ pet }: PetRoutineTabProps) {
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutineData();
  }, []);

  const loadRoutineData = async () => {
    try {
      // For now, we'll create a mock routine
      // In a real app, this would load from storage
      const mockRoutine: DailyRoutine = {
        petId: pet.id,
        feedingSchedule: [
          {
            id: '1',
            time: '08:00',
            foodType: 'Dry kibble',
            portionSize: '1 cup',
            notes: 'Morning meal'
          },
          {
            id: '2',
            time: '18:00',
            foodType: 'Wet food',
            portionSize: '1/2 can',
            notes: 'Evening meal'
          }
        ],
        activityLog: [
          {
            id: '1',
            date: new Date(),
            type: 'walk',
            duration: 30,
            description: 'Morning walk in the park',
            favoriteToys: ['Ball', 'Rope toy']
          }
        ],
        groomingRoutine: [
          {
            id: '1',
            type: 'brushing',
            frequency: 'Daily',
            lastDone: new Date(Date.now() - 24 * 60 * 60 * 1000),
            nextDue: new Date(),
            notes: 'Brush coat to prevent matting'
          }
        ]
      };
      
      setRoutine(mockRoutine);
      console.log('Routine data loaded');
    } catch (error) {
      console.error('Error loading routine data:', error);
      Alert.alert('Error', 'Failed to load routine data');
    } finally {
      setLoading(false);
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
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 20 }}>
        {/* Feeding Schedule */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={commonStyles.subtitle}>Feeding Schedule</Text>
            <TouchableOpacity>
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
                  <TouchableOpacity>
                    <Icon name="create" size={16} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
                <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                  <Text style={{ fontWeight: '600' }}>Food: </Text>{feeding.foodType}
                </Text>
                <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                  <Text style={{ fontWeight: '600' }}>Portion: </Text>{feeding.portionSize}
                </Text>
                {feeding.notes && (
                  <Text style={commonStyles.textLight}>{feeding.notes}</Text>
                )}
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
            <TouchableOpacity>
              <Icon name="add-circle" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
          
          {routine?.activityLog && routine.activityLog.length > 0 ? (
            routine.activityLog.map((activity) => (
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
                      name={activity.type === 'walk' ? 'walk' : activity.type === 'playtime' ? 'game-controller' : 'fitness'} 
                      size={20} 
                      color={colors.accent} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[commonStyles.text, { fontWeight: '600', textTransform: 'capitalize' }]}>
                      {activity.type}
                    </Text>
                  </View>
                  <Text style={commonStyles.textLight}>
                    {activity.date.toLocaleDateString()}
                  </Text>
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
            <TouchableOpacity>
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
                      name="cut" 
                      size={20} 
                      color={colors.purple} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[commonStyles.text, { fontWeight: '600', textTransform: 'capitalize' }]}>
                      {grooming.type}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Icon name="create" size={16} color={colors.textLight} />
                  </TouchableOpacity>
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
                  <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                    <Text style={{ fontWeight: '600' }}>Next due: </Text>
                    {grooming.nextDue.toLocaleDateString()}
                  </Text>
                )}
                {grooming.notes && (
                  <Text style={commonStyles.textLight}>{grooming.notes}</Text>
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
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: colors.secondary,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginRight: 8
            }}>
              <Icon name="restaurant" size={24} color={colors.text} />
              <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>
                Log Feeding
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: colors.accent,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginHorizontal: 4
            }}>
              <Icon name="walk" size={24} color={colors.text} />
              <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>
                Log Activity
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: colors.purple,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginLeft: 8
            }}>
              <Icon name="cut" size={24} color={colors.text} />
              <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>
                Log Grooming
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
