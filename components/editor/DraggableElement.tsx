import { ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';

type DraggableElementProps = {
  id: string;
  position: { x: number; y: number };
  children: ReactNode;
  isSelected: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: (id: string) => void;
  onGestureStart: (id: string) => void;
  onGestureUpdate: (id: string, translationX: number, translationY: number) => void;
  onGestureEnd: (id: string) => void;
};

export function DraggableElement({
  id,
  position,
  children,
  style,
  isSelected,
  onPress,
  onGestureEnd,
  onGestureStart,
  onGestureUpdate,
}: DraggableElementProps) {
  const composedGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .onBegin(() => {
        runOnJS(onGestureStart)(id);
      })
      .onUpdate((event) => {
        runOnJS(onGestureUpdate)(id, event.translationX, event.translationY);
      })
      .onEnd(() => {
        runOnJS(onGestureEnd)(id);
      })
      .onFinalize(() => {
        runOnJS(onGestureEnd)(id);
      });

    const tap = Gesture.Tap().onEnd((_event, success) => {
      if (success) {
        runOnJS(onPress)(id);
      }
    });

    return Gesture.Simultaneous(pan, tap);
  }, [id, onGestureEnd, onGestureStart, onGestureUpdate, onPress]);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[styles.element, style, { transform: [{ translateX: position.x }, { translateY: position.y }] }]}
      >
        <View style={[styles.inner, isSelected && styles.selected]}>{children}</View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  element: {
    position: 'absolute',
  },
  inner: {
    padding: 4,
    borderRadius: 12,
  },
  selected: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});

export default DraggableElement;
