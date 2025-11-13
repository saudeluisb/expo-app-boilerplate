import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { GradientBackground } from '@/components/GradientBackground';
import { ThemedText } from '@/components/ThemedText';
import ActionToolbar, { ToolbarAction } from '@/components/editor/ActionToolbar';
import ColorSwatch from '@/components/editor/ColorSwatch';
import DraggableElement from '@/components/editor/DraggableElement';
import ExportBridge from '@/components/editor/ExportBridge';
import PanelContainer from '@/components/editor/PanelContainer';
import PolylineShape from '@/components/editor/PolylineShape';
import StatBlock from '@/components/editor/StatBlock';
import { FONT_CATEGORIES, FONT_OPTIONS, DEFAULT_FONT_ID } from '@/constants/fonts';
import {
  CUSTOM_GRADIENTS_STORAGE_KEY,
  GradientTemplate,
  PRESET_GRADIENTS,
} from '@/constants/gradients';
import { DEFAULT_STATS, STAT_CATALOG, StatDescriptor } from '@/constants/stats';
import { useStrava } from '@/contexts/StravaContext';
import {
  ActiveToolbar,
  CanvasPoint,
  CustomTextElement,
  EditorBackground,
  EditorElement,
  EditorStatKey,
  ElementTextStyle,
  PolylineElement,
  StatElement,
  TextBinding,
} from '@/types/editor';
import { StravaActivity } from '@/types/strava';
import { decodePolyline, normalizeLatLngPoints } from '@/utils/polyline';

const STORY_RATIO = 16 / 9;
const COLOR_SWATCHES = [
  '#ffffff',
  '#f1f2f6',
  '#ff6b6b',
  '#ff9f43',
  '#ffd32a',
  '#1dd1a1',
  '#48dbfb',
  '#54a0ff',
  '#5f27cd',
  '#222f3e',
  '#0f0f0f',
];

const DEFAULT_BACKGROUND: EditorBackground = {
  type: 'gradient',
  colors: PRESET_GRADIENTS[0].colors,
  orientation: PRESET_GRADIENTS[0].orientation,
};

const STAT_POSITIONS: Record<EditorStatKey, { xRatio: number; yRatio: number }> = {
  distance: { xRatio: 0.08, yRatio: 0.22 },
  averagePace: { xRatio: 0.08, yRatio: 0.36 },
  movingTime: { xRatio: 0.55, yRatio: 0.22 },
  elapsedTime: { xRatio: 0.55, yRatio: 0.36 },
  averageSpeed: { xRatio: 0.08, yRatio: 0.5 },
  elevationGain: { xRatio: 0.55, yRatio: 0.5 },
  calories: { xRatio: 0.08, yRatio: 0.64 },
  averageHeartrate: { xRatio: 0.55, yRatio: 0.64 },
  maxHeartrate: { xRatio: 0.08, yRatio: 0.78 },
  kudos: { xRatio: 0.55, yRatio: 0.78 },
  achievements: { xRatio: 0.55, yRatio: 0.9 },
};

const TEXT_STYLE_DEFAULT: ElementTextStyle = {
  fontId: DEFAULT_FONT_ID,
  fontSize: 48,
  color: '#ffffff',
  letterSpacing: 0,
  textAlign: 'left',
  lineHeight: 50,
};

const SMALL_TEXT_STYLE: ElementTextStyle = {
  fontId: DEFAULT_FONT_ID,
  fontSize: 22,
  color: '#f1f2f6',
  letterSpacing: 0,
  textAlign: 'left',
  lineHeight: 26,
};

const DATE_TEXT_STYLE: ElementTextStyle = {
  fontId: DEFAULT_FONT_ID,
  fontSize: 18,
  color: '#f1f2f6',
  letterSpacing: 1,
  textAlign: 'left',
  lineHeight: 24,
};

type DragSnapshot = Record<string, CanvasPoint>;

type GradientDraft = {
  name: string;
  colors: string[];
  orientation: GradientTemplate['orientation'];
};

