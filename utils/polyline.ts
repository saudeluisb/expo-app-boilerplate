import { CanvasPoint } from '@/types/editor';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export function decodePolyline(encoded: string | null | undefined): LatLng[] {
  if (!encoded) return [];

  let index = 0;
  const len = encoded.length;
  const points: LatLng[] = [];
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

export type NormalizedPolylineOptions = {
  width: number;
  height: number;
  paddingRatio?: number;
};

export function normalizeLatLngPoints(
  points: LatLng[],
  options: NormalizedPolylineOptions,
): CanvasPoint[] {
  if (!points.length) return [];

  const { width, height, paddingRatio = 0.08 } = options;

  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;

  points.forEach((point) => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const paddingX = width * paddingRatio;
  const paddingY = height * paddingRatio;

  return points.map((point) => {
    const x = ((point.longitude - minLng) / lngRange) * (width - paddingX * 2) + paddingX;
    const y =
      (1 - (point.latitude - minLat) / latRange) * (height - paddingY * 2) + paddingY;

    return { x, y };
  });
}
