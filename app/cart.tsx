import { AppHeader } from '@/components/app-header';
import { BottomNav } from '@/components/bottom-nav';
import { EmptyState, LoadingState } from '@/components/screen-state';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError, Cart } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCart(await api.cart());
    } catch (error) {
      Alert.alert('Carrinho', error instanceof ApiError ? error.message : 'Erro ao carregar carrinho.');
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const changeQuantity = async (id: number, quantity: number) => {
    try {
      setCart(await api.updateCartItem(id, quantity));
    } catch (error) {
      Alert.alert('Carrinho', error instanceof ApiError ? error.message : 'Erro ao atualizar item.');
    }
  };
  const continuePurchase = () => {
    router.push(cart?.requires_prescription ? '/receipt' : '/checkout');
  };

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} title="Carrinho" />
      {loading ? <LoadingState /> : !cart?.items.length ? (
        <View style={styles.empty}>
          <EmptyState text="Seu carrinho esta vazio." />
          <TouchableOpacity style={styles.outline} onPress={() => router.replace('/home')}>
            <Text style={styles.outlineText}>Ver medicamentos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={cart.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.inventory.name}</Text>
                  <Text style={styles.detail}>{item.inventory.pharmacy.name}</Text>
                  {item.inventory.requires_prescription ? <Text style={styles.warning}>Receita obrigatoria</Text> : null}
                  <Text style={styles.price}>R$ {item.subtotal.replace('.', ',')}</Text>
                </View>
                <View style={styles.quantity}>
                  <TouchableOpacity onPress={() => changeQuantity(item.id, item.quantity - 1)}>
                    <MaterialCommunityIcons name="minus-circle-outline" size={27} color={RemazColors.accent} />
                  </TouchableOpacity>
                  <Text style={styles.number}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => changeQuantity(item.id, item.quantity + 1)}>
                    <MaterialCommunityIcons name="plus-circle" size={27} color={RemazColors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListFooterComponent={(
              <View style={styles.summary}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>R$ {cart.total.replace('.', ',')}</Text>
                {cart.requires_prescription ? (
                  <Text style={styles.notice}>Medicamento controlado: envie sua receita PDF assinada antes de concluir.</Text>
                ) : null}
                <TouchableOpacity style={styles.button} onPress={continuePurchase}>
                  <Text style={styles.buttonText}>{cart.requires_prescription ? 'Enviar receita' : 'Concluir pedido'}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
      <BottomNav active="cart" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  list: { padding: 16, gap: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  card: { padding: 16, borderRadius: RemazRadius.card, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, gap: 5 },
  name: { fontSize: 16, fontWeight: '700', color: RemazColors.primaryDark },
  detail: { color: RemazColors.muted, fontSize: 12 },
  warning: { color: RemazColors.danger, fontWeight: '700', fontSize: 12 },
  price: { color: RemazColors.primaryDark, fontWeight: '700', marginTop: 4 },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  number: { fontWeight: '700', color: RemazColors.primaryDark, minWidth: 18, textAlign: 'center' },
  summary: { marginTop: 16, padding: 20, borderRadius: RemazRadius.card, backgroundColor: '#FFF', gap: 12 },
  totalLabel: { color: RemazColors.muted, fontSize: 14 },
  total: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 25 },
  notice: { backgroundColor: '#FFF4F2', padding: 12, borderRadius: 10, color: RemazColors.danger, lineHeight: 19 },
  button: { height: 53, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  outline: { paddingHorizontal: 22, height: 48, borderRadius: RemazRadius.pill, borderWidth: 1, borderColor: RemazColors.primary, justifyContent: 'center' },
  outlineText: { color: RemazColors.primary, fontWeight: '700' },
});