function buildInitialElements(width: number, height: number): EditorElement[] {
  const headline: CustomTextElement = {
    id: 'text-title',
    type: 'text',
    position: { x: width * 0.08, y: height * 0.08 },
    style: { ...TEXT_STYLE_DEFAULT, fontSize: 60, lineHeight: 64 },
    text: 'Morning Run',
    binding: 'name',
  };

  const dateText: CustomTextElement = {
    id: 'text-date',
    type: 'text',
    position: { x: width * 0.08, y: height * 0.16 },
    style: DATE_TEXT_STYLE,
    text: 'Jan 1, 2025',
    binding: 'date',
  };

  const locationText: CustomTextElement = {
    id: 'text-location',
    type: 'text',
    position: { x: width * 0.08, y: height * 0.72 },
    style: { ...SMALL_TEXT_STYLE, fontSize: 20 },
    text: 'Unknown location',
    binding: 'location',
  };

  const defaultStats = DEFAULT_STATS.map<StatElement>((key) => ({
    id: `stat-${key}`,
    type: 'stat',
    statKey: key,
    position: {
      x: (STAT_POSITIONS[key]?.xRatio ?? 0.08) * width,
      y: (STAT_POSITIONS[key]?.yRatio ?? 0.5) * height,
    },
    style: SMALL_TEXT_STYLE,
  }));

  const polyline: PolylineElement = {
    id: 'polyline-route',
    type: 'polyline',
    position: { x: 0, y: 0 },
    normalizedPoints: [],
    scale: 1,
    stroke: {
      color: '#ffffff',
      gradient: null,
      strokeWidth: 6,
      opacity: 0.9,
    },
  };

  return [polyline, headline, dateText, locationText, ...defaultStats];
}

function getStatDescriptor(key: EditorStatKey): StatDescriptor | undefined {
  return STAT_CATALOG.find((descriptor) => descriptor.key === key);
}

function computeStatValue(activity: StravaActivity | null, statKey: EditorStatKey): string {
  if (!activity) return '—';
  const descriptor = getStatDescriptor(statKey);
  if (!descriptor) return '—';
  return descriptor.formatter(activity);
}

function updateBindingText(
  text: CustomTextElement,
  activity: StravaActivity | null,
  binding: TextBinding | undefined,
): string {
  if (!activity || !binding) return text.text;
  switch (binding) {
    case 'name':
      return activity.name;
    case 'date':
      return new Date(activity.start_date_local).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'location':
      return [activity.location_city, activity.location_state, activity.location_country]
        .filter(Boolean)
        .map((segment) => segment?.trim())
        .filter(Boolean)
        .join(', ') || 'Unknown location';
    default:
      return text.text;
  }
}

