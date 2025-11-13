import { memo } from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { ElementTextStyle } from '@/types/editor';
import { GradientText } from './GradientText';

type StatBlockProps = {
  label: string;
  value: string;
  style?: StyleProp<ViewStyle>;
  textStyle: ElementTextStyle;
};

export const StatBlock = memo(({ label, value, style, textStyle }: StatBlockProps) => {
  const { fontId, fontSize, color, gradient, letterSpacing, textAlign, lineHeight } = textStyle;

  const combinedTextStyle: StyleProp<TextStyle> = [
    {
      fontFamily: `font-${fontId}`,
      fontSize,
      letterSpacing,
      textAlign,
      lineHeight,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <GradientText text={value} gradient={gradient} color={color} style={combinedTextStyle} />
      <GradientText
        text={label.toUpperCase()}
        color={color}
        gradient={gradient}
        style={[styles.label, { fontFamily: `font-${fontId}`, letterSpacing: (letterSpacing ?? 0) + 1 }]}
      />
    </View>
  );
});

StatBlock.displayName = 'StatBlock';

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.8,
  },
});

export default StatBlock;
