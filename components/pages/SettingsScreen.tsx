import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSettings, type AppLanguage } from '../../hooks/settings/use-settings';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

const PRIVACY_URL = 'https://trustup.app/privacy';
const TERMS_URL = 'https://trustup.app/terms';

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  es: 'Español',
};

// ─── Custom Toggle ────────────────────────────────────────────────────────────
const TRACK_W = 51;
const TRACK_H = 31;
const THUMB_SIZE = 27;
const THUMB_PADDING = 2;
const TRAVEL = TRACK_W - THUMB_SIZE - THUMB_PADDING * 2; // 20

interface ToggleProps {
  value: boolean;
  onValueChange: () => void;
  accessibilityLabel: string;
}

const CustomToggle: React.FC<ToggleProps> = ({ value, onValueChange, accessibilityLabel }) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D1D5DB', colors.toggleActive],
  });

  const thumbX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_PADDING, THUMB_PADDING + TRAVEL],
  });

  return (
    <TouchableOpacity
      onPress={onValueChange}
      activeOpacity={0.85}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}>
      <Animated.View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          backgroundColor: trackBg,
          justifyContent: 'center',
        }}>
        <Animated.View
          style={{
            position: 'absolute',
            left: thumbX,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Row model ──────────────────────────────────────────────────────────────
type SettingsRow =
  | {
      type: 'link';
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      subtitle: string;
      onPress?: () => void;
      /** Trailing text shown before the chevron (e.g. selected language). */
      value?: string;
    }
  | {
      type: 'toggle';
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      subtitle: string;
      value: boolean;
      onToggle: () => void;
    }
  | {
      type: 'coming-soon';
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      subtitle: string;
    };

interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

// ─── Screen ───────────────────────────────────────────────────────────────────
interface SettingsScreenProps {
  onBack: () => void;
  onProfilePress: () => void;
  onSignOut: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onProfilePress, onSignOut }) => {
  const insets = useSafeAreaInsets();
  const { settings, update } = useSettings();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSelectLanguage = () => {
    Alert.alert('Language', 'Choose your preferred language', [
      { text: LANGUAGE_LABELS.en, onPress: () => update({ language: 'en' }) },
      { text: LANGUAGE_LABELS.es, onPress: () => update({ language: 'es' }) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: onSignOut },
    ]);
  };

  const sections: SettingsSection[] = [
    {
      title: 'ACCOUNT',
      rows: [
        {
          type: 'link',
          icon: 'person-outline',
          label: 'Profile',
          subtitle: 'Manage your personal information',
          onPress: onProfilePress,
        },
        {
          type: 'link',
          icon: 'mail-outline',
          label: 'Email',
          subtitle: 'Change your email address',
        },
        {
          type: 'link',
          icon: 'call-outline',
          label: 'Phone Number',
          subtitle: 'Update your contact number',
        },
      ],
    },
    {
      title: 'PREFERENCES',
      rows: [
        {
          type: 'toggle',
          icon: settings.darkMode ? 'moon-outline' : 'sunny-outline',
          label: 'Dark Mode',
          subtitle: 'Switch between light and dark theme',
          value: settings.darkMode,
          onToggle: () => update({ darkMode: !settings.darkMode }),
        },
        {
          type: 'link',
          icon: 'language-outline',
          label: 'Language',
          subtitle: 'Choose your preferred language',
          value: LANGUAGE_LABELS[settings.language],
          onPress: handleSelectLanguage,
        },
        {
          type: 'toggle',
          icon: 'notifications-outline',
          label: 'Loan Reminders',
          subtitle: 'Receive reminders about upcoming payments',
          value: settings.loanReminders,
          onToggle: () => update({ loanReminders: !settings.loanReminders }),
        },
        {
          type: 'coming-soon',
          icon: 'finger-print-outline',
          label: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
        },
      ],
    },
    {
      title: 'PAYMENT',
      rows: [
        {
          type: 'link',
          icon: 'card-outline',
          label: 'Payment Methods',
          subtitle: 'Manage your cards and accounts',
        },
        {
          type: 'toggle',
          icon: 'lock-open-outline',
          label: 'Auto Pay',
          subtitle: 'Automatically pay your loans',
          value: settings.autoPay,
          onToggle: () => update({ autoPay: !settings.autoPay }),
        },
      ],
    },
    {
      title: 'SUPPORT',
      rows: [
        {
          type: 'link',
          icon: 'help-circle-outline',
          label: 'Help & Support',
          subtitle: 'Get help with your account',
        },
        {
          type: 'link',
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          onPress: () => Linking.openURL(PRIVACY_URL),
        },
        {
          type: 'link',
          icon: 'document-text-outline',
          label: 'Terms of Service',
          subtitle: 'Read our terms of service',
          onPress: () => Linking.openURL(TERMS_URL),
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.settingsBg }}>
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
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Settings</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title}>
            {/* Section header */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1.2,
                marginTop: 24,
                marginBottom: 8,
              }}>
              {section.title}
            </Text>

            {/* Section card */}
            <View style={{ backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden' }}>
              {section.rows.map((row, index) => (
                <View key={row.label}>
                  {row.type === 'coming-soon' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}>
                      {/* Grayed icon */}
                      <View
                        style={{
                          backgroundColor: '#F0F0F0',
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}>
                        <Ionicons name={row.icon} size={20} color={colors.textMuted} />
                      </View>

                      {/* Labels */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>
                          {row.label}
                        </Text>
                        <Text style={{ color: colors.placeholder, fontSize: 12, marginTop: 2 }}>
                          {row.subtitle}
                        </Text>
                      </View>

                      {/* Coming soon badge */}
                      <View
                        style={{
                          backgroundColor: colors.ctaSoft,
                          borderRadius: 20,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}>
                        <Text style={{ color: colors.cta, fontSize: 11, fontWeight: '600' }}>
                          Coming soon
                        </Text>
                      </View>
                    </View>
                  ) : row.type === 'toggle' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}>
                      {/* Icon */}
                      <View
                        style={{
                          backgroundColor: colors.ctaSoft,
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}>
                        <Ionicons name={row.icon} size={20} color={colors.cta} />
                      </View>

                      {/* Labels */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                          {row.label}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {row.subtitle}
                        </Text>
                      </View>

                      {/* Custom Toggle */}
                      <CustomToggle
                        value={row.value}
                        onValueChange={row.onToggle}
                        accessibilityLabel={row.label}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={row.onPress}
                      disabled={!row.onPress}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                      accessibilityLabel={row.label}
                      accessibilityRole="button">
                      {/* Icon */}
                      <View
                        style={{
                          backgroundColor: colors.ctaSoft,
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}>
                        <Ionicons name={row.icon} size={20} color={colors.cta} />
                      </View>

                      {/* Labels */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                          {row.label}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {row.subtitle}
                        </Text>
                      </View>

                      {/* Optional trailing value */}
                      {row.value ? (
                        <Text
                          style={{
                            color: colors.textMuted,
                            fontSize: 13,
                            fontWeight: '600',
                            marginRight: 6,
                          }}>
                          {row.value}
                        </Text>
                      ) : null}

                      {/* Chevron */}
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}

                  {/* Divider (not after last row) */}
                  {index < section.rows.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.borderSubtle,
                        marginLeft: 70,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.85}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 28,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.errorSoft,
          }}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={{ color: colors.error, fontSize: 16, fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 20,
          }}>
          Version {appVersion}
        </Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
