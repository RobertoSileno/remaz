import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { formatCpf, isValidCpf } from '@/utils/cpf';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', cpf: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const update = (field: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [field]: value }));
  const handleRegister = async () => {
    if (!form.name.trim() || !form.cpf.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Preencha todos os campos para criar sua conta.');
      return;
    }
    if (!isValidCpf(form.cpf)) {
      setError('CPF invalido. Confira os 11 numeros e digitos verificadores.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await signUp(form.name.trim(), form.cpf.trim(), form.email.trim(), form.password);
      router.replace('/home');
    } catch (registerError) {
      setError(registerError instanceof ApiError ? registerError.message : 'Nao foi possivel cadastrar.');
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
          <Text style={styles.welcome}>Crie sua conta</Text>
          <View style={styles.tabs}>
            <TouchableOpacity style={styles.tabButton} onPress={() => router.replace('/login')}>
              <Text style={styles.tab}>Entrar</Text>
            </TouchableOpacity>
            <View style={[styles.tabButton, styles.activeTab]}>
              <Text style={styles.tab}>Registrar</Text>
            </View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.field}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} placeholder="Digite seu nome" placeholderTextColor="#9CA3AF" value={form.name} onChangeText={(value) => update('name', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CPF"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={14}
              value={form.cpf}
              onChangeText={(value) => update('cpf', formatCpf(value))}
            />
            <Text style={styles.helper}>Informe o CPF valido do titular da conta.</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(value) => update('email', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#9CA3AF" secureTextEntry value={form.password} onChangeText={(value) => update('password', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput style={styles.input} placeholder="Confirme sua senha" placeholderTextColor="#9CA3AF" secureTextEntry value={form.confirmPassword} onChangeText={(value) => update('confirmPassword', value)} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Registrar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.publicBackground },
  content: { flexGrow: 1 },
  brand: { height: 150, backgroundColor: RemazColors.primary, borderBottomLeftRadius: 70, borderBottomRightRadius: 70, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 148, height: 70 },
  form: { paddingTop: 20, paddingHorizontal: 12, paddingBottom: 30, gap: 12 },
  welcome: { textAlign: 'center', color: '#222', fontSize: 14, marginBottom: 1 },
  tabs: { height: 46, width: '100%', backgroundColor: RemazColors.primary, borderRadius: RemazRadius.pill, padding: 4, flexDirection: 'row', marginBottom: 2 },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tab: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  activeTab: { backgroundColor: RemazColors.accent, borderRadius: RemazRadius.pill },
  field: { gap: 6 },
  label: { color: '#111', fontSize: 12 },
  input: { height: 44, borderWidth: 1.5, borderColor: RemazColors.link, borderRadius: 22, backgroundColor: 'transparent', paddingHorizontal: 16, fontSize: 13 },
  button: { width: 140, height: 44, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 4 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  error: { color: RemazColors.danger, textAlign: 'center' },
  helper: { color: RemazColors.muted, fontSize: 11, paddingHorizontal: 4 },
});
