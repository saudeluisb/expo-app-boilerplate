import Constants from 'expo-constants';

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI } =
  Constants?.expoConfig?.extra ?? {};

export const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
export const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export const STRAVA_SCOPES = [
  'read',
  'profile:read_all',
  'activity:read',
  'activity:read_all',
];

export const STRAVA_CLIENT_ID_ENV =
  (Constants?.expoConfig?.extra as Record<string, any>)?.STRAVA_CLIENT_ID ||
  (process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID as string | undefined) ||
  STRAVA_CLIENT_ID ||
  '';

export const STRAVA_CLIENT_SECRET_ENV =
  (Constants?.expoConfig?.extra as Record<string, any>)?.STRAVA_CLIENT_SECRET ||
  (process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET as string | undefined) ||
  STRAVA_CLIENT_SECRET ||
  '';

export const STRAVA_REDIRECT_URI_ENV =
  (Constants?.expoConfig?.extra as Record<string, any>)?.STRAVA_REDIRECT_URI ||
  (process.env.EXPO_PUBLIC_STRAVA_REDIRECT_URI as string | undefined) ||
  STRAVA_REDIRECT_URI ||
  '';
