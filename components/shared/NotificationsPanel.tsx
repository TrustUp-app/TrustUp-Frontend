import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Pressable,
    Platform,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.88;

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
            return { name: 'notifications-outline' as const, bg: '#F1F5F9', iconColor: colors.textSubtle };
    }
};

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
    const translateX = useSharedValue(SCREEN_WIDTH);
    const opacity = useSharedValue(0);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    useEffect(() => {
        if (isOpen) {
            translateX.value = withTiming(0, {
                duration: 350,
                easing: Easing.out(Easing.exp),
            });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateX.value = withTiming(SCREEN_WIDTH, {
                duration: 300,
                easing: Easing.in(Easing.exp),
            });
            opacity.value = withTiming(0, { duration: 250 });
        }
    }, [isOpen, translateX, opacity]);

    const animatedPanelStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        pointerEvents: isOpen ? 'auto' : 'none',
    }));

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleDelete = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    if (!isOpen && translateX.value === SCREEN_WIDTH) return null;

    return (
        <View className="absolute inset-0" pointerEvents="box-none">
            {/* Backdrop: absoluteFill + rgba bg kept as style (no Tailwind token for rgba(0,0,0,0.3)) */}
            <Animated.View className="absolute inset-0" style={[styles.backdropColor, animatedBackdropStyle]}>
                <BlurView
                    intensity={Platform.OS === 'ios' ? 20 : 40}
                    tint="dark"
                    className="absolute inset-0"
                >
                    <Pressable className="absolute inset-0" onPress={onClose} />
                </BlurView>
            </Animated.View>

            {/* Panel: width is dynamic (88% of screen), must remain as style */}
            <Animated.View className="absolute right-0 top-0 bottom-0" style={[{ width: PANEL_WIDTH }, animatedPanelStyle]}>
                <View className="flex-1 bg-white rounded-tl-3xl rounded-bl-3xl" style={styles.panelShadow}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
                        <Text className="text-2xl font-bold text-primary">
                            Notifications
                        </Text>
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity onPress={handleMarkAllAsRead}>
                                <Text className="text-sm font-bold text-cta">
                                    Mark all read
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onClose}
                                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                            >
                                <Ionicons name="close" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* List */}
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
                                        }}
                                    >
                                        {/* Unread dot */}
                                        <View className="w-5 items-center pt-3">
                                            {!item.isRead && (
                                                <View className="h-2 w-2 rounded-full bg-cta" />
                                            )}
                                            {item.isRead && (item.type !== 'security' && item.type !== 'reputation') && (
                                                <View className="h-2 w-2 rounded-full bg-gray-300" />
                                            )}
                                        </View>

                                        {/* Icon Container: bg is dynamic per type, must remain as style */}
                                        <View
                                            className="h-10 w-10 items-center justify-center rounded-full"
                                            style={{ backgroundColor: iconConfig.bg }}
                                        >
                                            <Ionicons name={iconConfig.name} size={18} color={iconConfig.iconColor} />
                                        </View>

                                        {/* Content */}
                                        <View className="flex-1 px-3">
                                            <Text className="text-[15px] font-bold text-textStrong">
                                                {item.title}
                                            </Text>
                                            <Text className="mt-0.5 text-[13px] leading-4 text-textSecondary">
                                                {item.body}
                                            </Text>
                                            <Text className="mt-1.5 text-[12px] text-textSubtle">{item.timestamp}</Text>
                                        </View>

                                        {/* Actions */}
                                        <View className="items-center gap-4 pt-1">
                                            {!item.isRead && (
                                                <TouchableOpacity onPress={() => handleMarkAsRead(item.id)}>
                                                    <Ionicons name="checkmark" size={20} color={colors.success} />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
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
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    // rgba(0,0,0,0.3) has no Tailwind equivalent — kept as minimal style object
    backdropColor: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    // Shadow props have no NativeWind equivalent in RN — kept as minimal style object
    panelShadow: {
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
});
