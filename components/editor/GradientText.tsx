import { memo, useMemo } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { EditorTextGradient } from '@/types/editor';
import { createGradientSteps, normalizeHex } from '@/utils/color';

type GradientTextProps = {
  text: string;
  color?: string;
  gradient?: EditorTextGradient | null;
  style?: StyleProp<TextStyle>;
  textProps?: TextProps;
};

export const GradientText = memo(({ text, color = '#ffffff', gradient, style, textProps }: GradientTextProps) => {
  const segments = useMemo(() => {
    if (!gradient) return null;
    const letters = text.split('');
    const steps = createGradientSteps(gradient.colors, Math.max(letters.length, 1));
    return letters.map((char, index) => ({ char, color: steps[index] || steps[steps.length - 1] }));
  }, [gradient, text]);

  if (!gradient || !segments) {
    return (
      <Text {...textProps} style={[{ color: normalizeHex(color) }, style]}>
        {text}
      </Text>
    );
  }

  return (
    <Text {...textProps} style={style}>
      {segments.map((segment, index) => (
        <Text key={`${segment.char}-${index}`} style={{ color: segment.color }}>
          {segment.char}
        </Text>
      ))}
    </Text>
  );
});

GradientText.displayName = 'GradientText';
