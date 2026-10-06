import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/shared/Header';
import { useProfile, getInitials } from '../../hooks/profile/use-profile';
import { useNotifications } from '../../hooks/notifications/use-notifications';
import type { NotificationType } from '../../types/Notification';

const colors = require('../../theme/colors.json');

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
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

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
            <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}>
              <Text
                className="text-sm font-bold"
                style={{ color: unreadCount === 0 ? colors.textMuted : colors.cta }}>
                Mark all read
              </Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.cta} />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center px-6">
              <Ionicons name="warning-outline" size={48} color={colors.error} />
              <Text className="mt-4 text-center text-base font-medium text-textSecondary">
                {error}
              </Text>
              <TouchableOpacity
                onPress={refresh}
                className="mt-4 rounded-xl bg-cta px-6 py-3"
                accessibilityRole="button">
                <Text className="text-sm font-bold text-white">Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {notifications.length > 0 ? (
                notifications.map((item) => {
                  const iconConfig = getIconConfig(item.type);
                  return (
                    <View
                      key={item.id}
                      className="flex-row items-start px-4 py-4"
                      style={{
                        // Dynamic unread bg has no Tailwind token (#FFFAF8)
                        backgroundColor: !item.isRead ? '#FFFAF8' : 'white',
                      }}>
                      {/* Unread dot */}
                      <View className="w-5 items-center pt-3">
                        {!item.isRead && <View className="h-2 w-2 rounded-full bg-cta" />}
                        {item.isRead && item.type !== 'security' && item.type !== 'reputation' && (
                          <View className="h-2 w-2 rounded-full bg-gray-300" />
                        )}
                      </View>

                      {/* Icon Container: bg is dynamic per type, must remain as style */}
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
                          <TouchableOpacity
                            onPress={() => markAsRead(item.id)}
                            accessibilityLabel="Mark notification as read">
                            <Ionicons name="checkmark" size={20} color={colors.success} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => deleteNotification(item.id)}
                          accessibilityLabel="Delete notification">
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
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
