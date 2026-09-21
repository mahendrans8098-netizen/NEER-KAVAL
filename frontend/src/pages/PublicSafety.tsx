/**
 * Public Safety — Safe route and evacuation guidance
 * Shows route to safety with landmark-based instructions
 */

import { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { api, type SafeRoute, type Shelter } from "../services/api";
import { Navigation, Clock, AlertTriangle, ArrowUp } from "lucide-react";

const DEFAULT_LOCATION = { lat: 11.0168, lon: 76.9558 };

export default function PublicSafety() {
  const { t, lang } = useI18n();
  const { location } = useGeolocation();
  const [route, setRoute] = useState<SafeRoute | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coords = location
    ? { lat: location.latitude, lon: location.longitude }
    : DEFAULT_LOCATION;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shelterData = await api.getNearbyShelters(coords.lat, coords.lon);
        setShelters(shelterData.shelters);

        // If there's an open shelter, compute route to nearest one
        const openShelter = shelterData.shelters.find((s) => s.status === "OPEN");
        if (openShelter) {
          const routeData = await api.getSafeRoute(
            coords.lat, coords.lon,
            openShelter.latitude, openShelter.longitude
          );
          setRoute(routeData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load route");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [coords.lat, coords.lon]);

  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800">🧭 {t("goToSafety")}</h2>

      {/* Route info */}
      {route && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          {/* Route status warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 font-semibold">⚠️ {route.warning}</p>
          </div>

          {/* Distance and time */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <Navigation size={24} className="mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-slate-800">{route.distance_km}</p>
              <p className="text-xs text-slate-500">km</p>
            </div>
            <div className="text-center">
              <Clock size={24} className="mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-slate-800">{route.estimated_walk_time_min}</p>
              <p className="text-xs text-slate-500">min {t("goToSafety")}</p>
            </div>
          </div>

          {/* Route segments */}
          <div className="space-y-3">
            {route.segments.map((seg, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <ArrowUp size={20} className="text-primary" />
                  {i < route.segments.length - 1 && <div className="w-0.5 h-8 bg-slate-200" />}
                </div>
                <div className="flex-1 pb-2">
                  <p className="font-semibold text-slate-800">
                    {lang === "ta" ? seg.instruction_ta : seg.instruction_en}
                  </p>
                  {seg.distance_km > 0 && (
                    <p className="text-sm text-slate-500">{seg.distance_km} km</p>
                  )}
                  {seg.hazard_type && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle size={14} />
                      {seg.hazard_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Nearby hazards */}
          {route.nearby_hazards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="font-semibold text-sm text-slate-700 mb-2">⚠️ {t("whyDanger")}</p>
              {route.nearby_hazards.map((hazard, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-red-600 mb-1">
                  <AlertTriangle size={16} />
                  <span>{hazard.hazard_type} — {hazard.distance_km} km</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No route available */}
      {!route && shelters.length === 0 && (
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200">
          <div className="text-4xl mb-3">🧭</div>
          <p className="font-bold text-slate-800">{t("noShelter")}</p>
          <p className="text-sm text-slate-600 mt-2">{t("noShelterDesc")}</p>
        </div>
      )}

      {/* Direction indicators for rural navigation */}
      <div className="bg-primary text-white rounded-xl p-4 text-center">
        <p className="text-sm font-semibold mb-3">{t("whatToDo")}</p>
        <div className="flex justify-center gap-4 text-4xl">
          <span>⬆️</span>
          <span>↰</span>
          <span>↱</span>
        </div>
        <p className="text-xs mt-3 opacity-90">
          {lang === "ta"
            ? "பள்ளி இருக்கும் பக்கம் செல்லுங்கள். கோவில் அருகில் திரும்புங்கள். மேடான இடத்திற்கு செல்லுங்கள்."
            : "Go toward the school. Turn near the temple. Move to higher ground."}
        </p>
      </div>
    </div>
  );
}
