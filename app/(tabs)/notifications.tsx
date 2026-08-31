import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/shared/Header';
import { useProfile, getInitials } from '../../hooks/profile/use-profile';

const colors = require('../../theme/colors.json');

type NotificationType = 'payment' | 'credit' | 'merchant' | 'reputation' | 'security';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Due Soon',
    body: "Your $50.00 payment is due in 3 days. Don't miss it!",
    timestamp: '2 min ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'credit',
    title: 'Credit Increased',
    body: 'Great news! Your available credit increased to $320.00.',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'merchant',
    title: 'New Merchant Available',
    body: 'TechStore has joined TrustUp. Shop with BNPL now.',
    timestamp: '3 hours ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'reputation',
    title: 'Reputation Updated',
    body: 'Your reputation score improved to 82/100. Keep it up!',
    timestamp: 'Yesterday',
    isRead: true,
  },
  {
    id: '5',
    type: 'security',
    title: 'Terms Updated',
    body: "We've updated our privacy policy. Tap to review the changes.",
    timestamp: '3 days ago',
    isRead: true,
  },
];

const getIconConfig = (type: NotificationType) => {
  switch (type) {
    case 'payment':
      return { name: 'time-outline' as const, bg: '#FFF1EB', iconColor: colors.cta };
    case 'credit':
      return { name: 'checkmark-outline' as const, bg: '#E6F9F1', iconColor: colors.success };
    case 'merchant':
      return { name: 'home-outline' as const, bg: '#FFF1EB', iconColor: colors.cta };
    case 'reputation':
      return { name: 'star-outline' as const, bg: '#E6F9F1', iconColor: colors.success };
    case 'security':
      return { name: 'alert-circle-outline' as const, bg: '#F1F5F9', iconColor: colors.textSubtle };
    default:
      return {
        name: 'notifications-outline' as const,
        bg: '#F1F5F9',
        iconColor: colors.textSubtle,
      };
  }
};

export default function NotificationsTab() {
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-background">
        <Header
          displayName={profile?.displayName}
          avatarUrl={profile?.avatarUrl}
          initials={profile ? getInitials(profile.displayName) : undefined}
          onNotificationsPress={() => {}}
          onSettingsPress={() => router.push('/settings')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />

        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
            <Text className="text-2xl font-bold text-primary">Notifications</Text>
            <TouchableOpacity>
              <Text className="text-sm font-bold text-cta">Mark all read</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {MOCK_NOTIFICATIONS.length > 0 ? (
              MOCK_NOTIFICATIONS.map((item) => {
                const iconConfig = getIconConfig(item.type);
                return (
                  <View
                    key={item.id}
                    className="flex-row items-start px-4 py-4"
                    style={{
                      backgroundColor: !item.isRead ? '#FFFAF8' : 'white',
                    }}>
                    {/* Unread dot */}
                    <View className="w-5 items-center pt-3">
                      {!item.isRead && <View className="h-2 w-2 rounded-full bg-cta" />}
                      {item.isRead && item.type !== 'security' && item.type !== 'reputation' && (
                        <View className="h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </View>

                    {/* Icon Container */}
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: iconConfig.bg }}>
                      <Ionicons name={iconConfig.name} size={18} color={iconConfig.iconColor} />
                    </View>

                    {/* Content */}
                    <View className="flex-1 px-3">
                      <Text className="text-[15px] font-bold text-textStrong">{item.title}</Text>
                      <Text className="mt-0.5 text-[13px] leading-4 text-textSecondary">
                        {item.body}
                      </Text>
                      <Text className="mt-1.5 text-[12px] text-textSubtle">{item.timestamp}</Text>
                    </View>

                    {/* Actions */}
                    <View className="items-center gap-4 pt-1">
                      {!item.isRead && (
                        <TouchableOpacity>
                          <Ionicons name="checkmark" size={20} color={colors.success} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="flex-1 items-center justify-center pt-32">
                <Ionicons name="notifications-off-outline" size={48} color={colors.textSubtle} />
                <Text className="mt-4 text-base font-medium text-textSecondary">
                  All caught up!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
