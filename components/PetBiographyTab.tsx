
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Pet, Biography } from '../types';
import { saveBiography } from '../utils/storage';

interface PetBiographyTabProps {
  pet: Pet;
  biography: Biography | null;
  onBiographyUpdate: (biography: Biography) => void;
}

export default function PetBiographyTab({ pet, biography, onBiographyUpdate }: PetBiographyTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBiography, setEditedBiography] = useState<Biography>(
    biography || {
      petId: pet.id,
      origin: '',
      background: '',
      character: '',
      personality: '',
      favoriteFood: '',
      favoriteToy: '',
      likes: [],
      dislikes: [],
      bondWithOwner: '',
      bondWithOtherPets: '',
      signatureMoments: [],
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBiography(editedBiography);
      onBiographyUpdate(editedBiography);
      setIsEditing(false);
      console.log('Pet biography updated successfully');
      Alert.alert('Success', 'Biography updated successfully!');
    } catch (error) {
      console.error('Error updating biography:', error);
      Alert.alert('Error', 'Failed to update biography');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedBiography(
      biography || {
        petId: pet.id,
        origin: '',
        background: '',
        character: '',
        personality: '',
        favoriteFood: '',
        favoriteToy: '',
        likes: [],
        dislikes: [],
        bondWithOwner: '',
        bondWithOtherPets: '',
        signatureMoments: [],
      }
    );
    setIsEditing(false);
  };

  const handleArrayUpdate = (field: 'likes' | 'dislikes' | 'signatureMoments', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setEditedBiography(prev => ({ ...prev, [field]: items }));
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 20 }}>
        {/* Edit Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
          {!isEditing ? (
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => setIsEditing(true)}
            >
              <Icon name="create" size={16} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.textLight,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                onPress={handleCancel}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  opacity: saving ? 0.6 : 1
                }}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Background & Origin */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Background & Origin</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Origin</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.origin || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, origin: text }))}
                placeholder="Where did your pet come from?"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.origin || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Background</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.background || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, background: text }))}
                placeholder="Tell us about your pet's background story"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.background || 'Not specified'}</Text>
            )}
          </View>
        </View>

        {/* Personality */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Personality</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Character</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.character || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, character: text }))}
                placeholder="Describe your pet's character"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.character || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Personality Traits</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.personality || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, personality: text }))}
                placeholder="What makes your pet unique?"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.personality || 'Not specified'}</Text>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Preferences</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Favorite Food</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={editedBiography.favoriteFood || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, favoriteFood: text }))}
                placeholder="What's their favorite food?"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.favoriteFood || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Favorite Toy</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background
                }}
                value={editedBiography.favoriteToy || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, favoriteToy: text }))}
                placeholder="What's their favorite toy?"
                placeholderTextColor={colors.textLight}
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.favoriteToy || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Likes</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 60,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.likes?.join(', ') || ''}
                onChangeText={(text) => handleArrayUpdate('likes', text)}
                placeholder="Things they like (separate with commas)"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>
                {biography?.likes && biography.likes.length > 0 
                  ? biography.likes.join(', ') 
                  : 'Not specified'
                }
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Dislikes</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 60,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.dislikes?.join(', ') || ''}
                onChangeText={(text) => handleArrayUpdate('dislikes', text)}
                placeholder="Things they dislike (separate with commas)"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>
                {biography?.dislikes && biography.dislikes.length > 0 
                  ? biography.dislikes.join(', ') 
                  : 'Not specified'
                }
              </Text>
            )}
          </View>
        </View>

        {/* Relationships */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Relationships</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Bond with Owner</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.bondWithOwner || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, bondWithOwner: text }))}
                placeholder="Describe the bond with you"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.bondWithOwner || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Bond with Other Pets</Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.bondWithOtherPets || ''}
                onChangeText={(text) => setEditedBiography(prev => ({ ...prev, bondWithOtherPets: text }))}
                placeholder="How do they get along with other pets?"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>{biography?.bondWithOtherPets || 'Not specified'}</Text>
            )}
          </View>
        </View>

        {/* Signature Moments */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Signature Moments</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>
              Special memories and moments that define your pet
            </Text>
            {isEditing ? (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 100,
                  textAlignVertical: 'top'
                }}
                value={editedBiography.signatureMoments?.join(', ') || ''}
                onChangeText={(text) => handleArrayUpdate('signatureMoments', text)}
                placeholder="Special moments (separate with commas)"
                placeholderTextColor={colors.textLight}
                multiline
              />
            ) : (
              <Text style={commonStyles.text}>
                {biography?.signatureMoments && biography.signatureMoments.length > 0 
                  ? biography.signatureMoments.join(', ') 
                  : 'No signature moments recorded yet'
                }
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
