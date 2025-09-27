
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Icon from '../../components/Icon';
import { Pet } from '../../types';
import { loadPets } from '../../utils/storage';

export default function PetsScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPetsData = async () => {
    try {
      console.log('Loading pets data...');
      const petsData = await loadPets();
      setPets(petsData);
      console.log(`Loaded ${petsData.length} pets`);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Error', 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPetsData();
    }, [])
  );

  const navigateToAddPet = () => {
    console.log('Navigating to add pet screen');
    router.push('/pets/add');
  };

  const navigateToPetProfile = (petId: string) => {
    console.log('Navigating to pet profile:', petId);
    router.push(`/pets/${petId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Loading pets...</Text>
        </View>
      </SafeAreaView>
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
        <Text style={commonStyles.title}>My Pets</Text>
        <TouchableOpacity onPress={navigateToAddPet}>
          <Icon name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {pets.length === 0 ? (
          <View style={{ padding: 20 }}>
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 60 }]}>
              <Icon name="paw" size={64} color={colors.textLight} style={{ marginBottom: 20 }} />
              <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 8 }]}>No pets added yet</Text>
              <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
                Start by adding your first pet to track their health, growth, and memories
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderRadius: 12,
                }}
                onPress={navigateToAddPet}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[commonStyles.petCard, { marginHorizontal: 0 }]}
                onPress={() => navigateToPetProfile(pet.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: pet.isMemorial ? colors.textLight : colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}>
                    <Icon 
                      name={pet.isMemorial ? "heart" : "paw"} 
                      size={28} 
                      color={colors.text} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={[commonStyles.subtitle, { marginRight: 8 }]}>{pet.name}</Text>
                      {pet.nickname && (
                        <Text style={[commonStyles.textLight, { fontStyle: 'italic' }]}>
                          &quot;{pet.nickname}&quot;
                        </Text>
                      )}
                    </View>
                    <Text style={[commonStyles.text, { marginBottom: 2 }]}>
                      {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                    </Text>
                    {pet.color && (
                      <Text style={[commonStyles.textLight, { marginBottom: 2 }]}>
                        Color: {pet.color}
                      </Text>
                    )}
                    {pet.dateOfBirth && (
                      <Text style={commonStyles.textLight}>
                        Born: {new Date(pet.dateOfBirth).toLocaleDateString()}
                      </Text>
                    )}
                    {pet.isMemorial && (
                      <Text style={[commonStyles.textLight, { color: colors.error, fontStyle: 'italic' }]}>
                        In loving memory
                      </Text>
                    )}
                  </View>
                  <Icon name="chevron-forward" size={24} color={colors.textLight} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={commonStyles.bottomNav}>
        <TouchableOpacity style={commonStyles.navItem} onPress={() => router.push('/')}>
          <Icon name="home" size={24} color={colors.text} />
          <Text style={commonStyles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.navItem}>
          <Icon name="paw" size={24} color={colors.primary} />
          <Text style={commonStyles.navTextActive}>Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.navItem} onPress={() => router.push('/diary')}>
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
