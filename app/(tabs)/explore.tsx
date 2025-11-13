import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';

const inspirationGradients = [
  ['#ff9a9e', '#fad0c4'],
  ['#43cea2', '#185a9d'],
  ['#f6d365', '#fda085'],
  ['#13547a', '#80d0c7'],
];

const storyIdeas = [
  {
    icon: 'trophy-outline',
    title: 'Personal best recap',
    copy: 'Highlight PR runs with a bold headline, fastest pace stat, and a high-contrast gradient.',
  },
  {
    icon: 'calendar-heart',
    title: 'Weekly mileage collage',
    copy: 'Duplicate the layout and swap background colors to create a weekly run diary in your camera roll.',
  },
  {
    icon: 'camera-iris',
    title: 'Photo overlays',
    copy: 'Export a transparent background and drop the PNG over a full-bleed photo in your favorite editor.',
  },
];

export default function InspirationScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Design inspiration
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Experiment with gradients, fonts, and stats to craft a signature Strava story aesthetic.
      </ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Gradient palettes
        </ThemedText>
        <View style={styles.gradientGrid}>
          {inspirationGradients.map((colors, index) => (
            <View key={index} style={styles.gradientCard}>
              <GradientBackground colors={colors} orientation="diagonal" style={styles.gradientFill} />
              <ThemedText style={styles.gradientLabel}>{colors.join(' → ')}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Story prompts
        </ThemedText>
        {storyIdeas.map((idea) => (
          <View key={idea.title} style={styles.ideaCard}>
            <MaterialCommunityIcons name={idea.icon as any} color="#ffffff" size={22} style={styles.ideaIcon} />
            <View style={styles.ideaCopy}>
              <ThemedText style={styles.ideaTitle}>{idea.title}</ThemedText>
              <ThemedText style={styles.ideaSubtitle}>{idea.copy}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070d',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  title: {
    color: '#ffffff',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: '#ffffff',
  },
  gradientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gradientCard: {
    width: '47%',
    aspectRatio: 1.4,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  gradientFill: {
    flex: 1,
  },
  gradientLabel: {
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 8,
    textAlign: 'center',
  },
  ideaCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
  ideaIcon: {
    marginTop: 4,
  },
  ideaCopy: {
    flex: 1,
    gap: 4,
  },
  ideaTitle: {
    color: '#ffffff',
    fontSize: 16,
  },
  ideaSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 18,
  },
});
