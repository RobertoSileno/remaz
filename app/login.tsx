import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [router, user]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Informe seu e-mail ou CPF e sua senha.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await signIn(identifier.trim(), password);
      router.replace('/home');
    } catch (loginError) {
      setError(loginError instanceof ApiError ? loginError.message : 'Nao foi possivel entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={require('../assets/images/logo1.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.form}>
          <Text style={styles.welcome}>Compre seus medicamentos com seguranca</Text>
          <View style={styles.tabs}>
            <Text style={[styles.tab, styles.activeTab]}>Entrar</Text>
            <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/register')}>
              <Text style={styles.tab}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="E-mail ou CPF"
            placeholderTextColor="#9CA3AF"
            value={identifier}
            autoCapitalize="none"
            onChangeText={setIdentifier}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => router.push('/recover')}>
            <Text style={styles.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  content: { flexGrow: 1 },
  brand: {
    height: 280,
    backgroundColor: RemazColors.primary,
    borderBottomRightRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 245, height: 165 },
  form: { padding: 26, gap: 18 },
  welcome: { textAlign: 'center', color: RemazColors.primaryDark, fontSize: 15 },
  tabs: {
    height: 52,
    backgroundColor: RemazColors.primary,
    borderRadius: RemazRadius.pill,
    padding: 5,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  tabButton: { justifyContent: 'center' },
  tab: { paddingHorizontal: 25, paddingVertical: 11, color: '#FFF', fontWeight: '600' },
  activeTab: { backgroundColor: RemazColors.accent, borderRadius: RemazRadius.pill },
  input: {
    height: 54,
    borderColor: RemazColors.link,
    borderWidth: 1.5,
    borderRadius: RemazRadius.input,
    paddingHorizontal: 20,
    backgroundColor: RemazColors.surface,
  },
  error: { color: RemazColors.danger, textAlign: 'center' },
  link: { textAlign: 'right', color: RemazColors.primaryDark, fontSize: 13 },
  button: {
    height: 54,
    borderRadius: RemazRadius.pill,
    backgroundColor: RemazColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
