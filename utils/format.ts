import { StravaActivity } from '@/types/strava';

const metersToKilometers = (meters: number) => meters / 1000;

export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
  if (!meters && meters !== 0) return '--';
  if (unit === 'mi') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(2)} mi`;
  }
  return `${metersToKilometers(meters).toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  if (!seconds && seconds !== 0) return '--';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [] as string[];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

export function formatPace(meters: number, seconds: number, unit: 'km' | 'mi' = 'km'): string {
  if (!meters || !seconds) return '--';
  const pacePerMeter = seconds / meters;
  const distanceUnit = unit === 'mi' ? 1609.34 : 1000;
  const totalSeconds = pacePerMeter * distanceUnit;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  const suffix = unit === 'mi' ? '/mi' : '/km';
  return `${mins}:${secs} ${suffix}`;
}

export function formatSpeed(metersPerSecond: number, unit: 'km' | 'mi' = 'km'): string {
  if (!metersPerSecond && metersPerSecond !== 0) return '--';
  const multiplier = unit === 'mi' ? 2.23694 : 3.6;
  const label = unit === 'mi' ? 'mph' : 'km/h';
  return `${(metersPerSecond * multiplier).toFixed(1)} ${label}`;
}

export function formatElevation(meters: number, unit: 'km' | 'mi' = 'km'): string {
  if (!meters && meters !== 0) return '--';
  if (unit === 'mi') {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLocation(activity: StravaActivity): string {
  const parts = [activity.location_city, activity.location_state, activity.location_country]
    .filter(Boolean)
    .map((segment) => segment?.trim())
    .filter(Boolean);

  return parts.length ? parts.join(', ') : 'Unknown location';
}
