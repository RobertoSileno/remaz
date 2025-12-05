import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecoverScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleReset = () => {
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      // Aqui você pode implementar a lógica de reset real.
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image
                          source={require('../assets/images/logo1.png')}
                          style={styles.logo}
                          resizeMode="contain"
                        />
                    </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.helpLinkContainer}>
            <Text style={styles.helpLinkText}>Precisa de ajuda?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleReset} activeOpacity={0.8}>
            <Text style={styles.registerButtonText}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  content: { width: '100%', alignItems: 'center' },
  logoContainer: { marginBottom: 20, alignItems: 'center' },
  logo: { width: 538, height: 269 },
  
  inputWrapper: { width: '100%', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#0099CC', marginBottom: 6, marginLeft: 4 },
  input: { width: '100%', borderWidth: 1, borderColor: '#0099CC', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333', backgroundColor: '#FFFFFF' },
  helpLinkContainer: { marginBottom: 24, marginTop: 8 },
  helpLinkText: { fontSize: 12, color: '#0099CC', fontWeight: '500' },
  registerButton: { width: '100%', backgroundColor: '#FF3B30', paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 5 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
