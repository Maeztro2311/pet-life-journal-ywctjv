
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImportantContacts from '../../components/ImportantContacts';
import { commonStyles } from '../../styles/commonStyles';

export default function ContactsScreen() {
  return (
    <SafeAreaView style={commonStyles.container}>
      <ImportantContacts />
    </SafeAreaView>
  );
}
