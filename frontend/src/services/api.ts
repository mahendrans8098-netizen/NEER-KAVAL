/**
 * API client for NEERKAVAL backend
 * Uses __PORT_8000__ placeholder which gets rewritten at deploy time
 */

// Placeholder rewritten at Perplexity deploy time to proxy the sandbox backend.
const SANDBOX_PLACEHOLDER = "__PORT_8000__";

// Build-time override for real hosting (GitHub Pages, Vercel, Netlify, ...).
// Set VITE_API_BASE_URL to your deployed FastAPI URL before `npm run build`.
const ENV_API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

function getApiBase(): string {
  // 1. Explicit build-time backend URL wins.
  if (ENV_API_BASE) return ENV_API_BASE.replace(/\/$/, "");
  // 2. Perplexity preview: placeholder was rewritten to a real proxy URL.
  if (!SANDBOX_PLACEHOLDER.startsWith("__PORT_")) return SANDBOX_PLACEHOLDER;
  // 3. Local development.
  return "http://localhost:8000";
}

const BASE_URL = getApiBase();

/**
 * True when no backend URL was configured at build time and the app is not
 * running on localhost — i.e. a static-only host with no API behind it.
 * The UI uses this to say so plainly instead of showing empty data.
 */
export const isBackendConfigured: boolean = Boolean(
  ENV_API_BASE ||
    !SANDBOX_PLACEHOLDER.startsWith("__PORT_") ||
    (typeof window !== "undefined" &&
      /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname))
);

export const apiBaseUrl: string = BASE_URL;

export interface WeatherData {
  source: string;
  latitude: number;
  longitude: number;
  observed_at: string | null;
  retrieved_at: string;
  temperature_c: number | null;
  humidity_percent: number | null;
  apparent_temp_c: number | null;
  precipitation_mm: number | null;
  rain_mm: number | null;
  showers_mm: number | null;
  wind_kmh: number | null;
  wind_direction: number | null;
  wind_gusts_kmh: number | null;
  weather_code: number | null;
  weather_description: string;
  data_status: string;
  hourly_forecast: HourlyForecast[];
}

export interface HourlyForecast {
  time: string;
  temperature_c: number;
  precipitation_mm: number;
  rain_mm: number;
  precipitation_probability: number;
  weather_code: number;
  weather_description: string;
  wind_kmh: number;
}

export interface RiskPrediction {
  risk_score: number;
  risk_level: string;
  lead_time_minutes: number | null;
  peak_time: string | null;
  factors: RiskFactor[];
  model_status: string;
  model_version: string;
  is_prototype: boolean;
  latitude: number;
  longitude: number;
  data_status: string;
}

export interface RiskFactor {
  name: string;
  value: number;
  contribution: number;
  description: string;
}

export interface PublicXAI {
  risk_icon: string;
  risk_label: string;
  risk_color: string;
  what: string;
  why: { icon: string; label: string; description: string; value: number }[];
  when: { peak_time: string | null; lead_time_minutes: number | null };
  what_to_do: string;
  language: string;
}

export interface OfficerXAI {
  risk_score: number;
  risk_level: string;
  risk_icon: string;
  risk_color: string;
  factors: {
    name: string;
    display_name: string;
    icon: string;
    observed_value: number;
    contribution: number;
    description: string;
  }[];
  trend: string;
  lead_time_minutes: number | null;
  peak_time: string | null;
  model_status: string;
  model_version: string;
  is_prototype: boolean;
}

export interface Shelter {
  id: number;
  name: string;
  name_ta: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  distance_km: number;
  estimated_walk_time_min: number;
  status: string;
  capacity: number;
  available_spaces: number;
  has_medical: boolean;
  has_water: boolean;
  has_food: boolean;
  is_accessible: boolean;
  is_verified: boolean;
  is_demo: boolean;
}

export interface SafeRoute {
  status: string;
  provider: string;
  distance_km: number;
  estimated_walk_time_min: number;
  estimated_drive_time_min: number;
  start: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  segments: {
    instruction_ta: string;
    instruction_en: string;
    distance_km: number;
    direction: string;
    hazard_type?: string;
  }[];
  nearby_hazards: { hazard_type: string; distance_km: number; description: string }[];
  warning: string;
}

export interface SOSResponse {
  sos_id: number;
  status: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
  request_type: string;
  location: { latitude: number; longitude: number } | null;
}

