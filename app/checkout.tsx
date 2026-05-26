import { AppHeader } from '@/components/app-header';
import { LoadingState } from '@/components/screen-state';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { Address, api, ApiError, Cart } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    prescriptionUri?: string;
    prescriptionName?: string;
    prescriptionMime?: string;
  }>();
  const prescriptionUri = stringParam(params.prescriptionUri);
  const prescriptionName = stringParam(params.prescriptionName);
  const prescriptionMime = stringParam(params.prescriptionMime);
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.cart(), api.addresses()])
      .then(([nextCart, result]) => {
        setCart(nextCart);
        setAddresses(result.addresses);
        const preferred = result.addresses.find((address) => address.is_default) || result.addresses[0];
        setSelectedAddress(preferred?.id ?? null);
      })
      .catch((error) => Alert.alert('Checkout', error instanceof ApiError ? error.message : 'Erro ao carregar checkout.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!selectedAddress) {
      Alert.alert('Endereco', 'Cadastre ou selecione um endereco para continuar.');
      return;
    }
    if (cart?.requires_prescription && !prescriptionUri) {
      router.push('/receipt');
      return;
    }
    const formData = new FormData();
    formData.append('address_id', String(selectedAddress));
    formData.append('delivery_method', deliveryMethod);
    formData.append('payment_method', paymentMethod);
    if (prescriptionUri) {
      formData.append('prescription_file', {
        uri: prescriptionUri,
        name: prescriptionName || 'receita.pdf',
        type: prescriptionMime || 'application/pdf',
      } as unknown as Blob);
    }
    setSubmitting(true);
    try {
      await api.checkout(formData);
      router.replace('/orders');
    } catch (error) {
      Alert.alert('Pedido', error instanceof ApiError ? error.message : 'Nao foi possivel concluir o pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState text="Preparando checkout..." />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} title="Concluir pedido" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.blockTitle}>Endereco de entrega</Text>
        {addresses.map((address) => (
          <TouchableOpacity
            key={address.id}
            style={[styles.option, selectedAddress === address.id && styles.selected]}
            onPress={() => setSelectedAddress(address.id)}
          >
            <MaterialCommunityIcons
              name={selectedAddress === address.id ? 'radiobox-marked' : 'radiobox-blank'}
              size={21}
              color={RemazColors.primary}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{address.label}</Text>
              <Text style={styles.muted}>{address.summary}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push({
            pathname: '/profile',
            params: {
              returnTo: 'checkout',
              prescriptionUri,
              prescriptionName,
              prescriptionMime,
            },
          })}
        >
          <Text style={styles.linkText}>{addresses.length ? 'Adicionar outro endereco' : 'Cadastrar endereco'}</Text>
        </TouchableOpacity>

        <Text style={styles.blockTitle}>Entrega</Text>
        <Choice
          selected={deliveryMethod === 'delivery'}
          title="Receber em casa"
          detail="Entrega no endereco selecionado."
          onPress={() => setDeliveryMethod('delivery')}
        />
        <Choice
          selected={deliveryMethod === 'pickup'}
          title="Retirar na farmacia"
          detail="Reserve e retire presencialmente."
          onPress={() => setDeliveryMethod('pickup')}
        />

        <Text style={styles.blockTitle}>Pagamento</Text>
        <Choice
          selected={paymentMethod === 'pix'}
          title="Pix"
          detail="O QR Code sera exibido em Meus pedidos."
          onPress={() => setPaymentMethod('pix')}
        />
        <Choice
          selected={paymentMethod === 'cash'}
          title="Dinheiro na entrega"
          detail="Pagamento combinado com a farmacia."
          onPress={() => setPaymentMethod('cash')}
        />

        {cart?.requires_prescription ? (
          <View style={styles.prescription}>
            <MaterialCommunityIcons name="file-check-outline" size={25} color={RemazColors.success} />
            <View style={styles.prescriptionCopy}>
              <Text style={styles.prescriptionText}>
                {prescriptionName ? `Receita anexada: ${prescriptionName}` : 'Receita obrigatoria ainda nao anexada.'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/receipt')}>
                <Text style={styles.prescriptionAction}>{prescriptionName ? 'Trocar receita' : 'Escanear ou anexar receita'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={styles.summary}>
          <Text style={styles.blockTitle}>Resumo</Text>
          {cart?.items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.muted}>{item.quantity}x {item.inventory.name}</Text>
              <Text style={styles.value}>R$ {item.subtotal.replace('.', ',')}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalValue}>R$ {cart?.total.replace('.', ',')}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.submit, submitting && styles.disabled]} disabled={submitting} onPress={submit}>
          <Text style={styles.submitText}>{submitting ? 'Confirmando...' : 'Confirmar pedido'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ selected, title, detail, onPress }: { selected: boolean; title: string; detail: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.option, selected && styles.selected]} onPress={onPress}>
      <MaterialCommunityIcons name={selected ? 'radiobox-marked' : 'radiobox-blank'} size={21} color={RemazColors.primary} />
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.muted}>{detail}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  content: { padding: 16, gap: 10, paddingBottom: 34 },
  blockTitle: { fontSize: 18, fontWeight: '700', color: RemazColors.primaryDark, marginTop: 10, marginBottom: 4 },
  option: { padding: 14, borderRadius: 13, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E3E8EC', flexDirection: 'row', alignItems: 'center', gap: 12 },
  selected: { borderColor: RemazColors.link, backgroundColor: '#F5FBFD' },
  optionText: { flex: 1, gap: 3 },
  optionTitle: { fontWeight: '700', color: RemazColors.primaryDark, fontSize: 14 },
  muted: { color: RemazColors.muted, fontSize: 12, lineHeight: 17 },
  value: { color: RemazColors.primaryDark, fontWeight: '600' },
  linkButton: { alignSelf: 'flex-start', paddingVertical: 10 },
  linkText: { color: RemazColors.primary, fontWeight: '700' },
  prescription: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#EFFAF3', padding: 14, borderRadius: 12, marginTop: 10 },
  prescriptionCopy: { flex: 1, gap: 7 },
  prescriptionText: { flex: 1, color: RemazColors.success, fontWeight: '600', fontSize: 13 },
  prescriptionAction: { color: RemazColors.primary, fontSize: 13, fontWeight: '700' },
  summary: { backgroundColor: '#FFF', borderRadius: RemazRadius.card, padding: 17, gap: 10, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontWeight: '700', color: RemazColors.primaryDark, fontSize: 17 },
  totalValue: { fontWeight: '700', color: RemazColors.primaryDark, fontSize: 21 },
  submit: { marginTop: 12, height: 55, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.55 },
});
