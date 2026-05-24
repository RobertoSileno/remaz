import { AppHeader } from '@/components/app-header';
import { BottomNav } from '@/components/bottom-nav';
import { LoadingState } from '@/components/screen-state';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { Address, api, ApiError } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const blankAddress = {
  label: 'Casa',
  recipient_name: '',
  phone: '',
  cep: '',
  state: '',
  city: '',
  neighborhood: '',
  street: '',
  number: '',
  complement: '',
  is_default: false,
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { returnTo, prescriptionUri, prescriptionName, prescriptionMime } = useLocalSearchParams<{
    returnTo?: string;
    prescriptionUri?: string;
    prescriptionName?: string;
    prescriptionMime?: string;
  }>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({ ...blankAddress, recipient_name: user?.name || '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const result = await api.addresses();
      setAddresses(result.addresses);
    } catch (error) {
      Alert.alert('Endereco', error instanceof ApiError ? error.message : 'Erro ao carregar enderecos.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));
  const addAddress = async () => {
    try {
      await api.addAddress(form);
      setForm({ ...blankAddress, recipient_name: user?.name || '' });
      await load();
      if (returnTo === 'checkout') {
        router.replace({
          pathname: '/checkout',
          params: { prescriptionUri, prescriptionName, prescriptionMime },
        });
      }
    } catch (error) {
      Alert.alert('Endereco', error instanceof ApiError ? error.message : 'Confira os dados preenchidos.');
    }
  };
  const setDefault = async (id: number) => {
    try {
      await api.setDefaultAddress(id);
      await load();
    } catch (error) {
      Alert.alert('Endereco', error instanceof ApiError ? error.message : 'Erro ao atualizar endereco.');
    }
  };
  const remove = async (id: number) => {
    try {
      await api.deleteAddress(id);
      await load();
    } catch (error) {
      Alert.alert('Endereco', error instanceof ApiError ? error.message : 'Erro ao remover endereco.');
    }
  };
  const logout = async () => {
    await signOut();
    router.replace('/login');
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} title="Perfil" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.userCard}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.muted}>{user?.email}</Text>
        </View>
        <Text style={styles.title}>Meus enderecos</Text>
        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <Text style={styles.addressTitle}>{address.label} {address.is_default ? '(Principal)' : ''}</Text>
            <Text style={styles.muted}>{address.recipient_name} | {address.phone}</Text>
            <Text style={styles.muted}>{address.summary}</Text>
            <View style={styles.actions}>
              {!address.is_default ? (
                <TouchableOpacity onPress={() => setDefault(address.id)}>
                  <Text style={styles.action}>Tornar principal</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => remove(address.id)}>
                <Text style={styles.remove}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={styles.title}>Novo endereco</Text>
        <Field label="Nome do endereco" value={form.label} onChangeText={(value) => update('label', value)} />
        <Field label="Quem recebe" value={form.recipient_name} onChangeText={(value) => update('recipient_name', value)} />
        <Field label="Telefone" value={form.phone} onChangeText={(value) => update('phone', value)} keyboardType="phone-pad" />
        <View style={styles.row}>
          <Field small label="CEP" value={form.cep} onChangeText={(value) => update('cep', value)} keyboardType="numeric" />
          <Field tiny label="UF" value={form.state} onChangeText={(value) => update('state', value)} autoCapitalize="characters" />
        </View>
        <Field label="Cidade" value={form.city} onChangeText={(value) => update('city', value)} />
        <Field label="Bairro" value={form.neighborhood} onChangeText={(value) => update('neighborhood', value)} />
        <View style={styles.row}>
          <Field small label="Rua" value={form.street} onChangeText={(value) => update('street', value)} />
          <Field tiny label="Numero" value={form.number} onChangeText={(value) => update('number', value)} />
        </View>
        <Field label="Complemento" value={form.complement} onChangeText={(value) => update('complement', value)} />
        <TouchableOpacity style={styles.button} onPress={addAddress}>
          <Text style={styles.buttonText}>Salvar endereco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  small?: boolean;
  tiny?: boolean;
};

function Field({ label, small, tiny, ...props }: FieldProps) {
  return (
    <View style={[styles.field, small && styles.small, tiny && styles.tiny]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  content: { padding: 16, gap: 11, paddingBottom: 28 },
  userCard: { backgroundColor: '#FFF', padding: 18, borderRadius: RemazRadius.card, gap: 5 },
  userName: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 18 },
  muted: { color: RemazColors.muted, lineHeight: 18, fontSize: 13 },
  title: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 19, marginTop: 10 },
  addressCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 13, gap: 5 },
  addressTitle: { fontWeight: '700', color: RemazColors.primaryDark },
  actions: { flexDirection: 'row', gap: 20, marginTop: 7 },
  action: { color: RemazColors.primary, fontWeight: '700' },
  remove: { color: RemazColors.danger, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 9 },
  field: { gap: 5 },
  small: { flex: 2 },
  tiny: { flex: 1 },
  label: { color: RemazColors.primaryDark, fontSize: 12, fontWeight: '600' },
  input: { height: 49, borderRadius: RemazRadius.input, borderWidth: 1, borderColor: RemazColors.link, backgroundColor: '#FFF', paddingHorizontal: 16 },
  button: { height: 52, borderRadius: RemazRadius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: RemazColors.primary, marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '700' },
  logout: { height: 50, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: RemazColors.danger, fontWeight: '700' },
});
