import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsScreen, PrefsState } from '../../hooks/settings/use-settings-screen';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

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
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          backgroundColor: trackBg,
          justifyContent: 'center',
        }}
      >
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

// ─── Screen ───────────────────────────────────────────────────────────────────
interface SettingsScreenProps {
  onBack: () => void;
}

type RowType = 'link' | 'toggle';

interface SettingsRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  type: RowType;
  toggleKey?: keyof PrefsState;
}

interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

const SECTIONS: SettingsSection[] = [
  {
    title: 'ACCOUNT',
    rows: [
      { icon: 'person-outline', label: 'Profile', subtitle: 'Manage your personal information', type: 'link' },
      { icon: 'mail-outline', label: 'Email', subtitle: 'Change your email address', type: 'link' },
      { icon: 'call-outline', label: 'Phone Number', subtitle: 'Update your contact number', type: 'link' },
    ],
  },
  {
    title: 'PREFERENCES',
    rows: [
      { icon: 'sunny-outline', label: 'Dark Mode', subtitle: 'Switch between light and dark theme', type: 'toggle', toggleKey: 'darkMode' },
      { icon: 'notifications-outline', label: 'Notifications', subtitle: 'Receive push notifications', type: 'toggle', toggleKey: 'notifications' },
      { icon: 'finger-print-outline', label: 'Biometric Authentication', subtitle: 'Use fingerprint or face ID', type: 'toggle', toggleKey: 'biometric' },
    ],
  },
  {
    title: 'PAYMENT',
    rows: [
      { icon: 'card-outline', label: 'Payment Methods', subtitle: 'Manage your cards and accounts', type: 'link' },
      { icon: 'lock-open-outline', label: 'Auto Pay', subtitle: 'Automatically pay your loans', type: 'toggle', toggleKey: 'autoPay' },
    ],
  },
  {
    title: 'SUPPORT',
    rows: [
      { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'Get help with your account', type: 'link' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy', subtitle: 'Read our privacy policy', type: 'link' },
    ],
  },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { prefs, togglePref } = useSettingsScreen();

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
        }}
      >
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
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
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
              }}
            >
              {section.title}
            </Text>

            {/* Section card */}
            <View style={{ backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden' }}>
              {section.rows.map((row, index) => (
                <View key={row.label}>
                  {row.type === 'toggle' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                    >
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
                        }}
                      >
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
                        value={prefs[row.toggleKey!]}
                        onValueChange={() => togglePref(row.toggleKey!)}
                        accessibilityLabel={row.label}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                      accessibilityLabel={row.label}
                      accessibilityRole="button"
                    >
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
                        }}
                      >
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
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
