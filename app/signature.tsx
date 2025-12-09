import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignatureLayout() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/images/logo2.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userName}>Nome</Text>
          <MaterialCommunityIcons name="account-circle" size={36} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Centralize sua receita</Text>

        <View style={styles.receiptContainer}>
          {/* Exibe uma imagem real existente no projeto. */}
          <Image
            source={require('../assets/images/splash-icon.png')}
            style={styles.receiptImage}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={styles.signButton} onPress={() => { /* layout-only - nenhuma ação */ }}>
          <Text style={styles.signButtonText}>Assinatura eletrônica</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom nav spacer to match layout */}
      <View style={styles.bottomSpacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#006C8C',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {},
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: {
    width: 126,
    height: 50,
    marginRight: 'auto',
  },
  userName: { color: '#FFFFFF', fontSize: 14, marginRight: 6 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 18, fontWeight: '600', color: '#006C8C', marginBottom: 18 },
  receiptContainer: {
    width: '100%',
    height: 360,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  receiptImage: { width: '92%', height: '92%' },
  receiptPlaceholder: {
    width: '92%',
    height: '92%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  receiptPlaceholderText: {
    color: '#888888',
    fontSize: 14,
  },
  signButton: {
    backgroundColor: '#006C8C',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  signButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  bottomSpacer: { height: 88 },
});
