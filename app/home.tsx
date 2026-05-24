import { AppHeader } from '@/components/app-header';
import { BottomNav } from '@/components/bottom-nav';
import { EmptyState, LoadingState } from '@/components/screen-state';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError, Inventory } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Inventory[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  const load = useCallback(async (term = query) => {
    setLoading(true);
    setError('');
    try {
      const [catalog, cart] = await Promise.all([api.catalog(term), api.cart()]);
      setProducts(catalog.results);
      setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : 'Nao foi possivel carregar produtos.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const search = () => load(query.trim());
  const add = async (inventory: Inventory) => {
    try {
      const cart = await api.addToCart(inventory.id);
      setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
    } catch (addError) {
      Alert.alert('Carrinho', addError instanceof ApiError ? addError.message : 'Nao foi possivel adicionar.');
    }
  };

  if (authLoading || (!user && !error)) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} />
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color={RemazColors.primary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
          placeholder="Buscar medicamento ou farmacia"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={search}>
          <Text style={styles.searchAction}>Buscar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionTitle}>
        <Text style={styles.heading}>Medicamentos disponiveis</Text>
        <TouchableOpacity style={styles.cartBadge} onPress={() => router.push('/cart')}>
          <MaterialCommunityIcons name="cart" size={19} color="#FFF" />
          <Text style={styles.cartCount}>{cartCount}</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={() => load()}><Text style={styles.retry}>Tentar novamente</Text></TouchableOpacity>
        </View>
      ) : loading ? (
        <LoadingState text="Buscando medicamentos..." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState text="Nenhum medicamento disponivel para esta pesquisa." />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="pill" size={32} color={RemazColors.primary} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>{item.pharmacy.name} | {item.category}</Text>
                {item.requires_prescription ? <Text style={styles.prescription}>Exige receita</Text> : null}
                {item.promotion.active ? <Text style={styles.promotion}>{item.promotion.title || 'Promocao'}</Text> : null}
                <Text style={styles.price}>R$ {item.effective_price.replace('.', ',')}</Text>
              </View>
              <TouchableOpacity accessibilityLabel={`Adicionar ${item.name}`} style={styles.add} onPress={() => add(item)}>
                <MaterialCommunityIcons name="cart-plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <BottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  searchBox: {
    margin: 16,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: RemazRadius.pill,
    backgroundColor: '#FFF',
    borderColor: RemazColors.link,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: RemazColors.primaryDark },
  searchAction: { color: RemazColors.primary, fontWeight: '700', fontSize: 13 },
  sectionTitle: { paddingHorizontal: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { color: RemazColors.primaryDark, fontSize: 18, fontWeight: '700' },
  cartBadge: { backgroundColor: RemazColors.accent, borderRadius: 20, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 7, gap: 5 },
  cartCount: { color: '#FFF', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  card: { backgroundColor: '#FFF', borderRadius: RemazRadius.card, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 62, height: 62, resizeMode: 'contain', borderRadius: 10 },
  imagePlaceholder: { width: 62, height: 62, borderRadius: 12, backgroundColor: '#EFF7FA', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 3 },
  name: { color: RemazColors.primaryDark, fontSize: 15, fontWeight: '700' },
  detail: { color: RemazColors.muted, fontSize: 11 },
  prescription: { color: RemazColors.danger, fontWeight: '700', fontSize: 11 },
  promotion: { color: RemazColors.success, fontWeight: '700', fontSize: 11 },
  price: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 15, marginTop: 3 },
  add: { width: 44, height: 44, borderRadius: 22, backgroundColor: RemazColors.accent, alignItems: 'center', justifyContent: 'center' },
  message: { padding: 34, gap: 12, alignItems: 'center' },
  error: { textAlign: 'center', color: RemazColors.danger },
  retry: { color: RemazColors.primary, fontWeight: '700' },
});
