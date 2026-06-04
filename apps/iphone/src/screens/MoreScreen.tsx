import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../theme';

interface MenuItem {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}

export function MoreScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const items: MenuItem[] = [
    { icon: '🔔', label: 'Reminders', sublabel: 'Manage your nudges', onPress: () => {} },
    { icon: '📅', label: 'Calendar', sublabel: 'View your schedule', onPress: () => {} },
    { icon: '⚙️', label: 'Settings', sublabel: 'App preferences', onPress: () => {} },
    { icon: '💳', label: 'Subscription', sublabel: `Current plan: ${user?.tier ?? 'free'}`, onPress: () => {} },
    { icon: '🚪', label: 'Sign out', onPress: handleLogout, danger: true },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.slice(0, 2).toUpperCase() ?? 'OR'}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.displayName ?? 'Orbi User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{(user?.tier ?? 'free').toUpperCase()} PLAN</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, item.danger && styles.menuItemDanger]}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
                {item.sublabel && <Text style={styles.menuSublabel}>{item.sublabel}</Text>}
              </View>
              {!item.danger && <Text style={styles.chevron}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Orbi v1.0.0 · Made with ✦ by GrimmForged</Text>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: SPACING.xl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 56, height: 56, borderRadius: RADIUS.full,
    backgroundColor: COLORS.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  tierBadge: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.brand + '33',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  tierText: { color: COLORS.brand, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  menu: { gap: SPACING.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  menuItemDanger: { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)' },
  menuIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  menuLabelDanger: { color: '#ef4444' },
  menuSublabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: COLORS.textTertiary },
  version: { textAlign: 'center', color: COLORS.textTertiary, fontSize: 12, marginTop: SPACING.xxl },
});
