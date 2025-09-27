
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pet } from '../../types';
import Icon from '../../components/Icon';
import { loadPets } from '../../utils/storage';
import EnhancedButton from '../../components/EnhancedButton';

export default function PetsScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadPetsData();
    }, [])
  );

  const loadPetsData = async () => {
    try {
      console.log('Loading pets data...');
      const petsData = await loadPets();
      setPets(petsData);
      console.log('Pets loaded:', petsData.length);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Error', 'Failed to load pets');
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
        <EnhancedButton
          text="Add Pet"
          onPress={navigateToAddPet}
          variant="primary"
          size="small"
          icon="add"
        />
      </View>

      {pets.length === 0 ? (
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Icon name="paw" size={64} color={colors.textLight} />
          <Text style={[commonStyles.subtitle, { marginTop: 20, marginBottom: 8 }]}>
            No pets yet
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 32 }]}>
            Add your first pet to start tracking their information and memories
          </Text>
          <EnhancedButton
            text="Add Your First Pet"
            onPress={navigateToAddPet}
            variant="primary"
            size="large"
            icon="add"
          />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[commonStyles.petCard, {
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pet.isMemorial ? 0.7 : 1
                }]}
                onPress={() => navigateToPetProfile(pet.id)}
                activeOpacity={0.7}
              >
                {/* Profile Image or Default Icon */}
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: pet.profileImage ? 'transparent' : (pet.isMemorial ? colors.textLight : colors.primary),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  overflow: 'hidden',
                  borderWidth: pet.profileImage ? 2 : 0,
                  borderColor: colors.border,
                }}>
                  {pet.profileImage ? (
                    <Image 
                      source={{ uri: pet.profileImage }} 
                      style={{ width: 60, height: 60, borderRadius: 30 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon 
                      name={pet.isMemorial ? "heart" : "paw"} 
                      size={28} 
                      color={colors.card} 
                    />
                  )}
                </View>

                {/* Pet Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[commonStyles.subtitle, { fontSize: 18, marginBottom: 0 }]}>
                      {pet.name}
                    </Text>
                    {pet.isMemorial && (
                      <Icon name="heart" size={16} color={colors.error} style={{ marginLeft: 8 }} />
                    )}
                  </View>
                  
                  <Text style={[commonStyles.text, { marginBottom: 4 }]}>
                    {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                  </Text>
                  
                  {pet.color && (
                    <Text style={commonStyles.textLight}>
                      {pet.color}
                    </Text>
                  )}
                  
                  {pet.dateOfBirth && (
                    <Text style={[commonStyles.textLight, { fontSize: 12, marginTop: 4 }]}>
                      Born: {pet.dateOfBirth.toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {/* Arrow */}
                <Icon name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