export default function EditorScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const previewWidth = Math.min(windowWidth - 32, 360);
  const previewHeight = previewWidth * STORY_RATIO;

  const [background, setBackground] = useState<EditorBackground>(DEFAULT_BACKGROUND);
  const [elements, setElements] = useState<EditorElement[]>(() => buildInitialElements(previewWidth, previewHeight));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeToolbar, setActiveToolbar] = useState<ActiveToolbar>('stats');
  const [customGradients, setCustomGradients] = useState<GradientTemplate[]>([]);
  const [isMultiSelectEnabled, setIsMultiSelectEnabled] = useState(false);
  const [gradientDraft, setGradientDraft] = useState<GradientDraft>({
    name: '',
    colors: ['#ff7a18', '#af002d'],
    orientation: 'diagonal',
  });
  const [exportRequestKey, setExportRequestKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const dragSnapshot = useRef<DragSnapshot>({});

  const { activities, selectedActivity, selectActivity, signIn, athlete, isLoading, refetchActivities } = useStrava();

  useEffect(() => {
    AsyncStorage.getItem(CUSTOM_GRADIENTS_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setCustomGradients(JSON.parse(stored));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedActivity) return;
    const polylinePoints = normalizeLatLngPoints(
      decodePolyline(selectedActivity.map?.summary_polyline),
      {
        width: previewWidth,
        height: previewHeight,
        paddingRatio: 0.1,
      },
    );

    setElements((prev) =>
      prev.map((element) => {
        if (element.type === 'polyline') {
          return {
            ...element,
            normalizedPoints: polylinePoints,
          };
        }
        if (element.type === 'text') {
          return {
            ...element,
            text: updateBindingText(element, selectedActivity, element.binding),
          };
        }
        return element;
      }),
    );
  }, [previewHeight, previewWidth, selectedActivity]);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      if (isMultiSelectEnabled) {
        if (current.includes(id)) {
          return current.filter((item) => item !== id);
        }
        return [...current, id];
      }
      return [id];
    });
  };

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => elements.some((element) => element.id === id)));
  }, [elements]);

  useEffect(() => {
    if (!isMultiSelectEnabled && selectedIds.length > 1) {
      setSelectedIds((current) => (current.length ? [current[current.length - 1]] : current));
    }
  }, [isMultiSelectEnabled, selectedIds]);

  const prepareDragSnapshot = (id: string) => {
    setSelectedIds((current) => {
      const next = current.includes(id) ? current : [id];
      const ids = new Set(isMultiSelectEnabled ? next : [id]);
      dragSnapshot.current = {};
      elements.forEach((element) => {
        if (ids.has(element.id)) {
          dragSnapshot.current[element.id] = { ...element.position };
        }
      });
      return next;
    });
  };

  const handleDragUpdate = (id: string, translationX: number, translationY: number) => {
    const idsToMove = selectedIds.includes(id) ? selectedIds : [id];
    setElements((prev) =>
      prev.map((element) => {
        if (!idsToMove.includes(element.id)) return element;
        const start = dragSnapshot.current[element.id] ?? element.position;
        return {
          ...element,
          position: {
            x: start.x + translationX,
            y: start.y + translationY,
          },
        };
      }),
    );
  };

  const handleDragEnd = () => {
    dragSnapshot.current = {};
  };

  const ensureStatElement = (statKey: EditorStatKey) => {
    const id = `stat-${statKey}`;
    setElements((prev) => {
      if (prev.some((element) => element.id === id)) {
        return prev.filter((element) => element.id !== id);
      }
      const positionInfo = STAT_POSITIONS[statKey] ?? { xRatio: 0.08, yRatio: 0.5 };
      const newElement: StatElement = {
        id,
        type: 'stat',
        statKey,
        position: {
          x: positionInfo.xRatio * previewWidth,
          y: positionInfo.yRatio * previewHeight,
        },
        style: SMALL_TEXT_STYLE,
      };
      return [...prev, newElement];
    });
  };

  const updateSelectedTextStyle = (updater: (style: ElementTextStyle) => ElementTextStyle) => {
    setElements((prev) =>
      prev.map((element) => {
        if ((element.type === 'stat' || element.type === 'text') && selectedIds.includes(element.id)) {
          return {
            ...element,
            style: updater(element.style),
          };
        }
        return element;
      }),
    );
  };

  const updatePolyline = (updater: (polyline: PolylineElement) => PolylineElement) => {
    setElements((prev) => prev.map((element) => (element.type === 'polyline' ? updater(element) : element)));
  };

  const handleApplyTextColor = (color: string) => {
    updateSelectedTextStyle((style) => ({
      ...style,
      color,
      gradient: null,
    }));
  };

  const handleApplyTextGradient = (template: GradientTemplate) => {
    updateSelectedTextStyle((style) => ({
      ...style,
      gradient: {
        colors: template.colors,
        orientation: template.orientation,
      },
    }));
  };

  const handleApplyFont = (fontId: string) => {
    updateSelectedTextStyle((style) => ({
      ...style,
      fontId,
    }));
  };

  const handleAddCustomGradient = async () => {
    if (!gradientDraft.name.trim()) {
      Alert.alert('Gradient needs a name');
      return;
    }
    const custom: GradientTemplate = {
      id: `custom-${Date.now()}`,
      name: gradientDraft.name.trim(),
      colors: gradientDraft.colors,
      orientation: gradientDraft.orientation,
    };
    const updated = [...customGradients, custom];
    setCustomGradients(updated);
    setGradientDraft({ name: '', colors: ['#ff7a18', '#af002d'], orientation: 'diagonal' });
    await AsyncStorage.setItem(CUSTOM_GRADIENTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const exportFonts = useMemo(() => {
    const fontIds = new Set<string>();
    elements.forEach((element) => {
      if (element.type === 'stat' || element.type === 'text') {
        fontIds.add(element.style.fontId);
      }
    });
    return FONT_OPTIONS.filter((font) => fontIds.has(font.id)).map((font) => ({ id: font.id, uri: font.remoteUri }));
  }, [elements]);

  const exportElements = useMemo(() =>
    elements
      .filter((element) => !(element.type === 'polyline' && element.hidden))
      .map((element) => {
        if (element.type === 'polyline') {
          const offsetPoints = element.normalizedPoints.map((point) => ({
            x: point.x + element.position.x,
            y: point.y + element.position.y,
          }));
          return {
            type: 'polyline' as const,
            points: offsetPoints,
            strokeWidth: element.stroke.strokeWidth,
            color: element.stroke.color,
            gradient: element.stroke.gradient,
            opacity: element.stroke.opacity,
          };
        }
      if (element.type === 'stat') {
        return {
          type: 'text' as const,
          value: computeStatValue(selectedActivity ?? null, element.statKey),
          label: getStatDescriptor(element.statKey)?.label ?? '',
          fontId: element.style.fontId,
          fontSize: element.style.fontSize,
          color: element.style.color,
          letterSpacing: element.style.letterSpacing,
          lineHeight: element.style.lineHeight,
          textAlign: element.style.textAlign,
          gradient: element.style.gradient,
          position: element.position,
        };
      }
      return {
        type: 'text' as const,
        value: element.text,
        label: undefined,
        fontId: element.style.fontId,
        fontSize: element.style.fontSize,
        color: element.style.color,
        letterSpacing: element.style.letterSpacing,
        lineHeight: element.style.lineHeight,
        textAlign: element.style.textAlign,
        gradient: element.style.gradient,
        position: element.position,
      };
    }),
  [elements, selectedActivity]);

  const handleExport = () => {
    if (!selectedActivity) {
      Alert.alert('Select an activity first', 'Choose a Strava run to export.');
      return;
    }
    setIsExporting(true);
    setExportRequestKey(`${Date.now()}`);
  };

  const handleExported = async ({ base64, requestKey }: { base64: string; requestKey: string }) => {
    if (requestKey !== exportRequestKey) return;
    try {
      const cleaned = base64.replace('data:image/png;base64,', '');
      const fileUri = `${FileSystem.documentDirectory}run-card-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, cleaned, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Share.share({ url: fileUri });
    } catch (error) {
      Alert.alert('Export failed', 'We were unable to save the image.');
    } finally {
      setIsExporting(false);
      setExportRequestKey(null);
    }
  };

  const toolbarActions: ToolbarAction[] = [
    {
      id: 'stats',
      icon: 'format-list-bulleted',
      label: 'Stats',
      onPress: () => setActiveToolbar((prev) => (prev === 'stats' ? 'none' : 'stats')),
      isActive: activeToolbar === 'stats',
    },
    {
      id: 'fonts',
      icon: 'format-font',
      label: 'Fonts',
      onPress: () => setActiveToolbar((prev) => (prev === 'fonts' ? 'none' : 'fonts')),
      isActive: activeToolbar === 'fonts',
    },
    {
      id: 'colors',
      icon: 'palette-outline',
      label: 'Colors',
      onPress: () => setActiveToolbar((prev) => (prev === 'colors' ? 'none' : 'colors')),
      isActive: activeToolbar === 'colors',
    },
    {
      id: 'background',
      icon: 'image-outline',
      label: 'Background',
      onPress: () => setActiveToolbar((prev) => (prev === 'background' ? 'none' : 'background')),
      isActive: activeToolbar === 'background',
    },
    {
      id: 'polyline',
      icon: 'routes',
      label: 'Route',
      onPress: () => setActiveToolbar((prev) => (prev === 'polyline' ? 'none' : 'polyline')),
      isActive: activeToolbar === 'polyline',
    },
    {
      id: 'templates',
      icon: 'gradient-vertical',
      label: 'Gradients',
      onPress: () => setActiveToolbar((prev) => (prev === 'templates' ? 'none' : 'templates')),
      isActive: activeToolbar === 'templates',
    },
    {
      id: 'multi-select',
      icon: 'gesture-tap-hold',
      label: 'Select',
      onPress: () => setIsMultiSelectEnabled((prev) => !prev),
      isActive: isMultiSelectEnabled,
    },
    {
      id: 'export',
      icon: 'share-variant',
      label: 'Export',
      onPress: handleExport,
    },
  ];

  const renderElement = (element: EditorElement) => {
    if (element.type === 'polyline') {
      if (element.hidden) {
        return null;
      }
      const offsetPoints = element.normalizedPoints.map((point) => ({
        x: point.x,
        y: point.y,
      }));
      return (
        <DraggableElement
          key={element.id}
          id={element.id}
          position={element.position}
          isSelected={selectedIds.includes(element.id)}
          onPress={toggleSelect}
          onGestureStart={prepareDragSnapshot}
          onGestureUpdate={handleDragUpdate}
          onGestureEnd={handleDragEnd}>
          <View style={{ width: previewWidth, height: previewHeight }}>
            <PolylineShape
              points={offsetPoints}
              strokeWidth={element.stroke.strokeWidth}
              color={element.stroke.color}
              gradient={element.stroke.gradient}
              opacity={element.stroke.opacity}
            />
          </View>
        </DraggableElement>
      );
    }

    if (element.type === 'stat') {
      const descriptor = getStatDescriptor(element.statKey);
      const value = computeStatValue(selectedActivity ?? null, element.statKey);
      return (
        <DraggableElement
          key={element.id}
          id={element.id}
          position={element.position}
          isSelected={selectedIds.includes(element.id)}
          onPress={toggleSelect}
          onGestureStart={prepareDragSnapshot}
          onGestureUpdate={handleDragUpdate}
          onGestureEnd={handleDragEnd}>
          <StatBlock
            label={descriptor?.label ?? element.statKey}
            value={value}
            textStyle={element.style}
          />
        </DraggableElement>
      );
    }

    return (
      <DraggableElement
        key={element.id}
        id={element.id}
        position={element.position}
        isSelected={selectedIds.includes(element.id)}
        onPress={toggleSelect}
        onGestureStart={prepareDragSnapshot}
        onGestureUpdate={handleDragUpdate}
        onGestureEnd={handleDragEnd}>
        <ThemedText
          style={{
            fontFamily: `font-${element.style.fontId}`,
            fontSize: element.style.fontSize,
            color: element.style.color,
            letterSpacing: element.style.letterSpacing,
            lineHeight: element.style.lineHeight,
          }}>
          {element.text}
        </ThemedText>
      </DraggableElement>
    );
  };

  const renderStatsPanel = () => (
    <PanelContainer>
      <ThemedText type="subtitle">Stats</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
        {STAT_CATALOG.map((stat) => {
          const isActive = elements.some((element) => element.id === `stat-${stat.key}`);
          return (
            <TouchableOpacity
              key={stat.key}
              style={[styles.statChip, isActive && styles.statChipActive]}
              onPress={() => ensureStatElement(stat.key)}>
              <MaterialCommunityIcons
                name={stat.icon}
                size={18}
                color={isActive ? '#ffffff' : 'rgba(255,255,255,0.8)'}
              />
              <ThemedText style={[styles.statLabel, isActive && styles.statLabelActive]}>{stat.label}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ThemedText style={styles.panelHint}>Tap an element to focus it, enable Select to move multiple items.</ThemedText>
    </PanelContainer>
  );

  const renderFontsPanel = () => (
    <PanelContainer>
      <ThemedText type="subtitle">Fonts</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontCategoryRow}>
        {FONT_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.fontColumn}>
            <ThemedText style={styles.fontCategoryLabel}>{category.label}</ThemedText>
            {FONT_OPTIONS.filter((font) => font.category === category.id).map((font) => (
              <TouchableOpacity key={font.id} style={styles.fontOption} onPress={() => handleApplyFont(font.id)}>
                <ThemedText style={{ fontFamily: `font-${font.id}`, fontSize: 20, color: '#ffffff' }}>
                  {font.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </PanelContainer>
  );

  const renderColorsPanel = () => (
    <PanelContainer>
      <ThemedText type="subtitle">Text colors</ThemedText>
      <View style={styles.swatchRow}>
        {COLOR_SWATCHES.map((color) => (
          <ColorSwatch key={color} color={color} onPress={handleApplyTextColor} />
        ))}
      </View>
      <ThemedText style={styles.panelHint}>Apply a gradient to selected text elements.</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradientRow}>
        {PRESET_GRADIENTS.map((gradient) => (
          <TouchableOpacity
            key={gradient.id}
            style={styles.gradientPreview}
            onPress={() => handleApplyTextGradient(gradient)}>
            <GradientBackground colors={gradient.colors} orientation={gradient.orientation} style={styles.gradientPreviewFill} />
            <ThemedText style={styles.gradientLabel}>{gradient.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </PanelContainer>
  );

  const renderBackgroundPanel = () => (
    <PanelContainer>
      <ThemedText type="subtitle">Background</ThemedText>
      <View style={styles.backgroundRow}>
        <TouchableOpacity
          style={[styles.backgroundOption, background.type === 'transparent' && styles.backgroundOptionActive]}
          onPress={() => setBackground({ type: 'transparent' })}>
          <ThemedText style={styles.backgroundLabel}>Transparent</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backgroundOption, background.type === 'solid' && styles.backgroundOptionActive]}
          onPress={() => setBackground({ type: 'solid', color: '#0f172a' })}>
          <ThemedText style={styles.backgroundLabel}>Deep blue</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradientRow}>
        {[...PRESET_GRADIENTS, ...customGradients].map((gradient) => (
          <TouchableOpacity
            key={gradient.id}
            style={[styles.gradientPreview, background.type === 'gradient' && background.colors.join(',') === gradient.colors.join(',') && styles.backgroundOptionActive]}
            onPress={() =>
              setBackground({
                type: 'gradient',
                colors: gradient.colors,
                orientation: gradient.orientation,
              })
            }>
            <GradientBackground colors={gradient.colors} orientation={gradient.orientation} style={styles.gradientPreviewFill} />
            <ThemedText style={styles.gradientLabel}>{gradient.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.gradientBuilder}>
        <ThemedText style={styles.gradientBuilderLabel}>Create custom gradient</ThemedText>
        <TextInput
          placeholder="Name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.gradientInput}
          value={gradientDraft.name}
          onChangeText={(text) => setGradientDraft((prev) => ({ ...prev, name: text }))}
        />
        <View style={styles.gradientBuilderRow}>
          {gradientDraft.colors.map((color, index) => (
            <TextInput
              key={index}
              style={styles.gradientInput}
              value={color}
              onChangeText={(text) =>
                setGradientDraft((prev) => {
                  const colors = [...prev.colors];
                  colors[index] = text;
                  return { ...prev, colors };
                })
              }
            />
          ))}
        </View>
        <View style={styles.backgroundRow}>
          {['vertical', 'horizontal', 'diagonal'].map((orientation) => (
            <TouchableOpacity
              key={orientation}
              style={[
                styles.backgroundOption,
                gradientDraft.orientation === orientation && styles.backgroundOptionActive,
              ]}
              onPress={() =>
                setGradientDraft((prev) => ({ ...prev, orientation: orientation as GradientTemplate['orientation'] }))
              }>
              <ThemedText style={styles.backgroundLabel}>{orientation}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveGradientButton} onPress={handleAddCustomGradient}>
          <ThemedText style={styles.saveGradientLabel}>Save gradient</ThemedText>
        </TouchableOpacity>
      </View>
    </PanelContainer>
  );

  const renderPolylinePanel = () => {
    const polylineElement = elements.find((element) => element.type === 'polyline') as PolylineElement | undefined;
    if (!polylineElement) return null;
    return (
      <PanelContainer>
        <ThemedText type="subtitle">Route styling</ThemedText>
        <View style={styles.swatchRow}>
          {COLOR_SWATCHES.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              onPress={() =>
                updatePolyline((polyline) => ({
                  ...polyline,
                  stroke: { ...polyline.stroke, color, gradient: null },
                }))
              }
            />
          ))}
        </View>
        <View style={styles.polylineControls}>
          <TouchableOpacity
            style={styles.polylineButton}
            onPress={() =>
              updatePolyline((polyline) => ({
                ...polyline,
                stroke: { ...polyline.stroke, strokeWidth: Math.max(2, polyline.stroke.strokeWidth - 1) },
              }))
            }>
            <MaterialCommunityIcons name="minus" color="#ffffff" size={20} />
          </TouchableOpacity>
          <ThemedText style={styles.polylineWidthLabel}>{polylineElement.stroke.strokeWidth.toFixed(0)} px</ThemedText>
          <TouchableOpacity
            style={styles.polylineButton}
            onPress={() =>
              updatePolyline((polyline) => ({
                ...polyline,
                stroke: { ...polyline.stroke, strokeWidth: Math.min(24, polyline.stroke.strokeWidth + 1) },
              }))
            }>
            <MaterialCommunityIcons name="plus" color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.polylineToggle}
          onPress={() =>
            updatePolyline((polyline) => ({
              ...polyline,
              hidden: !polyline.hidden,
            }))
          }>
          <MaterialCommunityIcons
            name={polylineElement.hidden ? 'eye-off-outline' : 'eye-outline'}
            color="#ffffff"
            size={20}
          />
          <ThemedText style={styles.polylineToggleLabel}>
            {polylineElement.hidden ? 'Show route' : 'Hide route'}
          </ThemedText>
        </TouchableOpacity>
      </PanelContainer>
    );
  };

  const renderTemplatesPanel = () => (
    <PanelContainer>
      <ThemedText type="subtitle">Saved gradients</ThemedText>
      {customGradients.length === 0 ? (
        <ThemedText style={styles.panelHint}>Saved gradients will appear here.</ThemedText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradientRow}>
          {customGradients.map((gradient) => (
            <TouchableOpacity
              key={gradient.id}
              style={styles.gradientPreview}
              onPress={() =>
                setBackground({ type: 'gradient', colors: gradient.colors, orientation: gradient.orientation })
              }>
              <GradientBackground colors={gradient.colors} orientation={gradient.orientation} style={styles.gradientPreviewFill} />
              <ThemedText style={styles.gradientLabel}>{gradient.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </PanelContainer>
  );

  const renderActivePanel = () => {
    switch (activeToolbar) {
      case 'stats':
        return renderStatsPanel();
      case 'fonts':
        return renderFontsPanel();
      case 'colors':
        return renderColorsPanel();
      case 'background':
        return renderBackgroundPanel();
      case 'polyline':
        return renderPolylinePanel();
      case 'templates':
        return renderTemplatesPanel();
      default:
        return null;
    }
  };

  const renderActivityModal = () => (
    <Modal visible={activityModalVisible} transparent animationType="slide" onRequestClose={() => setActivityModalVisible(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Your activities</ThemedText>
            <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
              <MaterialCommunityIcons name="close" color="#ffffff" size={26} />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <ScrollView contentContainerStyle={styles.activityList}>
              {activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityItem}
                  onPress={() => {
                    selectActivity(activity);
                    setActivityModalVisible(false);
                  }}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="run" color="#ffffff" size={20} />
                  </View>
                  <View style={styles.activityCopy}>
                    <ThemedText style={styles.activityTitle}>{activity.name}</ThemedText>
                    <ThemedText style={styles.activitySubtitle}>
                      {computeStatValue(activity, 'distance')} •{' '}
                      {new Date(activity.start_date_local).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" color="#888" size={22} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={() => refetchActivities(true)}>
            <MaterialCommunityIcons name="refresh" size={20} color="#ffffff" />
            <ThemedText style={styles.refreshLabel}>Refresh from Strava</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.activityButton} onPress={() => setActivityModalVisible(true)}>
            <MaterialCommunityIcons name="run" size={20} color="#ffffff" />
            <ThemedText style={styles.activityButtonLabel}>
              {selectedActivity ? selectedActivity.name : 'Select a run'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountButton} onPress={athlete ? undefined : signIn}>
            <MaterialCommunityIcons name="account-circle" color="#ffffff" size={20} />
            <ThemedText style={styles.accountLabel}>
              {athlete ? `${athlete.firstname}` : 'Connect Strava'}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          <View style={styles.previewWrapper}>
            <View style={[styles.previewCard, { width: previewWidth, height: previewHeight }]}
              collapsable={false}>
              {background.type === 'gradient' && (
                <GradientBackground
                  colors={background.colors}
                  orientation={background.orientation}
                  style={styles.previewGradient}
                />
              )}
              {background.type === 'solid' && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: background.color }]} />
              )}
              {background.type === 'transparent' && <View style={styles.transparentPattern} />}
              <View style={styles.elementsLayer}>{elements.map(renderElement)}</View>
            </View>
          </View>
          <View style={styles.helperRow}>
            <MaterialCommunityIcons name="gesture-swipe-horizontal" color="#ffffff" size={18} />
            <ThemedText style={styles.helperText}>Drag stats, route, and text to reposition.</ThemedText>
          </View>
        </ScrollView>
        {renderActivityModal()}
        {activeToolbar !== 'none' && <View style={styles.panelWrapper}>{renderActivePanel()}</View>}
        <ActionToolbar actions={toolbarActions} />
      </View>
      <ExportBridge
        data={{
          width: Math.round(previewWidth),
          height: Math.round(previewHeight),
          background,
          elements: exportElements,
          fonts: exportFonts,
        }}
        requestKey={exportRequestKey}
        onExported={handleExported}
      />
      {isExporting && (
        <View style={styles.exportOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <ThemedText style={styles.exportLabel}>Creating PNG…</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07070d',
  },
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  activityButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  activityButtonLabel: {
    color: '#ffffff',
    fontSize: 15,
  },
  accountButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  accountLabel: {
    color: '#ffffff',
  },
  scrollArea: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  previewWrapper: {
    marginTop: 12,
    borderRadius: 28,
    overflow: 'hidden',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  previewCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  previewGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  transparentPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.35,
  },
  elementsLayer: {
    flex: 1,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  helperText: {
    color: 'rgba(255,255,255,0.7)',
  },
  panelWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  statsRow: {
    gap: 12,
    paddingVertical: 12,
  },
  statChip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  statChipActive: {
    backgroundColor: '#FC4C02',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  statLabelActive: {
    color: '#ffffff',
  },
  panelHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  fontCategoryRow: {
    gap: 20,
  },
  fontColumn: {
    gap: 8,
    paddingRight: 12,
  },
  fontCategoryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  fontOption: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  gradientRow: {
    gap: 12,
    paddingVertical: 12,
  },
  gradientPreview: {
    width: 96,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gradientPreviewFill: {
    width: '100%',
    height: 72,
  },
  gradientLabel: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 6,
  },
  backgroundRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backgroundOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backgroundOptionActive: {
    backgroundColor: '#FC4C02',
  },
  backgroundLabel: {
    color: '#ffffff',
    fontSize: 13,
  },
  gradientBuilder: {
    gap: 12,
    marginTop: 12,
  },
  gradientBuilderLabel: {
    color: '#ffffff',
  },
  gradientBuilderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gradientInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
  },
  saveGradientButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  saveGradientLabel: {
    color: '#ffffff',
  },
  polylineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  polylineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  polylineWidthLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  polylineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  polylineToggleLabel: {
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0b0d12',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    borderRadius: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FC4C02',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    color: '#ffffff',
    fontSize: 16,
  },
  activitySubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  refreshButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  refreshLabel: {
    color: '#ffffff',
  },
  exportOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  exportLabel: {
    color: '#ffffff',
  },
});
