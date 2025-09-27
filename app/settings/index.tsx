
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';

// Add clearAllData function to storage utils
const clearAllData = async (): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.clear();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw new Error('Failed to clear data');
  }
};

export default function SettingsScreen() {
  const router = useRouter();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const settingsItems = [
    {
      id: 'backup',
      title: 'Backup & Sync',
      subtitle: 'Coming soon',
      icon: 'cloud-upload',
      onPress: () => Alert.alert('Coming Soon', 'Backup and sync features will be available in a future update'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage reminders and alerts',
      icon: 'notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available in a future update'),
    },
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Export to PDF or other formats',
      icon: 'download',
      onPress: () => Alert.alert('Coming Soon', 'Data export features will be available in a future update'),
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'Version 1.0.0',
      icon: 'information-circle',
      onPress: () => Alert.alert('My Pets Diary', 'Version 1.0.0\n\nA simple and beautiful app to track your pets\' health, growth, and memories.'),
    },
    {
      id: 'clear',
      title: 'Clear All Data',
      subtitle: 'Remove all pets and diary entries',
      icon: 'trash',
      onPress: handleClearData,
      destructive: true,
    },
  ];

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
        <Text style={commonStyles.title}>Settings</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* App Info */}
          <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Icon name="paw" size={40} color={colors.text} />
            </View>
            <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>My Pets Diary</Text>
            <Text style={commonStyles.textLight}>Keep track of your beloved pets</Text>
          </View>

          {/* Settings Items */}
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[commonStyles.card, { marginBottom: 12 }]}
              onPress={item.onPress}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: item.destructive ? colors.error : colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Icon 
                    name={item.icon as any} 
                    size={20} 
                    color={colors.text} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    commonStyles.text, 
                    { fontWeight: '600', marginBottom: 2 },
                    item.destructive && { color: colors.error }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={commonStyles.textLight}>{item.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
            <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
              Made with ❤️ for pet lovers everywhere
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
