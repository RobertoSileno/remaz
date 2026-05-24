import { RemazColors } from '@/constants/remaz-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Route = 'home' | 'cart' | 'orders' | 'profile';

export function BottomNav({ active }: { active: Route }) {
  const router = useRouter();
  const links: { route: Route; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { route: 'home', label: 'Inicio', icon: 'home' },
    { route: 'cart', label: 'Carrinho', icon: 'cart' },
    { route: 'orders', label: 'Pedidos', icon: 'file-document-outline' },
    { route: 'profile', label: 'Perfil', icon: 'account' },
  ];
  return (
    <View style={styles.nav}>
      {links.map((link) => (
        <TouchableOpacity key={link.route} style={styles.item} onPress={() => router.replace(`/${link.route}`)}>
          <MaterialCommunityIcons
            name={link.icon}
            size={23}
            color={active === link.route ? RemazColors.surface : '#C6DFEA'}
          />
          <Text style={[styles.text, active === link.route && styles.selected]}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 68,
    backgroundColor: RemazColors.primary,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: { alignItems: 'center', gap: 4, minWidth: 62 },
  text: { color: '#C6DFEA', fontSize: 11, fontWeight: '600' },
  selected: { color: RemazColors.surface },
});
