import { RemazColors } from '@/constants/remaz-theme';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingState({ text = 'Carregando...' }: { text?: string }) {
  return (
    <View style={styles.wrapper}>
      <ActivityIndicator color={RemazColors.primary} size="large" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 36, gap: 12, alignItems: 'center', justifyContent: 'center' },
  text: { color: RemazColors.muted, fontSize: 14, textAlign: 'center' },
});
