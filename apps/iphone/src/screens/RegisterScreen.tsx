import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../theme';
import type { AuthStackParams } from '../navigation/AuthNavigator';

type Nav = StackNavigationProp<AuthStackParams, 'Register'>;

export function RegisterScreen() {
  const nav = useNavigation<Nav>();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!displayName.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim());
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>✦</Text>
          <Text style={styles.logoText}>Join Orbi</Text>
          <Text style={styles.subtitle}>Your ADHD journey starts here</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.textTertiary}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={COLORS.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => nav.navigate('Login')} style={styles.linkWrap}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xxl },
  logoIcon: { fontSize: 48, color: COLORS.brand, marginBottom: SPACING.sm },
  logoText: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 2 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.xs },
  form: { gap: SPACING.md },
  input: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkWrap: { alignItems: 'center', marginTop: SPACING.md },
  link: { color: COLORS.textSecondary, fontSize: 14 },
  linkAccent: { color: COLORS.brand, fontWeight: '600' },
});
