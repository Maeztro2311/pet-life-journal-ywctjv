
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { DiaryEntry, Pet } from '../../types';
import { loadDiaryEntries, loadPets } from '../../utils/storage';

export default function DiaryScreen() {
  const router = useRouter();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading diary data...');
      const [entriesData, petsData] = await Promise.all([
        loadDiaryEntries(),
        loadPets()
      ]);
      
      setDiaryEntries(entriesData);
      setPets(petsData);
      console.log(`Loaded ${entriesData.length} diary entries`);
    } catch (error) {
      console.error('Error loading diary data:', error);
      Alert.alert('Error', 'Failed to load diary data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddEntry = () => {
    console.log('Navigating to add diary entry');
    router.push('/diary/add');
  };

  const navigateToEntry = (entryId: string) => {
    console.log('Navigating to diary entry:', entryId);
    router.push(`/diary/${entryId}`);
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

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupEntriesByDate = (entries: DiaryEntry[]) => {
    const grouped: { [key: string]: DiaryEntry[] } = {};
    
    entries.forEach(entry => {
      const dateKey = new Date(entry.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Loading diary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const groupedEntries = groupEntriesByDate(diaryEntries);
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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
        <Text style={commonStyles.title}>Diary</Text>
        <TouchableOpacity onPress={navigateToAddEntry}>
          <Icon name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {diaryEntries.length === 0 ? (
          <View style={{ padding: 20 }}>
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 60 }]}>
              <Icon name="book" size={64} color={colors.textLight} style={{ marginBottom: 20 }} />
              <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 8 }]}>
                No diary entries yet
              </Text>
              <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
                Start documenting your pets&apos; daily adventures and special moments
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderRadius: 12,
                }}
                onPress={navigateToAddEntry}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
                  Write First Entry
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {sortedDates.map(dateKey => (
              <View key={dateKey} style={{ marginBottom: 24 }}>
                <Text style={[commonStyles.subtitle, { marginBottom: 12, color: colors.primary }]}>
                  {formatDate(new Date(dateKey))}
                </Text>
                
                {groupedEntries[dateKey].map(entry => (
                  <TouchableOpacity
                    key={entry.id}
                    style={[commonStyles.card, { marginBottom: 12 }]}
                    onPress={() => navigateToEntry(entry.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
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
                      
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            {entry.title || 'Untitled Entry'}
                          </Text>
                          <Text style={commonStyles.textLight}>
                            {getPetName(entry.petId)}
                          </Text>
                        </View>
                        
                        <Text 
                          style={[commonStyles.text, { marginBottom: 8 }]}
                          numberOfLines={2}
                        >
                          {entry.memo}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={commonStyles.textLight}>
                            {new Date(entry.date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Text>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {entry.photos && entry.photos.length > 0 && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                <Icon name="image" size={16} color={colors.textLight} />
                                <Text style={[commonStyles.textLight, { marginLeft: 4 }]}>
                                  {entry.photos.length}
                                </Text>
                              </View>
                            )}
                            <Icon name="chevron-forward" size={16} color={colors.textLight} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
