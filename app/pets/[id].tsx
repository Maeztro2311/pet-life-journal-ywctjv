
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/Icon';
import { Pet, Biography } from '../../types';
import { loadPets, getBiographyByPetId, deletePet } from '../../utils/storage';
import PetIdentityTab from '../../components/PetIdentityTab';
import PetBiographyTab from '../../components/PetBiographyTab';
import PetRoutineTab from '../../components/PetRoutineTab';
import EnhancedButton from '../../components/EnhancedButton';

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

  const handleDeletePet = () => {
    if (!pet) return;

    Alert.alert(
      'Remove Pet',
      `Are you sure you want to remove ${pet.name}? This action cannot be undone and will delete all associated data including diary entries, routines, and health records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePet(pet.id);
              Alert.alert('Success', `${pet.name} has been removed`, [
                { text: 'OK', onPress: () => router.replace('/pets') }
              ]);
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert('Error', 'Failed to remove pet');
            }
          }
        }
      ]
    );
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
          <EnhancedButton
            text="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="medium"
            style={{ marginTop: 20 }}
          />
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
        
        {/* Menu Button */}
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Pet Options',
              `Options for ${pet.name}`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove Pet',
                  style: 'destructive',
                  onPress: handleDeletePet
                }
              ]
            );
          }}
          style={{ marginRight: 12 }}
        >
          <Icon name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
        
        {/* Profile Image or Default Icon */}
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: pet.profileImage ? 'transparent' : (pet.isMemorial ? colors.textLight : colors.primary),
          alignItems: 'center',
          justifyContent: 'center',
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
              color={colors.text} 
            />
          )}
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
            activeOpacity={0.7}
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
