import { LoadingState } from '@/components/screen-state';
import { useAuth } from '@/contexts/auth-context';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { loading, user } = useAuth();
  if (loading) {
    return <LoadingState text="Abrindo Remaz Pharm..." />;
  }
  return <Redirect href={user ? '/home' : '/login'} />;
}
