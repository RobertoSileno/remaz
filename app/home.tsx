import { Medication, medications } from '@/data/medications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface CartItem extends Medication {
  quantity: number;
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [medicationQuantities, setMedicationQuantities] = useState<{ [key: number]: number }>({});
  const router = useRouter();

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddToCart = (medication: Medication) => {
    const existingItem = cart.find(item => item.id === medication.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === medication.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medication, quantity: 1 }]);
    }
    
    setMedicationQuantities(prev => ({
      ...prev,
      [medication.id]: (prev[medication.id] || 0) + 1,
    }));
  };

  const handleIncrement = (medicationId: number) => {
    setMedicationQuantities(prev => ({
      ...prev,
      [medicationId]: (prev[medicationId] || 0) + 1,
    }));
    
    const existingItem = cart.find(item => item.id === medicationId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === medicationId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    }
  };

  const handleDecrement = (medicationId: number) => {
    const currentQty = medicationQuantities[medicationId] || 0;
    if (currentQty > 0) {
      setMedicationQuantities(prev => ({
        ...prev,
        [medicationId]: currentQty - 1,
      }));
      
      if (currentQty - 1 === 0) {
        setCart(cart.filter(item => item.id !== medicationId));
      } else {
        setCart(cart.map(item =>
          item.id === medicationId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      }
    }
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={styles.medicationCard}>
      <View style={styles.medicationContent}>
        <View style={styles.medicationImage}>
          <MaterialCommunityIcons name="pill" size={40} color="#0099CC" />
        </View>
        
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <Text style={styles.medicationDose}>{item.dose}</Text>
          
          {item.status === 'proximo' && (
            <Text style={[styles.statusBadge, styles.proximoBadge]}>Mais próximo</Text>
          )}
          {item.status === 'menor_valor' && (
            <Text style={[styles.statusBadge, styles.menorValorBadge]}>Menor valor</Text>
          )}
          
          <View style={styles.priceContainer}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>R$ {item.originalPrice.toFixed(2)}</Text>
            )}
            <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.buttonPlus}
          onPress={() => handleAddToCart(item)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FF3B30" />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>
          {medicationQuantities[item.id] || 0}
        </Text>
        
        <TouchableOpacity
          style={styles.buttonMinus}
          onPress={() => handleDecrement(item.id)}
        >
          <MaterialCommunityIcons name="minus" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo2.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.userInfo}>
          <MaterialCommunityIcons name="account-circle" size={40} color="#FFFFFF" />
          <Text style={styles.userName}>Nome</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#0099CC" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar medicamento"
          placeholderTextColor="#CCC"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Medications List */}
      <FlatList
        data={filteredMedications}
        renderItem={renderMedicationItem}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={true}
        contentContainerStyle={styles.listContainer}
      />

      {/* Floating Action Button - Adicionar ao carrinho */}
      {cart.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => router.push('/receipt')}
        >
          <MaterialCommunityIcons name="cart" size={24} color="#FFFFFF" />
          <Text style={styles.floatingButtonText}>Adicionar ao carrinho</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>OPÇÕES</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="cart" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>CARRINHO</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>ACOMPANHAR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="file-document" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>PEDIDOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#006C8C',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    width: 180,
    height: 72,
  },
  logoMain: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0099CC',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  medicationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0099CC',
    marginBottom: 4,
  },
  medicationDose: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  proximoBadge: {
    color: '#FF9500',
  },
  menorValorBadge: {
    color: '#FF3B30',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityControl: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  buttonPlus: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 25,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 2,
    borderRadius: 3,
  },
  buttonMinus: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#006C8C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#006C8C',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
