import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useStrava } from '@/contexts/StravaContext';
import { PRESET_GRADIENTS } from '@/constants/gradients';
import { GradientBackground } from '@/components/GradientBackground';

export default function WelcomeScreen() {
  const { athlete, signIn, isAuthenticating, error } = useStrava();
  const { setIsOnboarded } = useOnboarding();

  useEffect(() => {
    if (athlete) {
      setIsOnboarded(true);
    }
  }, [athlete, setIsOnboarded]);

  const heroGradient = useMemo(() => PRESET_GRADIENTS[0], []);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <GradientBackground
          colors={heroGradient.colors}
          orientation={heroGradient.orientation}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <View style={styles.main}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="run-fast" size={72} color="#ffffff" />
            </View>
            <ThemedText type="title" style={styles.title}>
              Make your Strava runs iconic
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Connect your Strava account and craft beautiful story-ready visuals for every run.
            </ThemedText>
          </View>

          <View style={styles.bottomCard}>
            <ThemedText type="subtitle" style={styles.bottomTitle}>
              Sign in with Strava
            </ThemedText>
            <ThemedText style={styles.bottomCopy}>
              We only need read access to import your recent activities. Customize everything later.
            </ThemedText>

            <TouchableOpacity
              disabled={isAuthenticating}
              style={[styles.button, isAuthenticating && styles.buttonDisabled]}
              onPress={signIn}>
              <MaterialCommunityIcons name="run" size={22} color="#ffffff" />
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                {isAuthenticating ? 'Connecting…' : 'Continue with Strava'}
              </ThemedText>
            </TouchableOpacity>

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10121a',
  },
  safeArea: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  main: {
    marginTop: 40,
    gap: 24,
  },
  iconWrapper: {
    height: 96,
    width: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    lineHeight: 40,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    lineHeight: 24,
  },
  bottomCard: {
    backgroundColor: 'rgba(15,17,25,0.85)',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  bottomTitle: {
    color: '#ffffff',
  },
  bottomCopy: {
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FC4C02',
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
  },
  error: {
    color: '#ffb0b0',
    fontSize: 14,
  },
});