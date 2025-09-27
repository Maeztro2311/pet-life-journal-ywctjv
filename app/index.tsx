
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import Icon from '../components/Icon';
import { commonStyles, colors } from '../styles/commonStyles';
import { loadPets, getUpcomingReminders } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pet, Reminder } from '../types';
import { useRouter } from 'expo-router';
import EnhancedButton from '../components/EnhancedButton';

export default function HomeScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
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
      setReminders(remindersData.slice(0, 3)); // Show only first 3 reminders
      console.log('Home data loaded successfully');
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddPet = () => {
    router.push('/pets/add');
  };

  const navigateToPetProfile = (petId: string) => {
    router.push(`/pets/${petId}`);
  };

  const navigateToDiary = () => {
    router.push('/diary');
  };

  const navigateToReminders = () => {
    // TODO: Implement reminders screen
    Alert.alert('Coming Soon', 'Reminders feature will be available soon!');
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
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Text style={commonStyles.title}>My Pets Diary</Text>
          <Text style={commonStyles.textLight}>
            Welcome back! Here&apos;s what&apos;s happening with your pets.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: 20 }]}>
              <Icon name="paw" size={24} color={colors.primary} />
              <Text style={[commonStyles.subtitle, { fontSize: 18, marginTop: 8, marginBottom: 4 }]}>
                {pets.length}
              </Text>
              <Text style={commonStyles.textLight}>
                {pets.length === 1 ? 'Pet' : 'Pets'}
              </Text>
            </View>
            
            <View style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: 20 }]}>
              <Icon name="notifications" size={24} color={colors.accent} />
              <Text style={[commonStyles.subtitle, { fontSize: 18, marginTop: 8, marginBottom: 4 }]}>
                {reminders.length}
              </Text>
              <Text style={commonStyles.textLight}>
                Reminders
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Pets */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={commonStyles.subtitle}>Your Pets</Text>
            {pets.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/pets')}>
                <Text style={[commonStyles.textLight, { fontSize: 14 }]}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {pets.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="paw" size={48} color={colors.textLight} />
              <Text style={[commonStyles.text, { marginTop: 16, marginBottom: 8, textAlign: 'center' }]}>
                No pets added yet
              </Text>
              <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 20 }]}>
                Add your first pet to get started
              </Text>
              <EnhancedButton
                text="Add Pet"
                onPress={navigateToAddPet}
                variant="primary"
                size="medium"
                icon="add"
              />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {pets.slice(0, 5).map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[commonStyles.card, { 
                      width: 140, 
                      alignItems: 'center', 
                      paddingVertical: 16,
                      opacity: pet.isMemorial ? 0.7 : 1
                    }]}
                    onPress={() => navigateToPetProfile(pet.id)}
                    activeOpacity={0.7}
                  >
                    {/* Profile Image or Default Icon */}
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: pet.profileImage ? 'transparent' : (pet.isMemorial ? colors.textLight : colors.primary),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      overflow: 'hidden',
                      borderWidth: pet.profileImage ? 2 : 0,
                      borderColor: colors.border,
                    }}>
                      {pet.profileImage ? (
                        <Image 
                          source={{ uri: pet.profileImage }} 
                          style={{ width: 50, height: 50, borderRadius: 25 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon 
                          name={pet.isMemorial ? "heart" : "paw"} 
                          size={24} 
                          color={colors.card} 
                        />
                      )}
                    </View>

                    <Text style={[commonStyles.text, { fontWeight: '600', textAlign: 'center', marginBottom: 4 }]}>
                      {pet.name}
                    </Text>
                    <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center' }]}>
                      {pet.species}
                    </Text>
                    {pet.isMemorial && (
                      <Icon name="heart" size={12} color={colors.error} style={{ marginTop: 4 }} />
                    )}
                  </TouchableOpacity>
                ))}
                
                {/* Add Pet Card */}
                <TouchableOpacity
                  style={[commonStyles.card, { 
                    width: 140, 
                    alignItems: 'center', 
                    paddingVertical: 16,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: colors.textLight,
                    backgroundColor: 'transparent'
                  }]}
                  onPress={navigateToAddPet}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: colors.textLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Icon name="add" size={24} color={colors.card} />
                  </View>
                  <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center' }]}>
                    Add Pet
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Upcoming Reminders */}
        {reminders.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={commonStyles.subtitle}>Upcoming Reminders</Text>
              <TouchableOpacity onPress={navigateToReminders}>
                <Text style={[commonStyles.textLight, { fontSize: 14 }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {reminders.map((reminder) => (
              <View key={reminder.id} style={[commonStyles.card, { marginBottom: 8, flexDirection: 'row', alignItems: 'center' }]}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.warning,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Icon name="notifications" size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                    {reminder.title}
                  </Text>
                  <Text style={commonStyles.textLight}>
                    {new Date(reminder.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Quick Actions</Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <EnhancedButton
              text="Add Entry"
              onPress={navigateToDiary}
              variant="secondary"
              size="medium"
              icon="book"
              style={{ flex: 1 }}
            />
            <EnhancedButton
              text="Add Pet"
              onPress={navigateToAddPet}
              variant="accent"
              size="medium"
              icon="add"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