export interface SystemStatus {
  services: Record<string, string>;
  app_mode: string;
  timestamp: string;
}

export interface Alert {
  id: number;
  title: string;
  title_ta: string | null;
  message: string;
  message_ta: string | null;
  severity: string;
  affected_area: string | null;
  latitude: number | null;
  longitude: number | null;
  is_demo: boolean;
  created_at: string;
}

export interface CitizenReport {
  id: number;
  report_type: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  status: string;
  is_demo: boolean;
  created_at: string;
}

export interface RescueTeam {
  id: number;
  team_name: string;
  status: string;
  assigned_incident: string | null;
  latitude: number | null;
  longitude: number | null;
  is_demo: boolean;
  last_updated: string;
}

export interface RoadHazard {
  id: number;
  hazard_type: string;
  latitude: number;
  longitude: number;
  description: string | null;
  status: string;
  is_demo: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  full_name: string;
  username: string;
}

// Auth token storage (in-memory, not localStorage which is blocked in iframe)
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Weather
  getCurrentWeather: (lat: number, lon: number) =>
    fetchAPI<WeatherData>(`/api/weather/current?lat=${lat}&lon=${lon}`),

  getWeatherForecast: (lat: number, lon: number) =>
    fetchAPI<{ hourly_forecast: HourlyForecast[] }>(`/api/weather/forecast?lat=${lat}&lon=${lon}`),

  // Risk
  getCurrentRisk: (lat: number, lon: number, params?: Record<string, number>) => {
    const query = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (params) {
      Object.entries(params).forEach(([k, v]) => query.append(k, v.toString()));
    }
    return fetchAPI<RiskPrediction>(`/api/risk/current?${query}`);
  },

  getModelInfo: () => fetchAPI(`/api/risk/model-info`),

  // XAI
  getPublicXAI: (lat: number, lon: number, language: string = "ta") =>
    fetchAPI<PublicXAI>(`/api/xai/public?lat=${lat}&lon=${lon}&language=${language}`),

  getOfficerXAI: (lat: number, lon: number) =>
    fetchAPI<OfficerXAI>(`/api/xai/officer?lat=${lat}&lon=${lon}`),

  // Shelters
  getNearbyShelters: (lat: number, lon: number) =>
    fetchAPI<{ shelters: Shelter[]; count: number }>(`/api/shelters/nearby?lat=${lat}&lon=${lon}`),

  // Routing
  getSafeRoute: (startLat: number, startLon: number, destLat: number, destLon: number) =>
    fetchAPI<SafeRoute>(`/api/routes/safe?start_lat=${startLat}&start_lon=${startLon}&dest_lat=${destLat}&dest_lon=${destLon}`),

  // Emergency
  createSOS: (data: { request_type: string; latitude?: number; longitude?: number; message?: string; network_status?: string }) =>
    fetchAPI<SOSResponse>("/api/emergency/sos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSOSStatus: (sosId: number) =>
    fetchAPI<{ status: string; message: string; acknowledged?: boolean; acknowledged_at?: string }>(`/api/emergency/sos/${sosId}/status`),

  // Citizen reports
  createReport: (data: { report_type: string; latitude?: number; longitude?: number; description?: string }) =>
    fetchAPI<{ id: number; status: string; message: string }>(`/api/citizen/report`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCitizenReports: () =>
    fetchAPI<{ reports: CitizenReport[] }>("/api/citizen/reports"),

  // Alerts
  getAlerts: () => fetchAPI<{ alerts: Alert[] }>("/api/alerts"),

  sendAlert: (data: { title: string; title_ta?: string; message: string; message_ta?: string; severity?: string; affected_area?: string; latitude?: number; longitude?: number }) =>
    fetchAPI<{ id: number; status: string }>("/api/alerts/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Rescue teams
  getRescueTeams: () => fetchAPI<{ teams: RescueTeam[] }>("/api/rescue/teams"),

  // Hazards
  getRoadHazards: () => fetchAPI<{ hazards: RoadHazard[] }>("/api/hazards"),

  // System
  getSystemStatus: () => fetchAPI<SystemStatus>("/api/system/status"),

  // Auth
  login: (username: string, password: string) =>
    fetchAPI<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => fetchAPI<{ id: number; username: string; full_name: string; role: string; phone: string }>("/api/auth/me"),
};
