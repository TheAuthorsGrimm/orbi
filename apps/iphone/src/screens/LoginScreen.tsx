import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../theme';
import type { AuthStackParams } from '../navigation/AuthNavigator';

type Nav = StackNavigationProp<AuthStackParams, 'Login'>;

export function LoginScreen() {
  const nav = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>✦</Text>
          <Text style={styles.logoText}>Orbi</Text>
          <Text style={styles.subtitle}>Your ADHD companion</Text>
        </View>

        <View style={styles.form}>
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
            placeholder="Password"
            placeholderTextColor={COLORS.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign in</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => nav.navigate('Register')} style={styles.linkWrap}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, justifyContent: 'center', padding: SPACING.xl },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xxl },
  logoIcon: { fontSize: 48, color: COLORS.brand, marginBottom: SPACING.sm },
  logoText: { fontSize: 36, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 2 },
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
