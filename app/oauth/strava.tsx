import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useStrava } from '@/contexts/StravaContext';

export default function StravaOAuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const { handleAuthRedirect } = useStrava();

  useEffect(() => {
    handleAuthRedirect({ code: params.code, error: params.error });
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 450);

    return () => clearTimeout(timeout);
  }, [handleAuthRedirect, params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <ThemedText type="subtitle" style={styles.text}>
        Finishing Strava sign-in…
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  text: {
    textAlign: 'center',
  },
});
