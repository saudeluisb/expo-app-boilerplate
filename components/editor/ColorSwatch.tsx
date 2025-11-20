import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ColorSwatchProps = {
  color: string;
  isSelected?: boolean;
  onPress: (color: string) => void;
  size?: number;
};

export const ColorSwatch = memo(({ color, isSelected, onPress, size = 36 }: ColorSwatchProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      style={[styles.touchable, { width: size, height: size }]}
      accessibilityRole="button"
      accessibilityLabel={`Select color ${color}`}>
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: color,
            borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.35)',
          },
        ]}
      />
    </TouchableOpacity>
  );
});

ColorSwatch.displayName = 'ColorSwatch';

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    borderWidth: 2,
  },
});

export default ColorSwatch;
