
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/Icon';
import { Pet, Biography } from '../../types';
import { loadPets, getBiographyByPetId } from '../../utils/storage';
import PetIdentityTab from '../../components/PetIdentityTab';
import PetBiographyTab from '../../components/PetBiographyTab';
import PetRoutineTab from '../../components/PetRoutineTab';

type TabType = 'identity' | 'biography' | 'routine';

export default function PetProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [biography, setBiography] = useState<Biography | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPetData();
    }
  }, [id]);

  const loadPetData = async () => {
    try {
      console.log('Loading pet data for ID:', id);
      const pets = await loadPets();
      const foundPet = pets.find(p => p.id === id);
      
      if (!foundPet) {
        Alert.alert('Error', 'Pet not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      setPet(foundPet);
      
      // Load biography
      const petBiography = await getBiographyByPetId(id!);
      setBiography(petBiography);
      
      console.log('Pet data loaded successfully:', foundPet.name);
    } catch (error) {
      console.error('Error loading pet data:', error);
      Alert.alert('Error', 'Failed to load pet data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'identity' as TabType, label: 'Identity', icon: 'person' },
    { id: 'biography' as TabType, label: 'Biography', icon: 'book' },
    { id: 'routine' as TabType, label: 'Routine', icon: 'time' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Loading pet profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Pet not found</Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 20,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity':
        return <PetIdentityTab pet={pet} onPetUpdate={setPet} />;
      case 'biography':
        return <PetBiographyTab pet={pet} biography={biography} onBiographyUpdate={setBiography} />;
      case 'routine':
        return <PetRoutineTab pet={pet} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 2 }]}>{pet.name}</Text>
          <Text style={commonStyles.textLight}>
            {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
          </Text>
        </View>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: pet.isMemorial ? colors.textLight : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon 
            name={pet.isMemorial ? "heart" : "paw"} 
            size={24} 
            color={colors.text} 
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.id ? colors.primary : 'transparent'
            }}
            onPress={() => setActiveTab(tab.id)}
          >
            <Icon 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? colors.primary : colors.textLight} 
            />
            <Text style={{
              fontSize: 12,
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? colors.primary : colors.textLight,
              marginTop: 4
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}
