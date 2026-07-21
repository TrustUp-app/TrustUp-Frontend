import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { UserProfile } from '../../types/User';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

interface EditProfileScreenProps {
  profile: UserProfile | null;
  onBack: () => void;
  /**
   * Persists the edited fields via `PATCH /users/me`.
   */
  onSave: (changes: { displayName: string; username: string }) => void | Promise<void>;
}

const Field: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (t: string) => void;
  autoCapitalize?: 'none' | 'words';
}> = ({ label, value, placeholder, onChangeText, autoCapitalize = 'none' }) => (
  <View style={{ marginTop: 18 }}>
    <Text
      style={{
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
      }}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      autoCapitalize={autoCapitalize}
      style={{
        backgroundColor: colors.white,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    />
  </View>
);

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ profile, onBack, onSave }) => {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');

  const [isSaving, setIsSaving] = useState(false);
  const isValid = displayName.trim().length > 0 && username.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({ displayName: displayName.trim(), username: username.trim() });
      onBack();
    } catch (err) {
      Alert.alert('Save failed', err instanceof Error ? err.message : 'Unable to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.settingsBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header strip */}
      <View
        style={{
          backgroundColor: colors.settingsBg,
          paddingHorizontal: 16,
          paddingTop: insets.top + 24,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Edit Profile</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field
          label="Display name"
          value={displayName}
          placeholder="Your name"
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
        <Field
          label="Username"
          value={username}
          placeholder="username"
          onChangeText={setUsername}
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || isSaving}
          activeOpacity={0.85}
          accessibilityLabel="Save changes"
          accessibilityRole="button"
          style={{
            backgroundColor: isValid && !isSaving ? colors.cta : colors.placeholderAlt,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 28,
          }}>
          <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
