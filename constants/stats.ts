import { MaterialCommunityIcons } from '@expo/vector-icons';

import { EditorStatKey } from '@/types/editor';
import {
  formatDate,
  formatDistance,
  formatDuration,
  formatElevation,
  formatLocation,
  formatPace,
  formatSpeed,
} from '@/utils/format';
import { StravaActivity } from '@/types/strava';

export type StatDescriptor = {
  key: EditorStatKey;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  formatter: (activity: StravaActivity) => string;
  description: string;
};

export const STAT_CATALOG: StatDescriptor[] = [
  {
    key: 'distance',
    label: 'Distance',
    icon: 'map-marker-distance',
    formatter: (activity) => formatDistance(activity.distance),
    description: 'Total distance covered in kilometers.',
  },
  {
    key: 'movingTime',
    label: 'Moving Time',
    icon: 'timer-outline',
    formatter: (activity) => formatDuration(activity.moving_time),
    description: 'Actual time spent moving on the run.',
  },
  {
    key: 'elapsedTime',
    label: 'Elapsed Time',
    icon: 'clock-outline',
    formatter: (activity) => formatDuration(activity.elapsed_time),
    description: 'Total elapsed time including stops.',
  },
  {
    key: 'averagePace',
    label: 'Average Pace',
    icon: 'speedometer-slow',
    formatter: (activity) => formatPace(activity.distance, activity.moving_time),
    description: 'Average pace across the run.',
  },
  {
    key: 'averageSpeed',
    label: 'Average Speed',
    icon: 'speedometer',
    formatter: (activity) => formatSpeed(activity.average_speed),
    description: 'Average speed converted to km/h.',
  },
  {
    key: 'elevationGain',
    label: 'Elevation Gain',
    icon: 'summit',
    formatter: (activity) => formatElevation(activity.total_elevation_gain),
    description: 'Total elevation climbed during the run.',
  },
  {
    key: 'calories',
    label: 'Calories',
    icon: 'fire',
    formatter: (activity) =>
      activity.calorie ? `${Math.round(activity.calorie)} kcal` : '—',
    description: 'Estimated energy burned.',
  },
  {
    key: 'averageHeartrate',
    label: 'Avg. Heart Rate',
    icon: 'heart-pulse',
    formatter: (activity) =>
      activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : '—',
    description: 'Average heart rate across the activity.',
  },
  {
    key: 'maxHeartrate',
    label: 'Max Heart Rate',
    icon: 'heart-flash',
    formatter: (activity) =>
      activity.max_heartrate ? `${Math.round(activity.max_heartrate)} bpm` : '—',
    description: 'Peak heart rate reached.',
  },
  {
    key: 'kudos',
    label: 'Kudos',
    icon: 'thumb-up-outline',
    formatter: (activity) => `${activity.kudos_count ?? 0} kudos`,
    description: 'How many high-fives the run earned.',
  },
  {
    key: 'achievements',
    label: 'Achievements',
    icon: 'medal-outline',
    formatter: (activity) => `${activity.achievement_count ?? 0} achievements`,
    description: 'Segments and medals from the effort.',
  },
];

export const DEFAULT_STATS: EditorStatKey[] = [
  'distance',
  'averagePace',
  'movingTime',
  'elevationGain',
];

export const EXTRA_ACTIVITY_METADATA: StatDescriptor[] = [
  {
    key: 'text-title' as EditorStatKey,
    label: 'Activity Name',
    icon: 'format-title',
    formatter: (activity) => activity.name,
    description: 'Use the run name as a headline.',
  },
  {
    key: 'text-date' as EditorStatKey,
    label: 'Date',
    icon: 'calendar-month',
    formatter: (activity) => formatDate(activity.start_date_local),
    description: 'When the run happened.',
  },
  {
    key: 'text-location' as EditorStatKey,
    label: 'Location',
    icon: 'map-marker-outline',
    formatter: (activity) => formatLocation(activity),
    description: 'City, state, and country (if provided).',
  },
];
