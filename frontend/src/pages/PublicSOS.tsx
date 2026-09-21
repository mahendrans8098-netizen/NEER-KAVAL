/**
 * Public SOS — One-tap emergency request
 * Minimizes user input, attaches GPS, shows honest status
 */

import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { api, type SOSResponse } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PublicSOS() {
  const { t } = useI18n();
  const { location, requestLocation } = useGeolocation();
  const { isOnline } = useNetworkStatus();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sosResponse, setSOSResponse] = useState<SOSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emergencyTypes = [
    { type: "RESCUE", label: t("rescue"), icon: "🚑" },
    { type: "BOAT", label: t("boat"), icon: "🚤" },
    { type: "MEDICAL", label: t("medical"), icon: "🏥" },
    { type: "PEOPLE_TRAPPED", label: t("peopleTrapped"), icon: "👥" },
  ];

  const handleSend = async () => {
    if (!selectedType) return;
    setSending(true);
    setError(null);

    // Ensure we have location
    if (!location) {
      requestLocation();
    }

    try {
      const response = await api.createSOS({
        request_type: selectedType,
        latitude: location?.latitude,
        longitude: location?.longitude,
        message: message || undefined,
        network_status: isOnline ? "online" : "offline",
      });
      setSOSResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SOS");
    } finally {
      setSending(false);
    }
  };

  // If SOS was sent, show status screen
  if (sosResponse) {
    return (
      <div className="px-4 py-6 space-y-4 animate-fade-in">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200">
          <div className="text-6xl mb-4">
            {sosResponse.acknowledged ? "✅" : "📡"}
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {sosResponse.acknowledged ? t("sosAcknowledged") : t("sosSent")}
          </h2>
          <p className="text-slate-600 mt-2">{sosResponse.message}</p>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">SOS ID:</span>
              <span className="font-semibold">#{sosResponse.sos_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("networkStatus")}:</span>
              <span className="font-semibold">{isOnline ? "🟢 Online" : "🔴 Offline"}</span>
            </div>
            {sosResponse.location && (
              <div className="flex justify-between">
                <span className="text-slate-500">GPS:</span>
                <span className="font-semibold">
                  {sosResponse.location.latitude.toFixed(4)}, {sosResponse.location.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-primary text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-hover transition-colors"
        >
          {t("home")}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4 animate-fade-in">
      <div className="text-center">
        <div className="text-6xl mb-2">🆘</div>
        <h2 className="text-2xl font-bold text-slate-800">{t("sosTitle")}</h2>
      </div>

      {/* Emergency type selection */}
      <div className="space-y-3">
        <p className="font-semibold text-slate-700">{t("selectEmergencyType")}</p>
        <div className="grid grid-cols-2 gap-3">
          {emergencyTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(type.type)}
              className={`rounded-xl py-6 flex flex-col items-center gap-2 font-semibold transition-all border-2 ${
                selectedType === type.type
                  ? "border-danger bg-red-50 text-danger"
                  : "border-slate-200 bg-white text-slate-700 hover:border-danger"
              }`}
            >
              <span className="text-4xl">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional message */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t("messageOptional")}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
          rows={2}
          maxLength={200}
        />
      </div>

      {/* Location status */}
      <div className="bg-slate-50 rounded-xl p-3 text-sm flex items-center justify-between">
        <span className="text-slate-600">📍 GPS</span>
        <span className="font-semibold">
          {location ? "🟢 " + t("available2") : "🔴 " + t("selectLocation")}
        </span>
      </div>

      {/* Network status */}
      <div className="bg-slate-50 rounded-xl p-3 text-sm flex items-center justify-between">
        <span className="text-slate-600">{t("networkStatus")}</span>
        <span className="font-semibold">
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!selectedType || sending}
        className={`w-full rounded-xl py-5 font-bold text-lg transition-all emergency-btn ${
          selectedType && !sending
            ? "bg-danger text-white hover:bg-danger-hover animate-pulse-slow"
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
      >
        {sending ? "..." : `🆘 ${t("sendSOS")}`}
      </button>
    </div>
  );
}
