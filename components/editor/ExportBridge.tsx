import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

import { EditorBackground, EditorTextGradient } from '@/types/editor';

type ExportElement =
  | {
      type: 'text';
      position: { x: number; y: number };
      value: string;
      label?: string;
      fontId: string;
      fontSize: number;
      color: string;
      letterSpacing?: number;
      lineHeight?: number;
      textAlign?: 'left' | 'center' | 'right';
      gradient?: EditorTextGradient | null;
    }
  | {
      type: 'polyline';
      points: { x: number; y: number }[];
      strokeWidth: number;
      color: string;
      gradient?: EditorTextGradient | null;
      opacity: number;
    };

type ExportData = {
  width: number;
  height: number;
  background: EditorBackground;
  elements: ExportElement[];
  fonts: { id: string; uri: string }[];
};

type ExportBridgeProps = {
  data: ExportData;
  requestKey: string | null;
  onExported: (result: { base64: string; requestKey: string }) => void;
};

const buildFontsCss = (fonts: ExportData['fonts']) =>
  fonts
    .map((font) => `@font-face { font-family: 'font-${font.id}'; src: url('${font.uri}') format('truetype'); font-display: swap; }`)
    .join('\n');

const buildHtml = (data: ExportData) => {
  const fontsCss = buildFontsCss(data.fonts);
  const initialScript = String.raw`
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let currentData = ${JSON.stringify(data)};

    function applyBackground() {
      const { background, width, height } = currentData;
      if (background.type === 'transparent') {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      if (background.type === 'solid') {
        ctx.fillStyle = background.color;
        ctx.fillRect(0, 0, width, height);
        return;
      }

      const gradient = background.colors;
      let grad;
      if (background.orientation === 'horizontal') {
        grad = ctx.createLinearGradient(0, 0, width, 0);
      } else if (background.orientation === 'diagonal') {
        grad = ctx.createLinearGradient(0, 0, width, height);
      } else {
        grad = ctx.createLinearGradient(0, 0, 0, height);
      }
      const step = 1 / Math.max(gradient.length - 1, 1);
      gradient.forEach((color, index) => {
        grad.addColorStop(step * index, color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    function drawTextElement(element) {
      const { value, label, fontId, fontSize, color, gradient, letterSpacing, lineHeight, textAlign, position } = element;
      ctx.save();
      ctx.font = \`\${fontSize}px font-\${fontId}\`;
      ctx.textBaseline = 'top';
      ctx.textAlign = textAlign || 'left';
      const offsetX = position.x;
      const offsetY = position.y;

      const lines = [value];
      if (label) {
        lines.push(label.toUpperCase());
      }

      lines.forEach((text, index) => {
        let fillStyle = color;
        if (gradient) {
          let grad;
          if (gradient.orientation === 'horizontal') {
            grad = ctx.createLinearGradient(offsetX, 0, offsetX + ctx.measureText(text).width, 0);
          } else if (gradient.orientation === 'diagonal') {
            grad = ctx.createLinearGradient(offsetX, offsetY, offsetX + ctx.measureText(text).width, offsetY + fontSize);
          } else {
            grad = ctx.createLinearGradient(0, offsetY, 0, offsetY + fontSize);
          }
          const step = 1 / Math.max(gradient.colors.length - 1, 1);
          gradient.colors.forEach((colorStop, stopIndex) => {
            grad.addColorStop(step * stopIndex, colorStop);
          });
          fillStyle = grad;
        }

        ctx.fillStyle = fillStyle;
        if (letterSpacing) {
          const characters = text.split('');
          let cursor = offsetX;
          const spacing = letterSpacing;
          characters.forEach((char) => {
            ctx.fillText(char, cursor, offsetY + index * (lineHeight || fontSize * 1.1));
            cursor += ctx.measureText(char).width + spacing;
          });
        } else {
          ctx.fillText(text, offsetX, offsetY + index * (lineHeight || fontSize * 1.1));
        }
      });

      ctx.restore();
    }

    function drawPolyline(element) {
      const { points, strokeWidth, color, gradient, opacity } = element;
      if (!points.length) return;
      ctx.save();
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      if (gradient) {
        const first = points[0];
        const last = points[points.length - 1];
        let grad;
        if (gradient.orientation === 'horizontal') {
          grad = ctx.createLinearGradient(first.x, first.y, last.x, first.y);
        } else if (gradient.orientation === 'diagonal') {
          grad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
        } else {
          grad = ctx.createLinearGradient(first.x, first.y, first.x, last.y);
        }
        const step = 1 / Math.max(gradient.colors.length - 1, 1);
        gradient.colors.forEach((colorStop, index) => {
          grad.addColorStop(step * index, colorStop);
        });
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = color;
      }

      ctx.stroke();
      ctx.restore();
    }

    async function renderToPng(requestKey) {
      await Promise.all(
        currentData.fonts.map((font) =>
          new FontFace(\`font-\${font.id}\`, \`url(\${font.uri})\`).load().then((loaded) => {
            document.fonts.add(loaded);
          }),
        ),
      ).catch(() => {});

      ctx.clearRect(0, 0, currentData.width, currentData.height);
      applyBackground();
      currentData.elements.forEach((element) => {
        if (element.type === 'polyline') {
          drawPolyline(element);
        } else {
          drawTextElement(element);
        }
      });
      const base64 = canvas.toDataURL('image/png');
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXPORT_RESULT', payload: base64, requestKey }));
    }

    function updateData(newData) {
      currentData = newData;
    }

    function handleMessage(event) {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'SET_DATA') {
          updateData(message.payload);
        } else if (message.type === 'EXPORT') {
          renderToPng(message.requestKey || '');
        }
      } catch (error) {
        console.error('Export bridge message error', error);
      }
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);

    window.__exportBridge = {
      updateData,
      renderToPng,
    };
  `;

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
      <style>
        body { margin: 0; padding: 0; background: transparent; }
        canvas { width: 100%; height: 100%; }
        ${fontsCss}
      </style>
    </head>
    <body>
      <canvas id="canvas" width="${data.width}" height="${data.height}"></canvas>
      <script>${initialScript}</script>
    </body>
  </html>`;
};

export function ExportBridge({ data, requestKey, onExported }: ExportBridgeProps) {
  const webViewRef = useRef<WebView | null>(null);
  const html = useMemo(() => buildHtml(data), []);

  useEffect(() => {
    if (!webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify({ type: 'SET_DATA', payload: data }));
  }, [data]);

  useEffect(() => {
    if (!webViewRef.current || !requestKey) return;
    webViewRef.current.postMessage(JSON.stringify({ type: 'EXPORT', requestKey }));
  }, [requestKey]);

  return (
    <View style={styles.hidden} pointerEvents="none" accessibilityElementsHidden>
      <WebView
        ref={(ref) => {
          webViewRef.current = ref;
        }}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'EXPORT_RESULT') {
              onExported({ base64: message.payload, requestKey: message.requestKey });
            }
          } catch (error) {
            console.warn('Failed to parse export bridge message', error);
          }
        }}
        javaScriptEnabled
        mixedContentMode="always"
        style={styles.webview}
        automaticallyAdjustContentInsets={false}
        androidHardwareAccelerationDisabled={Platform.OS === 'android'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  webview: {
    width: 1,
    height: 1,
  },
});

export default ExportBridge;
