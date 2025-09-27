
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../components/Icon';
import { Pet, Reminder } from '../types';
import { loadPets, getUpcomingReminders } from '../utils/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading home screen data...');
      const [petsData, remindersData] = await Promise.all([
        loadPets(),
        getUpcomingReminders()
      ]);
      
      setPets(petsData);
      setUpcomingReminders(remindersData.slice(0, 3)); // Show only first 3 reminders
      console.log(`Loaded ${petsData.length} pets and ${remindersData.length} reminders`);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddPet = () => {
    console.log('Navigating to add pet screen');
    router.push('/pets/add');
  };

  const navigateToPetProfile = (petId: string) => {
    console.log('Navigating to pet profile:', petId);
    router.push(`/pets/${petId}`);
  };

  const navigateToDiary = () => {
    console.log('Navigating to diary');
    router.push('/diary');
  };

  const navigateToReminders = () => {
    console.log('Navigating to reminders');
    router.push('/reminders');
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
          <Text style={commonStyles.title}>My Pets Diary</Text>
          <Text style={commonStyles.textLight}>Welcome back! Here&apos;s what&apos;s happening with your pets.</Text>
        </View>

        {/* Quick Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <View style={[commonStyles.card, { flex: 1, marginRight: 8, alignItems: 'center', paddingVertical: 20 }]}>
              <Icon name="paw" size={24} color={colors.primary} />
              <Text style={[commonStyles.subtitle, { marginTop: 8, marginBottom: 4 }]}>{pets.length}</Text>
              <Text style={commonStyles.textLight}>Pets</Text>
            </View>
            <View style={[commonStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center', paddingVertical: 20 }]}>
              <Icon name="notifications" size={24} color={colors.accent} />
              <Text style={[commonStyles.subtitle, { marginTop: 8, marginBottom: 4 }]}>{upcomingReminders.length}</Text>
              <Text style={commonStyles.textLight}>Reminders</Text>
            </View>
          </View>
        </View>

        {/* My Pets Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={commonStyles.subtitle}>My Pets</Text>
            <TouchableOpacity onPress={navigateToAddPet}>
              <Icon name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="paw" size={48} color={colors.textLight} style={{ marginBottom: 16 }} />
              <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>No pets added yet</Text>
              <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 16 }]}>
                Add your first pet to start tracking their health and memories
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
                onPress={navigateToAddPet}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={commonStyles.petCard}
                onPress={() => navigateToPetProfile(pet.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}>
                    <Icon name="paw" size={24} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>{pet.name}</Text>
                    <Text style={commonStyles.textLight}>
                      {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                    </Text>
                    {pet.dateOfBirth && (
                      <Text style={commonStyles.textLight}>
                        Born: {new Date(pet.dateOfBirth).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textLight} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={commonStyles.subtitle}>Upcoming Reminders</Text>
              <TouchableOpacity onPress={navigateToReminders}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>View All</Text>
              </TouchableOpacity>
            </View>

            {upcomingReminders.map((reminder) => (
              <View key={reminder.id} style={[commonStyles.card, { marginBottom: 8 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.warning,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Icon name="time" size={20} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>{reminder.title}</Text>
                    <Text style={commonStyles.textLight}>
                      {new Date(reminder.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, marginRight: 8, alignItems: 'center', paddingVertical: 20 }]}
              onPress={navigateToDiary}
            >
              <Icon name="book" size={28} color={colors.secondary} />
              <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>Diary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center', paddingVertical: 20 }]}
              onPress={navigateToAddPet}
            >
              <Icon name="add" size={28} color={colors.accent} />
              <Text style={[commonStyles.textLight, { marginTop: 8, textAlign: 'center' }]}>Add Pet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={commonStyles.bottomNav}>
        <TouchableOpacity style={commonStyles.navItem}>
          <Icon name="home" size={24} color={colors.primary} />
          <Text style={commonStyles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.navItem} onPress={() => router.push('/pets')}>
          <Icon name="paw" size={24} color={colors.text} />
          <Text style={commonStyles.navText}>Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.navItem} onPress={navigateToDiary}>
          <Icon name="book" size={24} color={colors.text} />
          <Text style={commonStyles.navText}>Diary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.navItem} onPress={() => router.push('/settings')}>
          <Icon name="settings" size={24} color={colors.text} />
          <Text style={commonStyles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
