export type RGB = { r: number; g: number; b: number };

const clamp = (value: number, min = 0, max = 255) => Math.min(Math.max(value, min), max);

export function normalizeHex(hex: string): string {
  if (!hex) return '#ffffff';
  let normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  return `#${normalized.substring(0, 6)}`.toLowerCase();
}

export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex).replace('#', '');
  const num = parseInt(normalized, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (value: number) => clamp(Math.round(value)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixColors(colorA: string, colorB: string, ratio: number): string {
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);

  return rgbToHex({
    r: rgbA.r + (rgbB.r - rgbA.r) * clampedRatio,
    g: rgbA.g + (rgbB.g - rgbA.g) * clampedRatio,
    b: rgbA.b + (rgbB.b - rgbA.b) * clampedRatio,
  });
}

export function lighten(color: string, amount = 0.1): string {
  const rgb = hexToRgb(color);
  const lightenChannel = (value: number) => value + (255 - value) * amount;
  return rgbToHex({
    r: lightenChannel(rgb.r),
    g: lightenChannel(rgb.g),
    b: lightenChannel(rgb.b),
  });
}

export function darken(color: string, amount = 0.1): string {
  const rgb = hexToRgb(color);
  const darkenChannel = (value: number) => value * (1 - amount);
  return rgbToHex({
    r: darkenChannel(rgb.r),
    g: darkenChannel(rgb.g),
    b: darkenChannel(rgb.b),
  });
}

export function createGradientSteps(colors: string[], steps: number): string[] {
  if (colors.length <= 1) {
    return Array.from({ length: steps }, () => normalizeHex(colors[0] ?? '#ffffff'));
  }

  const segments = colors.length - 1;
  const stepsPerSegment = steps / segments;

  const result: string[] = [];
  colors.forEach((color, index) => {
    if (index === colors.length - 1) {
      result.push(normalizeHex(color));
      return;
    }

    const nextColor = colors[index + 1];
    for (let step = 0; step < stepsPerSegment; step++) {
      const ratio = step / stepsPerSegment;
      result.push(mixColors(color, nextColor, ratio));
    }
  });

  return result.slice(0, steps);
}
