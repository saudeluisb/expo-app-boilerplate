import { GradientOrientation } from '@/constants/gradients';

export type CanvasPoint = {
  x: number;
  y: number;
};

export type EditorBackground =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; colors: string[]; orientation: GradientOrientation }
  | { type: 'transparent' };

export type EditorStatKey =
  | 'distance'
  | 'movingTime'
  | 'elapsedTime'
  | 'averagePace'
  | 'averageSpeed'
  | 'elevationGain'
  | 'calories'
  | 'averageHeartrate'
  | 'maxHeartrate'
  | 'kudos'
  | 'achievements';

export type EditorTextGradient = {
  colors: string[];
  orientation: GradientOrientation;
};

export type ElementTextStyle = {
  fontId: string;
  fontSize: number;
  color: string;
  gradient?: EditorTextGradient | null;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
};

export type ElementShadow = {
  color: string;
  radius: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
};

export type BaseEditorElement = {
  id: string;
  position: CanvasPoint;
  locked?: boolean;
  shadow?: ElementShadow | null;
  multiSelectGroup?: string | null;
};

export type StatElement = BaseEditorElement & {
  type: 'stat';
  statKey: EditorStatKey;
  style: ElementTextStyle;
  labelOverride?: string;
};

export type TextBinding = 'name' | 'date' | 'location' | 'custom';

export type CustomTextElement = BaseEditorElement & {
  type: 'text';
  text: string;
  style: ElementTextStyle;
  binding?: TextBinding;
};

export type PolylineStyle = {
  color: string;
  gradient?: EditorTextGradient | null;
  strokeWidth: number;
  opacity: number;
};

export type PolylineElement = BaseEditorElement & {
  type: 'polyline';
  normalizedPoints: CanvasPoint[];
  scale: number;
  stroke: PolylineStyle;
  hidden?: boolean;
};

export type EditorElement = StatElement | CustomTextElement | PolylineElement;

export type ActiveToolbar =
  | 'stats'
  | 'fonts'
  | 'background'
  | 'colors'
  | 'polyline'
  | 'templates'
  | 'none';

export type SavedTemplate = {
  id: string;
  name: string;
  background: EditorBackground;
  elements: EditorElement[];
};
