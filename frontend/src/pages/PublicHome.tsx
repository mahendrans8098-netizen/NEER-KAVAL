/**
 * Public Home — The main citizen safety screen
 * Prioritizes: Location, Current Safety Status, Weather, Emergency Actions
 * Simple, large controls, Tamil-first
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useVoice } from "../hooks/useVoice";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { api, isBackendConfigured, type WeatherData, type PublicXAI } from "../services/api";
import { MapPin, RefreshCw, Volume2, VolumeX, AlertTriangle, Navigation, Building, LifeBuoy } from "lucide-react";

// Default location (Coimbatore) for when GPS is denied
const DEFAULT_LOCATION = { lat: 11.0168, lon: 76.9558 };

export default function PublicHome() {
  const { t, lang } = useI18n();
  const { location, status, requestLocation } = useGeolocation();
  const { speak, stop, isSpeaking, isSupported } = useVoice();
  const { isOnline } = useNetworkStatus();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [xai, setXai] = useState<PublicXAI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine effective coordinates
  const isDemoLocation = !location;
  const coords = location
    ? { lat: location.latitude, lon: location.longitude }
    : DEFAULT_LOCATION;

  // Fetch weather and risk data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, xaiData] = await Promise.all([
        api.getCurrentWeather(coords.lat, coords.lon),
        api.getPublicXAI(coords.lat, coords.lon, lang),
      ]);
      setWeather(weatherData);
      setXai(xaiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [coords.lat, coords.lon, lang]);

  // Auto-request location on mount
  useEffect(() => {
    if (status === "idle") {
      requestLocation();
    }
  }, [status, requestLocation]);

  // Fetch data when location changes or on first load
  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Determine risk level styling
  const riskLevel = xai?.what || "NORMAL";
  const isEmergency = riskLevel === "HIGH" || riskLevel === "CRITICAL";

  // Voice message
  const voiceMessage = xai
    ? `${xai.risk_label}. ${xai.what_to_do}. ${xai.why.map((f) => `${f.label}: ${f.description}`).join(". ")}`
    : t("floodRisk");

  const handleVoice = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(voiceMessage, lang === "ta" ? "ta-IN" : "en-US");
    }
  };

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

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Static-host notice: no backend means no weather, risk or SOS */}
      {!isBackendConfigured && (
        <div
          role="alert"
          className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4"
        >
          <p className="text-amber-900 font-bold text-sm flex items-center gap-2">
            <AlertTriangle size={18} aria-hidden="true" />
            {t("backendMissing")}
          </p>
          <p className="text-amber-800 text-xs mt-1">{t("backendMissingDetail")}</p>
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-2 text-slate-600">
        <MapPin size={20} className="text-primary" />
        <span className="text-sm font-medium">
          {location
            ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : status === "loading"
            ? t("detectingLocation")
            : t("demoLocation")}
        </span>
        {status === "denied" && (
          <button
            onClick={requestLocation}
            className="text-primary text-sm font-semibold underline"
          >
            {t("selectLocation")}
          </button>
        )}
      </div>

      {/* Emergency banner */}
      {isEmergency && (
        <div
          className="rounded-xl p-6 text-center animate-emergency"
          style={{ backgroundColor: xai?.risk_color || "#dc2626", color: "white" }}
        >
          <div className="text-5xl mb-2">{xai?.risk_icon}</div>
          <h2 className="text-2xl font-bold">{xai?.risk_label}</h2>
          <p className="text-lg mt-2">{xai?.what_to_do}</p>
        </div>
      )}

      {/* Current safety status */}
      {!isEmergency && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: xai?.risk_color || "#22a559", color: "white" }}
        >
          {isDemoLocation && (
            <div className="mb-2">{dataStatusBadge("DEMO")}</div>
          )}
          <div className="text-4xl mb-2">{xai?.risk_icon || "🟢"}</div>
          <h2 className="text-xl font-bold">{xai?.risk_label || t("normal")}</h2>
          {xai?.what_to_do && <p className="text-base mt-1">{xai.what_to_do}</p>}
        </div>
      )}

      {/* Voice button */}
      {isSupported && (
        <button
          onClick={handleVoice}
          className="w-full bg-white border-2 border-primary text-primary rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-lg hover:bg-primary hover:text-white transition-colors emergency-btn"
        >
          {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
          {isSpeaking ? t("stop") : t("listen")}
        </button>
      )}

      {/* XAI — Why is it dangerous? */}
      {xai && xai.why.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            {t("whyDanger")}
          </h3>
          <div className="space-y-3">
            {xai.why.map((factor, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl">{factor.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{factor.label}</p>
                  <p className="text-sm text-slate-600">{factor.description}</p>
                  {/* Contribution bar */}
                  <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${factor.value}%`,
                        backgroundColor: factor.value >= 60 ? "#dc2626" : factor.value >= 30 ? "#f97316" : "#22a559",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather summary */}
      {weather && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">{t("currentWeather")}</h3>
            {dataStatusBadge(weather.data_status)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-sm text-slate-500">{t("temperature")}</p>
              <p className="text-2xl font-bold">{weather.temperature_c ?? "--"}°C</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">{t("rain")}</p>
              <p className="text-2xl font-bold">{weather.precipitation_mm ?? "--"} mm</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">{t("humidity")}</p>
              <p className="text-2xl font-bold">{weather.humidity_percent ?? "--"}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">{t("wind")}</p>
              <p className="text-2xl font-bold">{weather.wind_kmh ?? "--"} km/h</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t("source")}: {weather.source}</span>
            <button onClick={fetchData} className="flex items-center gap-1 text-primary font-semibold">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {t("refreshNow")}
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !weather && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <div className="animate-pulse text-slate-400">
            <RefreshCw size={32} className="mx-auto mb-2 animate-spin" />
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={fetchData} className="text-red-600 font-semibold text-sm mt-2 underline">
            {t("refreshNow")}
          </button>
        </div>
      )}

      {/* Emergency action buttons */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <Link
          to="/safety"
          className="bg-primary text-white rounded-xl py-4 flex flex-col items-center gap-1 font-semibold hover:bg-primary-hover transition-colors emergency-btn"
        >
          <Navigation size={28} />
          <span className="text-sm">{t("goToSafety")}</span>
        </Link>
        <Link
          to="/shelter"
          className="bg-safe text-white rounded-xl py-4 flex flex-col items-center gap-1 font-semibold hover:bg-safe-hover transition-colors emergency-btn"
        >
          <Building size={28} />
          <span className="text-sm">{t("findShelter")}</span>
        </Link>
        <Link
          to="/sos"
          className="bg-danger text-white rounded-xl py-4 flex flex-col items-center gap-1 font-semibold hover:bg-danger-hover transition-colors emergency-btn animate-pulse-slow"
        >
          <LifeBuoy size={28} />
          <span className="text-sm">{t("sos")}</span>
        </Link>
      </div>

      {/* Offline notice */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-800 font-semibold text-sm">⚠️ {t("offlineMode")}</p>
          <p className="text-amber-700 text-xs mt-1">{t("safetyInfo")}: {t("available2")}</p>
        </div>
      )}
    </div>
  );
}
