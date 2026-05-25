import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecoverScreen() {
  const router = useRouter();
  return (
    <View style={styles.page}>
      <View style={styles.brand}>
        <Image source={require('../assets/images/logo2.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperacao de senha</Text>
        <Text style={styles.text}>
          A recuperacao automatica ainda nao esta habilitada. Para proteger sua conta,
          nenhuma senha sera alterada apenas pelo aplicativo.
        </Text>
        <Text style={styles.text}>
          Entre em contato com o atendimento Remaz para validar sua identidade.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
          <Text style={styles.buttonText}>Voltar ao login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.publicBackground },
  brand: { height: 150, backgroundColor: RemazColors.primary, borderBottomLeftRadius: 70, borderBottomRightRadius: 70, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 148, height: 70 },
  card: { margin: 12, marginTop: 20, padding: 18, borderRadius: RemazRadius.card, backgroundColor: '#FFF', gap: 14 },
  title: { color: RemazColors.primaryDark, fontSize: 18, fontWeight: '700' },
  text: { color: RemazColors.muted, fontSize: 13, lineHeight: 20 },
  button: { width: 160, height: 44, alignSelf: 'center', borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
