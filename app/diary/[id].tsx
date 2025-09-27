
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/Icon';
import { DiaryEntry, Pet } from '../../types';
import { loadDiaryEntries, loadPets, deleteDiaryEntry } from '../../utils/storage';

export default function DiaryEntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEntryData();
    }
  }, [id]);

  const loadEntryData = async () => {
    try {
      console.log('Loading diary entry:', id);
      const [entriesData, petsData] = await Promise.all([
        loadDiaryEntries(),
        loadPets()
      ]);
      
      const foundEntry = entriesData.find(e => e.id === id);
      if (foundEntry) {
        setEntry(foundEntry);
        setPets(petsData);
        console.log('Diary entry loaded successfully');
      } else {
        console.error('Diary entry not found:', id);
        Alert.alert('Error', 'Diary entry not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading diary entry:', error);
      Alert.alert('Error', 'Failed to load diary entry');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getPetName = (petId?: string): string => {
    if (!petId) return 'General';
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };

  const getMoodIcon = (mood?: string): string => {
    switch (mood) {
      case 'happy': return 'happy';
      case 'sad': return 'sad';
      case 'excited': return 'flash';
      case 'calm': return 'leaf';
      case 'playful': return 'game-controller';
      case 'tired': return 'bed';
      default: return 'heart';
    }
  };

  const getMoodColor = (mood?: string): string => {
    switch (mood) {
      case 'happy': return colors.secondary;
      case 'sad': return colors.textLight;
      case 'excited': return colors.warning;
      case 'calm': return colors.accent;
      case 'playful': return colors.purple;
      case 'tired': return colors.primary;
      default: return colors.text;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this diary entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (entry) {
                await deleteDiaryEntry(entry.id);
                console.log('Diary entry deleted successfully');
                router.back();
              }
            } catch (error) {
              console.error('Error deleting diary entry:', error);
              Alert.alert('Error', 'Failed to delete diary entry');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (entry) {
      router.push(`/diary/edit/${entry.id}` as any);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Entry not found</Text>
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
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginHorizontal: 16 }]} numberOfLines={1}>
          {entry.title || 'Diary Entry'}
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="create" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Icon name="trash" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Entry Header */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: getMoodColor(entry.mood),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16
              }}>
                <Icon 
                  name={getMoodIcon(entry.mood) as any} 
                  size={24} 
                  color={colors.text} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>
                  {entry.title || 'Untitled Entry'}
                </Text>
                <Text style={commonStyles.textLight}>
                  {getPetName(entry.petId)}
                </Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="calendar" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={commonStyles.textLight}>
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="time" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={commonStyles.textLight}>
                {new Date(entry.date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </View>
          </View>

          {/* Entry Content */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Entry</Text>
            <Text style={[commonStyles.text, { lineHeight: 24 }]}>
              {entry.memo}
            </Text>
          </View>

          {/* Photos */}
          {entry.photos && entry.photos.length > 0 && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                Photos ({entry.photos.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {entry.photos.map((photo, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: colors.backgroundAlt
                      }}
                      onPress={() => {
                        // Could implement full-screen photo viewer
                        console.log('Photo viewer not implemented yet');
                      }}
                    >
                      <Image
                        source={{ uri: photo }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Mood Details */}
          {entry.mood && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Mood</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getMoodColor(entry.mood),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Icon 
                    name={getMoodIcon(entry.mood) as any} 
                    size={20} 
                    color={colors.text} 
                  />
                </View>
                <Text style={[commonStyles.text, { textTransform: 'capitalize', fontWeight: '600' }]}>
                  {entry.mood}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
