import { ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { GradientOrientation } from '@/constants/gradients';
import { createGradientSteps, normalizeHex } from '@/utils/color';

type GradientBackgroundProps = {
  colors: string[];
  orientation?: GradientOrientation;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
};

const DEFAULT_STEPS = 80;

export function GradientBackground({
  colors,
  orientation = 'vertical',
  children,
  style,
  intensity = 1,
}: GradientBackgroundProps) {
  const colorStops = useMemo(() => {
    const sanitized = colors.map((color) => normalizeHex(color));
    return createGradientSteps(sanitized, DEFAULT_STEPS);
  }, [colors]);

  const directionStyles = useMemo(() => {
    if (orientation === 'horizontal') {
      return styles.horizontal;
    }
    if (orientation === 'diagonal') {
      return styles.diagonal;
    }
    return styles.vertical;
  }, [orientation]);

  const segmentStyle = useMemo(() => {
    if (orientation === 'horizontal') {
      return styles.horizontalSegment;
    }
    return styles.verticalSegment;
  }, [orientation]);

  return (
    <View style={[style, styles.wrapper]}>
      <View style={[StyleSheet.absoluteFill, directionStyles, { opacity: intensity }]}> 
        {colorStops.map((color, index) => (
          <View key={`${color}-${index}`} style={[segmentStyle, { backgroundColor: color }]} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
  },
  diagonal: {
    flexDirection: 'column',
    transform: [{ rotate: '45deg' }, { scale: 1.6 }],
    top: '-50%',
    bottom: '-50%',
    left: '-50%',
    right: '-50%',
    position: 'absolute',
  },
  verticalSegment: {
    flex: 1,
  },
  horizontalSegment: {
    flex: 1,
  },
});

export default GradientBackground;
