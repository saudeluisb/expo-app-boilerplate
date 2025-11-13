import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CanvasPoint, EditorTextGradient } from '@/types/editor';
import { createGradientSteps, normalizeHex } from '@/utils/color';

type PolylineShapeProps = {
  points: CanvasPoint[];
  strokeWidth: number;
  color: string;
  gradient?: EditorTextGradient | null;
  opacity?: number;
};

type Segment = {
  x: number;
  y: number;
  length: number;
  angle: string;
  color: string;
};

export function PolylineShape({ points, strokeWidth, color, gradient, opacity = 1 }: PolylineShapeProps) {
  const segments = useMemo<Segment[]>(() => {
    if (!points.length) return [];
    const colors = gradient
      ? createGradientSteps(gradient.colors, Math.max(points.length - 1, 1))
      : [normalizeHex(color)];

    return points.slice(1).map((point, index) => {
      const prev = points[index];
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const angle = `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`;
      const colorIndex = gradient ? Math.min(index, colors.length - 1) : 0;
      return {
        x: prev.x,
        y: prev.y,
        length,
        angle,
        color: normalizeHex(colors[colorIndex]),
      };
    });
  }, [color, gradient, points]);

  if (!segments.length) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {segments.map((segment, index) => (
        <View
          key={`${segment.x}-${segment.y}-${index}`}
          style={{
            position: 'absolute',
            left: segment.x,
            top: segment.y - strokeWidth / 2,
            width: segment.length,
            height: strokeWidth,
            backgroundColor: segment.color,
            opacity,
            borderRadius: strokeWidth,
            transform: [{ rotateZ: segment.angle }],
          }}
        />
      ))}
    </View>
  );
}

export default PolylineShape;
