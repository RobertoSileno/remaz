import { AppHeader } from '@/components/app-header';
import { RemazColors, RemazRadius } from '@/constants/remaz-theme';
import { useAuth } from '@/contexts/auth-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PrescriptionAsset = {
  uri: string;
  name: string;
  mimeType: string;
  source: 'camera' | 'pdf';
};

export default function ReceiptScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [selected, setSelected] = useState<PrescriptionAsset | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const choosePdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled) {
      const document = result.assets[0];
      setSelected({
        uri: document.uri,
        name: document.name,
        mimeType: document.mimeType || 'application/pdf',
        source: 'pdf',
      });
    }
  };

  const openCamera = async () => {
    const grantedPermission = permission?.granted ? permission : await requestPermission();
    if (!grantedPermission.granted) {
      Alert.alert('Camera', 'Permita o acesso a camera para escanear sua receita assinada.');
      return;
    }
    setShowCamera(true);
  };

  const capturePrescription = async () => {
    if (!cameraRef.current || capturing) {
      return;
    }
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.88 });
      if (photo?.uri) {
        setSelected({
          uri: photo.uri,
          name: `receita_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
          source: 'camera',
        });
        setShowCamera(false);
      }
    } catch {
      Alert.alert('Camera', 'Nao foi possivel capturar a receita. Tente novamente.');
    } finally {
      setCapturing(false);
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
        prescriptionMime: selected.mimeType,
      },
    });
  };

  if (showCamera) {
    return (
      <View style={styles.cameraPage}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <SafeAreaView style={styles.cameraOverlay}>
            <Text style={styles.cameraTitle}>Enquadre a receita assinada</Text>
            <View style={styles.guide} />
            <Text style={styles.cameraHelp}>Capture o documento inteiro, com texto legivel e sem reflexo.</Text>
            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.cancelCamera} onPress={() => setShowCamera(false)}>
                <Text style={styles.cancelCameraText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shutter} disabled={capturing} onPress={capturePrescription}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
              <View style={styles.cameraActionSpacer} />
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <AppHeader name={user?.name} title="Receita digital" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <MaterialCommunityIcons name="shield-lock-outline" size={28} color={RemazColors.primary} />
          <Text style={styles.noticeTitle}>Documento protegido</Text>
          <Text style={styles.text}>
            Envie o PDF assinado ou fotografe a receita ja assinada. O documento sera acessivel
            apenas por voce e pela farmacia responsavel pelo pedido.
          </Text>
        </View>

        {Platform.OS !== 'web' ? (
          <TouchableOpacity style={styles.scan} onPress={openCamera}>
            <MaterialCommunityIcons name="camera-outline" size={30} color={RemazColors.surface} />
            <View style={styles.actionCopy}>
              <Text style={styles.scanTitle}>Escanear com a camera</Text>
              <Text style={styles.scanDetail}>Fotografe agora a receita assinada</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.upload} onPress={choosePdf}>
          <MaterialCommunityIcons name="file-pdf-box" size={43} color={RemazColors.accent} />
          <Text style={styles.uploadTitle}>Selecionar receita PDF</Text>
          <Text style={styles.text}>Documento assinado, limite de 10 MB</Text>
        </TouchableOpacity>

        {selected ? (
          <View style={styles.selection}>
            {selected.source === 'camera' ? <Image source={{ uri: selected.uri }} style={styles.preview} /> : null}
            <View style={styles.selectionCopy}>
              <Text style={styles.selectionTitle}>
                {selected.source === 'camera' ? 'Foto pronta para envio' : 'PDF pronto para envio'}
              </Text>
              <Text style={styles.selectionName}>{selected.name}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.button, !selected && styles.disabled]} disabled={!selected} onPress={proceed}>
          <Text style={styles.buttonText}>Continuar para checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Voltar ao carrinho</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: RemazColors.background },
  content: { padding: 20, gap: 16, paddingBottom: 34 },
  notice: { borderRadius: RemazRadius.card, padding: 20, backgroundColor: RemazColors.surface, gap: 10, alignItems: 'center' },
  noticeTitle: { color: RemazColors.primaryDark, fontWeight: '700', fontSize: 18 },
  text: { textAlign: 'center', color: RemazColors.muted, lineHeight: 20 },
  scan: { minHeight: 78, borderRadius: RemazRadius.card, backgroundColor: RemazColors.primary, flexDirection: 'row', alignItems: 'center', padding: 17, gap: 15 },
  actionCopy: { flex: 1, gap: 4 },
  scanTitle: { color: RemazColors.surface, fontSize: 16, fontWeight: '700' },
  scanDetail: { color: '#D9EDF5', fontSize: 12 },
  upload: { minHeight: 134, borderRadius: RemazRadius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: RemazColors.link, backgroundColor: RemazColors.surface, justifyContent: 'center', alignItems: 'center', padding: 18, gap: 8 },
  uploadTitle: { color: RemazColors.primaryDark, fontWeight: '700', textAlign: 'center' },
  selection: { borderRadius: RemazRadius.card, backgroundColor: RemazColors.surface, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  preview: { width: 62, height: 78, borderRadius: 8, backgroundColor: RemazColors.border },
  selectionCopy: { flex: 1, gap: 5 },
  selectionTitle: { color: RemazColors.success, fontWeight: '700' },
  selectionName: { color: RemazColors.muted, fontSize: 12 },
  button: { height: 54, borderRadius: RemazRadius.pill, backgroundColor: RemazColors.primary, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.45 },
  buttonText: { color: RemazColors.surface, fontSize: 15, fontWeight: '700' },
  back: { textAlign: 'center', color: RemazColors.primary, fontWeight: '600' },
  cameraPage: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, padding: 22, justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.22)' },
  cameraTitle: { marginTop: 20, color: RemazColors.surface, fontSize: 19, fontWeight: '700', textAlign: 'center' },
  guide: { width: '92%', aspectRatio: 0.73, borderRadius: 14, borderWidth: 3, borderColor: RemazColors.surface, backgroundColor: 'transparent' },
  cameraHelp: { color: RemazColors.surface, fontSize: 13, lineHeight: 19, textAlign: 'center', paddingHorizontal: 18 },
  cameraActions: { width: '100%', minHeight: 76, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelCamera: { width: 90, height: 44, justifyContent: 'center' },
  cancelCameraText: { color: RemazColors.surface, fontWeight: '700' },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: RemazColors.surface, justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: RemazColors.surface },
  cameraActionSpacer: { width: 90 },
});
