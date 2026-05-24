import { AppHeader } from '@/components/app-header';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReceiptScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const choosePdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled) {
      setSelected(result.assets[0]);
    }
  };

  const proceed = () => {
    if (!selected) {
      return;
    }
    router.push({
      pathname: '/checkout',
      params: {
        prescriptionUri: selected.uri,
        prescriptionName: selected.name,
        prescriptionMime: selected.mimeType || 'application/pdf',
      },
    });
  };

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} title="Receita digital" />
      <View style={styles.content}>
        <View style={styles.notice}>
          <MaterialCommunityIcons name="shield-lock-outline" size={28} color={RemazColors.primary} />
          <Text style={styles.noticeTitle}>Documento protegido</Text>
          <Text style={styles.text}>
            Envie sua receita em PDF, assinada pelo gov.br. O documento sera acessivel apenas
            por voce e pela farmacia responsavel pelo pedido.
          </Text>
        </View>
        <TouchableOpacity style={styles.upload} onPress={choosePdf}>
          <MaterialCommunityIcons name="file-pdf-box" size={45} color={RemazColors.accent} />
          <Text style={styles.uploadTitle}>{selected ? selected.name : 'Selecionar receita PDF'}</Text>
          <Text style={styles.text}>{selected ? 'Arquivo pronto para envio' : 'Limite de 10 MB'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, !selected && styles.disabled]} disabled={!selected} onPress={proceed}>
          <Text style={styles.buttonText}>Continuar para checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Voltar ao carrinho</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  content: { padding: 20, gap: 18 },
  notice: { borderRadius: RemazRadius.card, padding: 20, backgroundColor: '#FFF', gap: 10, alignItems: 'center' },
  noticeTitle: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 18 },
  text: { textAlign: 'center', color: RemazColors.muted, lineHeight: 20 },
  upload: { minHeight: 170, borderRadius: RemazRadius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: RemazColors.link, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 18, gap: 8 },
  uploadTitle: { color: RemazColors.primaryDark, fontWeight: '700', textAlign: 'center' },
  button: { height: 54, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.45 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  back: { textAlign: 'center', color: RemazColors.primary, fontWeight: '600' },
});
