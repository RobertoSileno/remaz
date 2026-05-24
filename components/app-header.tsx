import { RemazColors } from '@/constants/remaz-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  name?: string;
  title?: string;
};

export function AppHeader({ name, title }: Props) {
  return (
    <View style={styles.header}>
      <Image source={require('../assets/images/logo2.png')} style={styles.logo} resizeMode="contain" />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.profile}>
        {name ? <Text numberOfLines={1} style={styles.name}>{name.split(' ')[0]}</Text> : null}
        <MaterialCommunityIcons name="account-circle" size={34} color={RemazColors.surface} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 82,
    backgroundColor: RemazColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 112, height: 52 },
  title: { color: RemazColors.surface, fontSize: 18, fontWeight: '700' },
  profile: { maxWidth: 95, flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, color: RemazColors.surface, fontSize: 12, fontWeight: '700' },
});
