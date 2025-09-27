
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'home', 
      route: '/' 
    },
    { 
      id: 'pets', 
      label: 'Your Pets', 
      icon: 'paw', 
      route: '/pets' 
    },
    { 
      id: 'diary', 
      label: 'Diary', 
      icon: 'book', 
      route: '/diary' 
    },
    { 
      id: 'contacts', 
      label: 'Contacts', 
      icon: 'people', 
      route: '/contacts' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: 'settings', 
      route: '/settings' 
    },
  ];

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  const handleNavigation = (route: string) => {
    console.log('Navigating to:', route);
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={commonStyles.bottomNav}>
      {navItems.map((item) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={item.id}
            style={commonStyles.navItem}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.7}
          >
            <Icon 
              name={item.icon as any} 
              size={24} 
              color={active ? colors.primary : colors.text} 
            />
            <Text style={active ? commonStyles.navTextActive : commonStyles.navText}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
