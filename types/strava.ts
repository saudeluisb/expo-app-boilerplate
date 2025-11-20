export type StravaSummaryMap = {
  id: string | null;
  summary_polyline: string | null;
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  calorie?: number;
  map: StravaSummaryMap;
  kudos_count: number;
  comment_count: number;
  achievement_count: number;
  suffer_score?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
};

export type StravaAthlete = {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  profile: string;
};

export type StravaTokenPayload = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthlete;
};
