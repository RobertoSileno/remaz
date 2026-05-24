import { AppHeader } from '@/components/app-header';
import { BottomNav } from '@/components/bottom-nav';
import { EmptyState, LoadingState } from '@/components/screen-state';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError, Order } from '@/services/api';
import * as Linking from 'expo-linking';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.orders()
      .then((result) => setOrders(result.orders))
      .catch((error) => Alert.alert('Pedidos', error instanceof ApiError ? error.message : 'Erro ao carregar pedidos.'))
      .finally(() => setLoading(false));
  }, []));

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} title="Meus pedidos" />
      {loading ? <LoadingState /> : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState text="Voce ainda nao possui pedidos." />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.heading}>
                <Text style={styles.title}>Pedido #{item.id}</Text>
                <Text style={styles.status}>{item.status_label}</Text>
              </View>
              <Text style={styles.detail}>{item.pharmacy} | {new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
              {item.items.map((product) => (
                <Text key={product.name} style={styles.item}>{product.quantity}x {product.name}</Text>
              ))}
              <Text style={styles.total}>Total: R$ {item.total.replace('.', ',')}</Text>
              {item.requires_prescription ? (
                <Text style={styles.prescription}>Receita: {item.prescription_status}</Text>
              ) : null}
              {item.payment?.method === 'pix' ? (
                <View style={styles.payment}>
                  <Text style={styles.paymentTitle}>Pix: {item.payment.status}</Text>
                  {item.payment.payment_url ? (
                    <TouchableOpacity style={styles.payButton} onPress={() => Linking.openURL(item.payment!.payment_url)}>
                      <Text style={styles.payText}>Abrir pagamento Pix</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.payment.error_message ? <Text style={styles.detail}>{item.payment.error_message}</Text> : null}
                </View>
              ) : null}
            </View>
          )}
        />
      )}
      <BottomNav active="orders" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  list: { padding: 16, gap: 13, flexGrow: 1 },
  card: { backgroundColor: '#FFF', borderRadius: RemazRadius.card, padding: 17, gap: 8 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: RemazColors.primaryDark },
  status: { fontSize: 11, fontWeight: '700', color: RemazColors.primary, backgroundColor: '#EFF7FA', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8 },
  detail: { fontSize: 12, color: RemazColors.muted },
  item: { fontSize: 14, color: RemazColors.primaryDark },
  total: { fontSize: 16, fontWeight: '700', color: RemazColors.primaryDark, marginTop: 5 },
  prescription: { color: RemazColors.warning, fontWeight: '600' },
  payment: { gap: 8, paddingTop: 10, borderTopColor: '#E5E7EB', borderTopWidth: 1 },
  paymentTitle: { fontWeight: '700', color: RemazColors.primaryDark },
  payButton: { height: 44, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center' },
  payText: { color: '#FFF', fontWeight: '700' },
});
