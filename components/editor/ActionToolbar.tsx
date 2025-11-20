import { memo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ActiveToolbar } from '@/types/editor';

export type ToolbarAction = {
  id: ActiveToolbar | 'export' | 'multi-select' | 'reset';
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: (id: ToolbarAction['id']) => void;
  isActive?: boolean;
  disabled?: boolean;
};

type ActionToolbarProps = {
  actions: ToolbarAction[];
};

export const ActionToolbar = memo(({ actions }: ActionToolbarProps) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.action, action.isActive && styles.active, action.disabled && styles.disabled]}
            onPress={() => action.onPress(action.id)}
            disabled={action.disabled}>
            <MaterialCommunityIcons
              name={action.icon}
              size={24}
              color={action.disabled ? 'rgba(255,255,255,0.35)' : action.isActive ? '#ffffff' : 'rgba(255,255,255,0.9)'}
            />
            <ThemedText style={[styles.label, action.isActive && styles.labelActive]}>{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

ActionToolbar.displayName = 'ActionToolbar';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: 'rgba(12,12,16,0.95)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  action: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  active: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  labelActive: {
    color: '#ffffff',
  },
});

export default ActionToolbar;
