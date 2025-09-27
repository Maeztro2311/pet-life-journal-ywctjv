
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from './Icon';
import EnhancedButton from './EnhancedButton';
import { commonStyles, colors } from '../styles/commonStyles';
import { Contact } from '../types';
import { loadContacts, saveContact, deleteContact } from '../utils/storage';

const CONTACT_TYPES = [
  { value: 'veterinarian', label: 'Veterinarian', icon: 'medical', color: colors.accent },
  { value: 'groomer', label: 'Groomer', icon: 'cut', color: colors.secondary },
  { value: 'sitter', label: 'Pet Sitter', icon: 'home', color: colors.purple },
  { value: 'emergency', label: 'Emergency Clinic', icon: 'warning', color: colors.error },
  { value: 'other', label: 'Other', icon: 'call', color: colors.yellow },
];

export default function ImportantContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    type: 'veterinarian' as Contact['type'],
    name: '',
    phone: '',
    socialMedia: '',
    address: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    loadContactsData();
  }, []);

  const loadContactsData = async () => {
    try {
      const contactsData = await loadContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({
      type: 'veterinarian',
      name: '',
      phone: '',
      socialMedia: '',
      address: '',
      email: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      type: contact.type,
      name: contact.name,
      phone: contact.phone,
      socialMedia: contact.socialMedia || '',
      address: contact.address || '',
      email: contact.email || '',
      notes: contact.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveContact = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter a name');
        return;
      }

      if (!formData.phone.trim()) {
        Alert.alert('Error', 'Please enter a phone number');
        return;
      }

      const contact: Contact = {
        id: editingContact?.id || generateId(),
        type: formData.type,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        socialMedia: formData.socialMedia.trim() || undefined,
        address: formData.address.trim() || undefined,
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await saveContact(contact);
      await loadContactsData();
      setShowForm(false);
      
      Alert.alert(
        'Success', 
        editingContact ? 'Contact updated successfully' : 'Contact added successfully'
      );
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${contact.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(contact.id);
              await loadContactsData();
              Alert.alert('Success', 'Contact deleted successfully');
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Error opening phone app:', error);
        Alert.alert('Error', 'Failed to open phone app');
      });
  };

  const handleEmail = (email: string) => {
    const emailUrl = `mailto:${email}`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Error opening email app:', error);
        Alert.alert('Error', 'Failed to open email app');
      });
  };

  const getContactTypeInfo = (type: string) => {
    return CONTACT_TYPES.find(t => t.value === type) || CONTACT_TYPES[0];
  };

  const groupContactsByType = (contacts: Contact[]) => {
    const grouped: { [key: string]: Contact[] } = {};
    
    CONTACT_TYPES.forEach(type => {
      grouped[type.value] = contacts.filter(contact => contact.type === type.value);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <View style={[commonStyles.content, { justifyContent: 'center' }]}>
        <Text style={commonStyles.text}>Loading contacts...</Text>
      </View>
    );
  }

  const groupedContacts = groupContactsByType(contacts);

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
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
      }}>
        <Text style={[commonStyles.title, { fontWeight: '700' }]}>Important Contacts</Text>
        <EnhancedButton
          text="Add Contact"
          onPress={handleAddContact}
          variant="primary"
          size="small"
          icon="add"
        />
      </View>

      {contacts.length === 0 ? (
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="people" size={64} color={colors.textLight} />
          <Text style={[commonStyles.subtitle, { marginTop: 20, marginBottom: 8, textAlign: 'center' }]}>
            No contacts yet
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 32, paddingHorizontal: 40 }]}>
            Add important contacts like veterinarians, groomers, and pet sitters
          </Text>
          <EnhancedButton
            text="Add First Contact"
            onPress={handleAddContact}
            variant="primary"
            size="large"
            icon="add"
          />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
            {CONTACT_TYPES.map((type) => {
              const typeContacts = groupedContacts[type.value];
              if (typeContacts.length === 0) return null;

              return (
                <View key={type.value} style={{ marginBottom: 32 }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 16,
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}>
                    <View style={{
                      backgroundColor: type.color,
                      padding: 8,
                      borderRadius: 8,
                      marginRight: 12,
                    }}>
                      <Icon name={type.icon} size={20} color={colors.white} />
                    </View>
                    <Text style={[commonStyles.subtitle, { color: type.color, fontWeight: '600' }]}>
                      {type.label}
                    </Text>
                    <Text style={[commonStyles.textLight, { marginLeft: 8, fontSize: 14 }]}>
                      ({typeContacts.length})
                    </Text>
                  </View>

                  {typeContacts.map((contact) => (
                    <View key={contact.id} style={[
                      commonStyles.card, 
                      {
                        borderLeftWidth: 4,
                        borderLeftColor: type.color,
                        marginBottom: 16,
                      }
                    ]}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[commonStyles.subtitle, { marginBottom: 4, fontWeight: '600' }]}>
                            {contact.name}
                          </Text>
                          <TouchableOpacity 
                            onPress={() => handleCall(contact.phone)}
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                          >
                            <Icon name="call" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '500' }]}>
                              {contact.phone}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity
                            onPress={() => handleCall(contact.phone)}
                            style={{ 
                              backgroundColor: colors.secondary,
                              padding: 8,
                              borderRadius: 8,
                              marginRight: 8,
                            }}
                          >
                            <Icon name="call" size={16} color={colors.white} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleEditContact(contact)}
                            style={{ marginRight: 8, padding: 4 }}
                          >
                            <Icon name="create" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleDeleteContact(contact)}
                            style={{ padding: 4 }}
                          >
                            <Icon name="trash" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {contact.email && (
                        <TouchableOpacity
                          onPress={() => handleEmail(contact.email!)}
                          style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginBottom: 8,
                            paddingVertical: 4,
                          }}
                        >
                          <Icon name="mail" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                          <Text style={[commonStyles.textLight, { color: colors.accent }]}>
                            {contact.email}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {contact.socialMedia && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Icon name="logo-instagram" size={16} color={colors.purple} style={{ marginRight: 8 }} />
                          <Text style={[commonStyles.textLight, { color: colors.purple }]}>
                            {contact.socialMedia}
                          </Text>
                        </View>
                      )}

                      {contact.address && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                          <Icon name="location" size={16} color={colors.yellow} style={{ marginRight: 8, marginTop: 2 }} />
                          <Text style={[commonStyles.textLight, { flex: 1, lineHeight: 20 }]}>
                            {contact.address}
                          </Text>
                        </View>
                      )}

                      {contact.notes && (
                        <View style={{
                          backgroundColor: colors.surface,
                          padding: 12,
                          borderRadius: 8,
                          marginTop: 8,
                        }}>
                          <Text style={[commonStyles.textLight, { fontStyle: 'italic', fontSize: 14 }]}>
                            {contact.notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Add/Edit Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.container}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.card,
            }}>
              <TouchableOpacity onPress={() => setShowForm(false)} style={{ padding: 4 }}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[commonStyles.subtitle, { fontWeight: '600' }]}>
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </Text>
              <TouchableOpacity onPress={handleSaveContact} style={{ padding: 4 }}>
                <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: 20 }}>
                {/* Contact Type */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Contact Type
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  >
                    {CONTACT_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={{
                          alignItems: 'center',
                          backgroundColor: formData.type === type.value ? type.color : colors.card,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: formData.type === type.value ? type.color : colors.border,
                          marginRight: 12,
                          minWidth: 100,
                        }}
                        onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                      >
                        <Icon 
                          name={type.icon} 
                          size={24} 
                          color={formData.type === type.value ? colors.white : colors.text}
                          style={{ marginBottom: 4 }}
                        />
                        <Text style={{
                          textAlign: 'center',
                          color: formData.type === type.value ? colors.white : colors.text,
                          fontWeight: formData.type === type.value ? '600' : '400',
                          fontSize: 12,
                        }}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Name */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Name *
                  </Text>
                  <TextInput
                    style={[
                      commonStyles.input,
                      {
                        paddingVertical: 16,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                      }
                    ]}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Enter contact name"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                {/* Phone */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Phone Number *
                  </Text>
                  <TextInput
                    style={[
                      commonStyles.input,
                      {
                        paddingVertical: 16,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                      }
                    ]}
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textLight}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Email */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      commonStyles.input,
                      {
                        paddingVertical: 16,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                      }
                    ]}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Social Media */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Social Media
                  </Text>
                  <TextInput
                    style={[
                      commonStyles.input,
                      {
                        paddingVertical: 16,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                      }
                    ]}
                    value={formData.socialMedia}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, socialMedia: text }))}
                    placeholder="Instagram, Facebook, etc."
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                {/* Address */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Address
                  </Text>
                  <TextInput
                    style={[
                      commonStyles.input,
                      {
                        height: 100,
                        textAlignVertical: 'top',
                        paddingVertical: 16,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                      }
                    ]}
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                    placeholder="Enter full address"
                    placeholderTextColor={colors.textLight}
                    multiline
                  />
                </View>

                {/* Notes */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={[commonStyles.label, { marginBottom: 12, fontWeight: '600' }]}>
                    Notes
                  </Text>
                  <TextInput
                    style={[
                      commonStyles.input,
                      {
                        height: 100,
                        textAlignVertical: 'top',
                        paddingVertical: 16,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                      }
                    ]}
                    value={formData.notes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                    placeholder="Additional notes..."
                    placeholderTextColor={colors.textLight}
                    multiline
                  />
                </View>

                {/* Save Button */}
                <EnhancedButton
                  text={editingContact ? 'Update Contact' : 'Add Contact'}
                  onPress={handleSaveContact}
                  variant="primary"
                  fullWidth
                  size="large"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
