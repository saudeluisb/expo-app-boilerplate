import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { STRAVA_AUTH_URL, STRAVA_CLIENT_ID_ENV, STRAVA_REDIRECT_URI_ENV, STRAVA_SCOPES } from '@/config/strava';
import { exchangeStravaToken, fetchStravaActivities, refreshStravaToken } from '@/services/strava';
import { StravaActivity, StravaAthlete, StravaTokenPayload } from '@/types/strava';

type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athlete: StravaAthlete;
};

type StravaContextValue = {
  athlete: StravaAthlete | null;
  accessToken: string | null;
  activities: StravaActivity[];
  selectedActivity: StravaActivity | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refetchActivities: (force?: boolean) => Promise<void>;
  handleAuthRedirect: (input: { url?: string; code?: string; error?: string }) => Promise<void>;
  selectActivity: (activity: StravaActivity | null) => void;
  defaultRedirectUri: string;
};

const STORAGE_KEY = 'stravaAuthState';

const StravaContext = createContext<StravaContextValue | undefined>(undefined);

const getRedirectUri = () => {
  if (STRAVA_REDIRECT_URI_ENV) {
    return STRAVA_REDIRECT_URI_ENV as string;
  }
  return Linking.createURL('/oauth/strava');
};

type AuthCodeResult = { code?: string; error?: string };

const parseUrlForCode = (url?: string): AuthCodeResult => {
  if (!url) return { code: undefined, error: undefined };
  try {
    const parsed = new URL(url);
    return {
      code: parsed.searchParams.get('code') ?? undefined,
      error: parsed.searchParams.get('error') ?? undefined,
    };
  } catch (error) {
    console.warn('Unable to parse URL for Strava auth', error);
    return { code: undefined, error: 'invalid_url' };
  }
};

function mapTokenPayloadToStoredAuth(payload: StravaTokenPayload): StoredAuth {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_at,
    athlete: payload.athlete,
  };
}

export function StravaProvider({ children }: { children: React.ReactNode }) {
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const redirectUri = useMemo(() => getRedirectUri(), []);

  useEffect(() => {
    (async () => {
      try {
        const storedRaw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!storedRaw) return;
        const stored = JSON.parse(storedRaw) as StoredAuth;
        setAthlete(stored.athlete);
        setAccessToken(stored.accessToken);
        setRefreshTokenValue(stored.refreshToken);
        setExpiresAt(stored.expiresAt);
      } catch (err) {
        console.error('Failed to restore Strava auth state', err);
      } finally {
        hasLoadedRef.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current || !accessToken) return;

    const schedule = () => {
      if (!expiresAt) return;
      const now = Math.floor(Date.now() / 1000);
      const remaining = expiresAt - now;
      if (remaining <= 120) {
        refreshTokens();
      } else {
        const timeout = setTimeout(() => refreshTokens(), (remaining - 60) * 1000);
        return () => clearTimeout(timeout);
      }
      return undefined;
    };

    return schedule();
  }, [accessToken, expiresAt]);

  useEffect(() => {
    if (!accessToken) {
      setActivities([]);
      setSelectedActivity(null);
      return;
    }
    refetchActivities();
  }, [accessToken]);

  const persistAuth = useCallback(async (stored: StoredAuth | null) => {
    if (!stored) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, []);

  const applyAuthState = useCallback(
    async (payload: StravaTokenPayload | null) => {
      if (!payload) {
        setAccessToken(null);
        setRefreshTokenValue(null);
        setExpiresAt(null);
        setAthlete(null);
        await persistAuth(null);
        return;
      }

      const stored = mapTokenPayloadToStoredAuth(payload);
      setAccessToken(stored.accessToken);
      setRefreshTokenValue(stored.refreshToken);
      setExpiresAt(stored.expiresAt);
      setAthlete(stored.athlete);
      await persistAuth(stored);
    },
    [persistAuth],
  );

  const refreshTokens = useCallback(async () => {
    if (!refreshTokenValue) return;
    try {
      const payload = await refreshStravaToken(refreshTokenValue);
      await applyAuthState(payload);
    } catch (err) {
      console.error('Failed to refresh Strava token', err);
      setError('Unable to refresh Strava session. Please sign in again.');
      await applyAuthState(null);
    }
  }, [applyAuthState, refreshTokenValue]);

  const refetchActivities = useCallback(
    async (force = false) => {
      if (!accessToken) return;
      if (isLoading && !force) return;

      setIsLoading(true);
      setError(null);
      try {
        const fetched = await fetchStravaActivities(accessToken);
        setActivities(fetched);
        if (!selectedActivity && fetched.length) {
          setSelectedActivity(fetched[0]);
        } else if (selectedActivity) {
          const match = fetched.find((activity) => activity.id === selectedActivity.id);
          if (match) setSelectedActivity(match);
        }
      } catch (err) {
        console.error('Failed to fetch Strava activities', err);
        setError('Unable to load Strava activities.');
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, isLoading, selectedActivity],
  );

  const handleAuthRedirect = useCallback(
    async ({ url, code, error: authError }: { url?: string; code?: string; error?: string }) => {
      if (authError) {
        setError('Strava authentication was cancelled or failed.');
        return;
      }

      const parsed: AuthCodeResult = code ? { code } : parseUrlForCode(url);
      if (!parsed.code) {
        if (parsed.error) {
          setError('Strava rejected the sign-in attempt.');
        }
        return;
      }

      setIsAuthenticating(true);
      setError(null);
      try {
        const payload = await exchangeStravaToken(parsed.code);
        await applyAuthState(payload);
      } catch (err) {
        console.error('Strava authentication failed', err);
        setError('Unable to sign in with Strava. Please try again.');
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applyAuthState],
  );

  const signIn = useCallback(async () => {
    if (!STRAVA_CLIENT_ID_ENV) {
      setError('Missing Strava client id.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);
    try {
      const authUrl = `${STRAVA_AUTH_URL}?client_id=${STRAVA_CLIENT_ID_ENV}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&approval_prompt=auto&scope=${encodeURIComponent(STRAVA_SCOPES.join(','))}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success') {
        await handleAuthRedirect({ url: result.url });
      } else if (result.type === 'cancel') {
        setError('Strava sign in cancelled.');
      }
    } catch (err) {
      console.error('Strava sign-in error', err);
      setError('Unable to open Strava sign-in.');
    } finally {
      setIsAuthenticating(false);
    }
  }, [handleAuthRedirect, redirectUri]);

  const signOut = useCallback(async () => {
    setActivities([]);
    setSelectedActivity(null);
    await applyAuthState(null);
  }, [applyAuthState]);

  const selectActivity = useCallback((activity: StravaActivity | null) => {
    setSelectedActivity(activity);
  }, []);

  const value = useMemo(
    () => ({
      athlete,
      accessToken,
      activities,
      selectedActivity,
      isLoading,
      isAuthenticating,
      error,
      signIn,
      signOut,
      refetchActivities,
      handleAuthRedirect,
      selectActivity,
      defaultRedirectUri: redirectUri,
    }),
    [
      athlete,
      accessToken,
      activities,
      selectedActivity,
      isLoading,
      isAuthenticating,
      error,
      signIn,
      signOut,
      refetchActivities,
      handleAuthRedirect,
      selectActivity,
      redirectUri,
    ],
  );

  return <StravaContext.Provider value={value}>{children}</StravaContext.Provider>;
}

export function useStrava() {
  const context = useContext(StravaContext);
  if (!context) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
}
