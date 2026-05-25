import { AppHeader } from '@/components/app-header';
import { BottomNav } from '@/components/bottom-nav';
import { EmptyState, LoadingState } from '@/components/screen-state';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError, CatalogCategory, Inventory } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
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
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedTarja, setSelectedTarja] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  const load = useCallback(async (
    term = query,
    categoryId = selectedCategory,
    tarja = selectedTarja,
  ) => {
    setLoading(true);
    setError('');
    try {
      const [catalog, cart] = await Promise.all([api.catalog(term, categoryId, tarja), api.cart()]);
      setProducts(catalog.results);
      setCategories(catalog.categories);
      setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : 'Nao foi possivel carregar produtos.');
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedTarja]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const search = () => load(query.trim());
  const filterCategory = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    load(query.trim(), categoryId, selectedTarja);
  };
  const filterTarja = (tarja: string) => {
    setSelectedTarja(tarja);
    load(query.trim(), selectedCategory, tarja);
  };
  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTarja('');
    load(query.trim(), undefined, '');
  };
  const add = async (inventory: Inventory) => {
    setAddingId(inventory.id);
    try {
      const cart = await api.addToCart(inventory.id);
      setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
    } catch (addError) {
      Alert.alert('Carrinho', addError instanceof ApiError ? addError.message : 'Nao foi possivel adicionar.');
    } finally {
      setAddingId(null);
    }
  };
  const activeCategory = categories.find((category) => category.id === selectedCategory)?.name;
  const tarjaLabel = {
    sem: 'Sem tarja',
    vermelha: 'Tarja vermelha',
    preta: 'Tarja preta',
  }[selectedTarja];
  const hasFilters = Boolean(selectedCategory || selectedTarja);

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
        <TouchableOpacity accessibilityLabel={`Carrinho, ${cartCount} itens`} style={styles.cartBadge} onPress={() => router.push('/cart')}>
          <Text style={styles.cartCount}>{cartCount}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterToolbar}>
        <TouchableOpacity
          accessibilityLabel={filtersOpen ? 'Fechar filtros' : 'Abrir filtros'}
          style={[styles.filterToggle, filtersOpen && styles.filterToggleOpen]}
          onPress={() => setFiltersOpen((current) => !current)}
        >
          <Text style={[styles.filterToggleText, filtersOpen && styles.filterToggleTextOpen]}>
            {filtersOpen ? 'Fechar filtros' : 'Filtros'}
          </Text>
        </TouchableOpacity>
        {hasFilters ? (
          <TouchableOpacity accessibilityLabel="Limpar filtros" style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {hasFilters ? (
        <Text style={styles.filterSummary}>
          Exibindo: {[activeCategory, tarjaLabel].filter(Boolean).join(' | ')}
        </Text>
      ) : null}
      {filtersOpen ? (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Categoria</Text>
          <ScrollView style={styles.filterScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <TouchableOpacity
              style={[styles.filter, !selectedCategory && styles.filterSelected]}
              onPress={() => filterCategory()}
            >
              <Text style={[styles.filterText, !selectedCategory && styles.filterTextSelected]}>Todos</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.filter, selectedCategory === category.id && styles.filterSelected]}
                onPress={() => filterCategory(category.id)}
              >
                <Text style={[styles.filterText, selectedCategory === category.id && styles.filterTextSelected]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterTitle}>Tarja</Text>
          <ScrollView style={styles.filterScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.labelFilters}>
            {[
              { value: '', label: 'Todas' },
              { value: 'sem', label: 'Sem tarja' },
              { value: 'vermelha', label: 'Vermelha' },
              { value: 'preta', label: 'Preta' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.labelFilter, selectedTarja === option.value && styles.labelFilterSelected]}
                onPress={() => filterTarja(option.value)}
              >
                <Text style={[styles.labelText, selectedTarja === option.value && styles.labelTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}
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
                <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
                <View style={styles.pharmacyLine}>
                  {item.pharmacy.logo ? <Image source={{ uri: item.pharmacy.logo }} style={styles.pharmacyLogo} /> : null}
                  <Text numberOfLines={1} style={styles.detail}>{item.pharmacy.name} | {item.category}</Text>
                </View>
                {item.requires_prescription ? <Text style={styles.prescription}>Exige receita</Text> : null}
                {item.promotion.active ? <Text style={styles.promotion}>{item.promotion.title || 'Promocao'}</Text> : null}
                <Text style={styles.price}>R$ {item.effective_price.replace('.', ',')}</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel={`Adicionar ${item.name}`}
                disabled={addingId === item.id}
                style={[styles.add, addingId === item.id && styles.addDisabled]}
                onPress={() => add(item)}
              >
                {addingId === item.id
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={styles.addText}>+</Text>}
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
  sectionTitle: { paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { color: RemazColors.primaryDark, fontSize: 18, fontWeight: '700' },
  cartBadge: { minWidth: 38, height: 38, backgroundColor: RemazColors.accent, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  cartCount: { color: '#FFF', fontWeight: '700' },
  filterToolbar: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  filterToggle: { height: 42, borderRadius: 21, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: RemazColors.link },
  filterToggleOpen: { backgroundColor: RemazColors.primary, borderColor: RemazColors.primary },
  filterToggleText: { color: RemazColors.primary, fontWeight: '700', fontSize: 13 },
  filterToggleTextOpen: { color: '#FFF' },
  clearButton: { height: 42, justifyContent: 'center', paddingHorizontal: 12 },
  clearText: { color: RemazColors.danger, fontWeight: '700', fontSize: 13 },
  filterSummary: { paddingHorizontal: 18, marginBottom: 10, color: RemazColors.muted, fontSize: 12, fontWeight: '600' },
  filterPanel: { marginHorizontal: 16, marginBottom: 12, paddingVertical: 12, backgroundColor: '#FFF', borderRadius: RemazRadius.card, borderWidth: 1, borderColor: '#E8F1F6', gap: 8 },
  filterTitle: { paddingHorizontal: 14, color: RemazColors.primaryDark, fontWeight: '700', fontSize: 12 },
  filterScroll: { flexGrow: 0 },
  filters: { paddingHorizontal: 12, gap: 8, paddingVertical: 3 },
  filter: { minHeight: 40, justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#D9E6EB', paddingHorizontal: 15 },
  filterSelected: { backgroundColor: RemazColors.primary, borderColor: RemazColors.primary },
  filterText: { color: RemazColors.primaryDark, fontSize: 12, fontWeight: '600' },
  filterTextSelected: { color: '#FFF' },
  labelFilters: { paddingHorizontal: 12, gap: 8, paddingVertical: 3 },
  labelFilter: { height: 38, justifyContent: 'center', borderRadius: 19, paddingHorizontal: 14, backgroundColor: '#E7EEF2' },
  labelFilterSelected: { backgroundColor: RemazColors.accent },
  labelText: { color: RemazColors.primaryDark, fontSize: 12, fontWeight: '600' },
  labelTextSelected: { color: '#FFF' },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  card: { backgroundColor: '#FFF', minHeight: 102, borderRadius: RemazRadius.card, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 62, height: 62, resizeMode: 'contain', borderRadius: 10 },
  imagePlaceholder: { width: 62, height: 62, borderRadius: 12, backgroundColor: '#EFF7FA', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0, gap: 3 },
  name: { color: RemazColors.primaryDark, fontSize: 15, fontWeight: '700' },
  detail: { flexShrink: 1, color: RemazColors.muted, fontSize: 11 },
  pharmacyLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pharmacyLogo: { height: 16, width: 16, borderRadius: 8, resizeMode: 'cover' },
  prescription: { color: RemazColors.danger, fontWeight: '700', fontSize: 11 },
  promotion: { color: RemazColors.success, fontWeight: '700', fontSize: 11 },
  price: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 15, marginTop: 3 },
  add: { width: 42, height: 42, borderRadius: 9, backgroundColor: RemazColors.primary, alignItems: 'center', justifyContent: 'center' },
  addDisabled: { opacity: 0.65 },
  addText: { color: '#FFF', fontSize: 29, fontWeight: '400', lineHeight: 31 },
  message: { padding: 34, gap: 12, alignItems: 'center' },
  error: { textAlign: 'center', color: RemazColors.danger },
  retry: { color: RemazColors.primary, fontWeight: '700' },
});
