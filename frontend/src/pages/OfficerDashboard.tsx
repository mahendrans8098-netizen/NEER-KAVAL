/**
 * Officer Dashboard — Emergency intelligence and decision-support center
 * Shows: System status, Weather, Risk/XAI, Shelters, Hazards, Reports, Alerts, Rescue teams
 */

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../i18n/I18nContext";
import { api, setAuthToken, type SystemStatus, type WeatherData, type OfficerXAI, type Shelter, type CitizenReport, type RescueTeam, type RoadHazard, type Alert } from "../services/api";
import { Activity, Cloud, AlertTriangle, Building, Users, Truck, Bell, RefreshCw, LogOut, MapPin } from "lucide-react";

export default function OfficerDashboard() {
  const { t, lang } = useI18n();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [xai, setXai] = useState<OfficerXAI | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [hazards, setHazards] = useState<RoadHazard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates (Coimbatore)
  const coords = { lat: 11.0168, lon: 76.9558 };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [status, weatherData, xaiData, shelterData, reportData, teamData, hazardData, alertData] = await Promise.all([
        api.getSystemStatus(),
        api.getCurrentWeather(coords.lat, coords.lon),
        api.getOfficerXAI(coords.lat, coords.lon),
        api.getNearbyShelters(coords.lat, coords.lon),
        api.getCitizenReports(),
        api.getRescueTeams(),
        api.getRoadHazards(),
        api.getAlerts(),
      ]);
      setSystemStatus(status);
      setWeather(weatherData);
      setXai(xaiData);
      setShelters(shelterData.shelters);
      setReports(reportData.reports);
      setRescueTeams(teamData.teams);
      setHazards(hazardData.hazards);
      setAlerts(alertData.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5 * 60 * 1000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleLogout = () => {
    setAuthToken(null);
    window.location.hash = "/officer/login";
  };

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
          <RefreshCw size={32} className="mx-auto mb-2 animate-spin" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("dashboard")}</h1>
          <p className="text-sm text-slate-500">
            {lang === "ta" ? "அவசர நிர்வாக மையம்" : "Emergency Intelligence Center"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {t("refreshNow")}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <LogOut size={16} />
            {t("logout")}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* System Status */}
      {systemStatus && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{t("systemStatus")}</h2>
            <span className="text-xs text-slate-500 ml-auto">
              Mode: {systemStatus.app_mode}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(systemStatus.services).map(([service, status]) => (
              <div key={service} className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{service}</p>
                <p className="text-sm font-bold">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Weather Panel */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Cloud size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{t("currentWeather")}</h2>
            {weather && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${
                weather.data_status === "LIVE" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
              }`}>
                {weather.data_status}
              </span>
            )}
          </div>
          {weather ? (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">{t("temperature")}:</span> <span className="font-bold">{weather.temperature_c}°C</span></div>
                <div><span className="text-slate-500">{t("humidity")}:</span> <span className="font-bold">{weather.humidity_percent}%</span></div>
                <div><span className="text-slate-500">{t("rain")}:</span> <span className="font-bold">{weather.precipitation_mm} mm</span></div>
                <div><span className="text-slate-500">{t("wind")}:</span> <span className="font-bold">{weather.wind_kmh} km/h</span></div>
              </div>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                {weather.weather_description} | {t("source")}: {weather.source}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No weather data</p>
          )}
        </div>

        {/* Risk/XAI Panel */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-amber-500" />
            <h2 className="font-bold text-lg">{t("riskAnalysis")}</h2>
          </div>
          {xai ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold" style={{ color: xai.risk_color }}>
                    {xai.risk_score}%
                  </span>
                  <span className="ml-2 text-sm font-bold" style={{ color: xai.risk_color }}>
                    {xai.risk_level}
                  </span>
                </div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full font-semibold">
                  {xai.trend}
                </span>
              </div>
              {/* Factor bars */}
              <div className="space-y-2">
                {xai.factors.map((factor, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">{factor.icon} {factor.display_name}</span>
                      <span className="text-slate-500">{factor.observed_value.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${factor.observed_value}%`,
                          backgroundColor: factor.observed_value >= 60 ? "#dc2626" : factor.observed_value >= 30 ? "#f97316" : "#22a559",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                {xai.model_status}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No risk data</p>
          )}
        </div>

        {/* Shelters */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Building size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{t("shelter")}</h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {shelters.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.distance_km} km | {s.available_spaces}/{s.capacity}</p>
                </div>
                <span className={`text-xs font-bold ${
                  s.status === "OPEN" ? "text-safe" : s.status === "FULL" ? "text-danger" : "text-slate-500"
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Reports */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{t("citizenReports")}</h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reports.map((r) => (
              <div key={r.id} className="text-sm border-b border-slate-100 pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">{r.report_type}</span>
                  <span className={`text-xs font-bold ${
                    r.status === "PENDING" ? "text-amber-600" : r.status === "RESOLVED" ? "text-safe" : "text-blue-600"
                  }`}>{r.status}</span>
                </div>
                {r.description && <p className="text-xs text-slate-500">{r.description}</p>}
                {r.is_demo && <span className="text-xs text-purple-600">DEMO</span>}
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-slate-400">No reports</p>}
          </div>
        </div>

        {/* Rescue Teams */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{t("rescueTeams")}</h2>
          </div>
          <div className="space-y-2">
            {rescueTeams.map((team) => (
              <div key={team.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                <div>
                  <p className="font-semibold">{team.team_name}</p>
                  {team.assigned_incident && <p className="text-xs text-slate-500">{team.assigned_incident}</p>}
                </div>
                <span className={`text-xs font-bold ${
                  team.status === "AVAILABLE" ? "text-safe" : team.status === "ON_MISSION" ? "text-amber-600" : "text-danger"
                }`}>
                  {team.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Hazards */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={20} className="text-primary" />
            <h2 className="font-bold text-lg">{t("alerts")}</h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((a) => (
              <div key={a.id} className="text-sm border-b border-slate-100 pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">{lang === "ta" && a.title_ta ? a.title_ta : a.title}</span>
                  <span className="text-xs font-bold text-amber-600">{a.severity}</span>
                </div>
                <p className="text-xs text-slate-500">{lang === "ta" && a.message_ta ? a.message_ta : a.message}</p>
                {a.is_demo && <span className="text-xs text-purple-600">DEMO</span>}
              </div>
            ))}
            {alerts.length === 0 && <p className="text-sm text-slate-400">No active alerts</p>}
          </div>

          {/* Hazards */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-2">Road Hazards ({hazards.length})</p>
            {hazards.map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-xs text-red-600 mb-1">
                <MapPin size={12} />
                <span>{h.hazard_type} — {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
