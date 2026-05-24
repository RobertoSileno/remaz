import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecoverScreen() {
  const router = useRouter();
  return (
    <View style={styles.page}>
      <View style={styles.brand}>
        <Image source={require('../assets/images/logo1.png')} style={styles.logo} resizeMode="contain" />
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
  page: { flex: 1, backgroundColor: RemazColors.background },
  brand: { height: 260, backgroundColor: RemazColors.primary, borderBottomRightRadius: 130, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 230, height: 145 },
  card: { margin: 24, padding: 24, borderRadius: RemazRadius.card, backgroundColor: '#FFF', gap: 16 },
  title: { color: RemazColors.primaryDark, fontSize: 21, fontWeight: '700' },
  text: { color: RemazColors.muted, fontSize: 15, lineHeight: 22 },
  button: { height: 52, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '700' },
});
