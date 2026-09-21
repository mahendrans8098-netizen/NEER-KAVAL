/**
 * Public Weather — Detailed weather information
 * Shows current conditions, forecast, and data source
 */

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { api, type WeatherData } from "../services/api";
import { MapPin, RefreshCw, Cloud, Droplet, Wind, Thermometer } from "lucide-react";

const DEFAULT_LOCATION = { lat: 11.0168, lon: 76.9558 };

export default function PublicWeather() {
  const { t, lang } = useI18n();
  const { location } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coords = location
    ? { lat: location.latitude, lon: location.longitude }
    : DEFAULT_LOCATION;

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCurrentWeather(coords.lat, coords.lon);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }, [coords.lat, coords.lon]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const dataStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      LIVE: { text: t("liveData"), color: "bg-green-100 text-green-800" },
      CACHED: { text: t("cachedData"), color: "bg-amber-100 text-amber-800" },
      DEMO: { text: t("demoData"), color: "bg-purple-100 text-purple-800" },
      UNAVAILABLE: { text: t("unavailable"), color: "bg-red-100 text-red-800" },
    };
    const badge = badges[status] || badges.LIVE;
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "--";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString(lang === "ta" ? "ta-IN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  if (loading && !weather) {
    return (
      <div className="px-4 py-8 text-center text-slate-400">
        <RefreshCw size={32} className="mx-auto mb-2 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={fetchWeather} className="text-red-600 font-semibold text-sm mt-2 underline">
            {t("refreshNow")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={18} className="text-primary" />
        <span>📍 {t("yourLocation")}</span>
        {location && (
          <span className="text-xs">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        )}
      </div>

      {/* Current weather card */}
      {weather && (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t("currentWeather")}</h3>
              {dataStatusBadge(weather.data_status)}
            </div>

            <div className="text-center mb-6">
              <Cloud size={48} className="mx-auto text-primary mb-2" />
              <p className="text-4xl font-bold text-slate-800">
                {weather.temperature_c ?? "--"}°C
              </p>
              <p className="text-slate-600">{weather.weather_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer size={20} className="text-orange-500" />
                <div>
                  <p className="text-xs text-slate-500">{t("temperature")}</p>
                  <p className="font-bold">{weather.apparent_temp_c ?? "--"}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplet size={20} className="text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">{t("rain")}</p>
                  <p className="font-bold">{weather.precipitation_mm ?? "--"} mm</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplet size={20} className="text-cyan-500" />
                <div>
                  <p className="text-xs text-slate-500">{t("humidity")}</p>
                  <p className="font-bold">{weather.humidity_percent ?? "--"}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind size={20} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">{t("wind")}</p>
                  <p className="font-bold">{weather.wind_kmh ?? "--"} km/h</p>
                </div>
              </div>
            </div>

            {/* Data freshness */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <p>{t("lastUpdated")}: {formatTime(weather.observed_at)}</p>
                <p>{t("source")}: {weather.source}</p>
              </div>
              <button
                onClick={fetchWeather}
                className="flex items-center gap-1 text-primary font-semibold"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                {t("refreshNow")}
              </button>
            </div>
          </div>

          {/* Hourly forecast */}
          {weather.hourly_forecast.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-3">{t("forecast")}</h3>
              <div className="space-y-3">
                {weather.hourly_forecast.map((hour, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {hour.weather_code <= 3 ? "☀️" : hour.weather_code <= 67 ? "🌧️" : "⛈️"}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{formatTime(hour.time)}</p>
                        <p className="text-xs text-slate-500">{hour.weather_description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{hour.temperature_c}°C</p>
                      <p className="text-xs text-blue-500">{hour.precipitation_probability}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
