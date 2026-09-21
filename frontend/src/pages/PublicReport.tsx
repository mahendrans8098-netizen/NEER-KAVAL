/**
 * Public Report — Citizen hazard reporting
 * Simple tap-to-report with GPS attachment
 */

import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PublicReport() {
  const { t } = useI18n();
  const { location, requestLocation } = useGeolocation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { type: "FLOOD_WATER", label: t("floodWater"), icon: "🌊" },
    { type: "BRIDGE_BLOCKED", label: t("bridgeBlocked"), icon: "🌉" },
    { type: "ROAD_BLOCKED", label: t("roadBlocked"), icon: "🛣️" },
    { type: "TREE_FALL", label: t("treeFall"), icon: "🌳" },
    { type: "PEOPLE_TRAPPED", label: t("peopleTrappedReport"), icon: "🏠" },
    { type: "OTHER", label: t("other"), icon: "⚠️" },
  ];

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    setError(null);

    if (!location) {
      requestLocation();
    }

    try {
      await api.createReport({
        report_type: selectedType,
        latitude: location?.latitude,
        longitude: location?.longitude,
        description: description || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="px-4 py-6 space-y-4 animate-fade-in">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-slate-800">{t("reportSubmitted")}</h2>
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
        <div className="text-5xl mb-2">📢</div>
        <h2 className="text-xl font-bold text-slate-800">{t("reportHazard")}</h2>
      </div>

      {/* Report type selection */}
      <div className="grid grid-cols-2 gap-3">
        {reportTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => setSelectedType(type.type)}
            className={`rounded-xl py-5 flex flex-col items-center gap-2 font-semibold transition-all border-2 ${
              selectedType === type.type
                ? "border-primary bg-blue-50 text-primary"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary"
            }`}
          >
            <span className="text-3xl">{type.icon}</span>
            <span className="text-xs text-center">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Optional description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t("messageOptional")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
          rows={3}
          maxLength={300}
        />
      </div>

      {/* GPS status */}
      <div className="bg-slate-50 rounded-xl p-3 text-sm flex items-center justify-between">
        <span className="text-slate-600">📍 GPS</span>
        <span className="font-semibold">
          {location ? "🟢 " + t("available2") : "🔴 " + t("selectLocation")}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedType || submitting}
        className={`w-full rounded-xl py-4 font-bold text-lg transition-all ${
          selectedType && !submitting
            ? "bg-primary text-white hover:bg-primary-hover"
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
      >
        {submitting ? "..." : t("submitReport")}
      </button>
    </div>
  );
}
