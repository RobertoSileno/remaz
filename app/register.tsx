import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
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
          <Image source={require('../assets/images/logo1.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.form}>
          <Text style={styles.title}>Criar conta de cliente</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput style={styles.input} placeholder="Nome completo" value={form.name} onChangeText={(value) => update('name', value)} />
          <TextInput style={styles.input} placeholder="CPF" keyboardType="numeric" value={form.cpf} onChangeText={(value) => update('cpf', value)} />
          <TextInput style={styles.input} placeholder="E-mail" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(value) => update('email', value)} />
          <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={form.password} onChangeText={(value) => update('password', value)} />
          <TextInput style={styles.input} placeholder="Confirmar senha" secureTextEntry value={form.confirmPassword} onChangeText={(value) => update('confirmPassword', value)} />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Ja tenho conta. Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  content: { flexGrow: 1 },
  brand: { height: 180, backgroundColor: RemazColors.primary, borderBottomRightRadius: 100, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 185, height: 120 },
  form: { padding: 24, gap: 14 },
  title: { fontSize: 20, fontWeight: '700', color: RemazColors.primaryDark, textAlign: 'center', marginBottom: 4 },
  input: { height: 52, borderWidth: 1.5, borderColor: RemazColors.link, borderRadius: RemazRadius.input, backgroundColor: '#FFF', paddingHorizontal: 18 },
  button: { height: 54, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  error: { color: RemazColors.danger, textAlign: 'center' },
  link: { color: RemazColors.primary, fontWeight: '600', textAlign: 'center', marginTop: 8 },
});
