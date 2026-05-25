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
          <Image source={require('../assets/images/logo2.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.form}>
          <Text style={styles.welcome}>Bem-vindo de volta!</Text>
          <View style={styles.tabs}>
            <View style={[styles.tabButton, styles.activeTab]}>
              <Text style={styles.tab}>Entrar</Text>
            </View>
            <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/register')}>
              <Text style={styles.tab}>Registrar</Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {error ? <Text style={styles.errorHelp}>Confira seus dados ou cadastre uma conta de cliente com CPF valido.</Text> : null}
          <View style={styles.field}>
            <Text style={styles.label}>Email ou CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite"
              placeholderTextColor="#9CA3AF"
              value={identifier}
              autoCapitalize="none"
              onChangeText={setIdentifier}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity onPress={() => router.push('/recover')}>
            <Text style={styles.link}>esqueceu a senha ?</Text>
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
  page: { flex: 1, backgroundColor: RemazColors.publicBackground },
  content: { flexGrow: 1 },
  brand: {
    height: 150,
    backgroundColor: RemazColors.primary,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 148, height: 70 },
  form: { paddingTop: 20, paddingHorizontal: 12, paddingBottom: 30, gap: 14 },
  welcome: { textAlign: 'center', color: '#222', fontSize: 14, marginBottom: 1 },
  tabs: {
    height: 46,
    width: '100%',
    backgroundColor: RemazColors.primary,
    borderRadius: RemazRadius.pill,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 2,
  },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tab: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  activeTab: { backgroundColor: RemazColors.accent, borderRadius: RemazRadius.pill },
  field: { gap: 6 },
  label: { color: '#111', fontSize: 12 },
  input: {
    height: 44,
    borderColor: RemazColors.link,
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    fontSize: 13,
  },
  error: { color: RemazColors.danger, textAlign: 'center' },
  errorHelp: { color: RemazColors.muted, textAlign: 'center', fontSize: 12, marginTop: -8 },
  link: { textAlign: 'right', color: '#444', fontSize: 11, marginTop: 1, marginBottom: 4 },
  button: {
    width: 140,
    height: 44,
    borderRadius: RemazRadius.pill,
    backgroundColor: RemazColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
