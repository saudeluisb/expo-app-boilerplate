import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type PanelContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PanelContainer({ children, style }: PanelContainerProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(12,12,16,0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
});

export default PanelContainer;
