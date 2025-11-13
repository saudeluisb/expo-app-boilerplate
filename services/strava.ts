import { STRAVA_BASE_URL, STRAVA_TOKEN_URL, STRAVA_CLIENT_ID_ENV, STRAVA_CLIENT_SECRET_ENV } from '@/config/strava';
import { StravaActivity, StravaTokenPayload } from '@/types/strava';

const TOKEN_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

const throwIfMissingCredentials = () => {
  if (!STRAVA_CLIENT_ID_ENV || !STRAVA_CLIENT_SECRET_ENV) {
    throw new Error(
      'Missing Strava credentials. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in app.json extra or Expo env.',
    );
  }
};

export async function exchangeStravaToken(code: string): Promise<StravaTokenPayload> {
  throwIfMissingCredentials();

  const body = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID_ENV,
    client_secret: STRAVA_CLIENT_SECRET_ENV,
    code,
    grant_type: 'authorization_code',
  }).toString();

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: TOKEN_HEADERS,
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to exchange Strava token: ${response.status} ${message}`);
  }

  const json = (await response.json()) as StravaTokenPayload;
  return json;
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenPayload> {
  throwIfMissingCredentials();

  const body = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID_ENV,
    client_secret: STRAVA_CLIENT_SECRET_ENV,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }).toString();

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: TOKEN_HEADERS,
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to refresh Strava token: ${response.status} ${message}`);
  }

  const json = (await response.json()) as StravaTokenPayload;
  return json;
}

export async function fetchStravaActivities(accessToken: string, page = 1, perPage = 30): Promise<StravaActivity[]> {
  const url = `${STRAVA_BASE_URL}/athlete/activities?page=${page}&per_page=${perPage}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to fetch Strava activities: ${response.status} ${message}`);
  }

  const json = (await response.json()) as StravaActivity[];
  return json;
}
