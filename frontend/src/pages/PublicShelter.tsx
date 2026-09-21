/**
 * Public Shelter — Find nearby shelters
 * Shows distance, capacity, status, and route
 */

import { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { api, type Shelter } from "../services/api";
import { MapPin, Navigation, Users, Cross, Droplet, Utensils } from "lucide-react";

const DEFAULT_LOCATION = { lat: 11.0168, lon: 76.9558 };

export default function PublicShelter() {
  const { t, lang } = useI18n();
  const { location, status, requestLocation } = useGeolocation();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const coords = location
    ? { lat: location.latitude, lon: location.longitude }
    : DEFAULT_LOCATION;

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const data = await api.getNearbyShelters(coords.lat, coords.lon);
        setShelters(data.shelters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shelters");
      } finally {
        setLoading(false);
      }
    };
    fetchShelters();
  }, [coords.lat, coords.lon]);

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800">{t("shelterNearby")}</h2>

      {/* Location indicator */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={18} className="text-primary" />
        <span>
          {location
            ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : t("yourLocation")}
        </span>
        {status === "denied" && (
          <button onClick={requestLocation} className="text-primary font-semibold underline">
            {t("selectLocation")}
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* No shelters */}
      {!loading && !error && shelters.length === 0 && (
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200">
          <div className="text-4xl mb-3">🏠</div>
          <p className="font-bold text-slate-800">{t("noShelter")}</p>
          <p className="text-sm text-slate-600 mt-2">{t("noShelterDesc")}</p>
        </div>
      )}

      {/* Shelter list */}
      <div className="space-y-3">
        {shelters.map((shelter) => (
          <div
            key={shelter.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  🏠 {lang === "ta" && shelter.name_ta ? shelter.name_ta : shelter.name}
                </h3>
                {shelter.is_demo && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                    {t("demoData")}
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold ${
                shelter.status === "OPEN" ? "text-safe" : shelter.status === "FULL" ? "text-danger" : "text-slate-500"
              }`}>
                {shelter.status === "OPEN" ? t("open") : shelter.status === "FULL" ? t("full") : t("closed")}
              </span>
            </div>

            {shelter.status === "OPEN" && (
              <>
                {/* Distance and time */}
                <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Navigation size={16} />
                    {shelter.distance_km} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {shelter.available_spaces} {t("available")}
                  </span>
                </div>

                {/* Amenities */}
                <div className="flex items-center gap-3 mb-3 text-xs">
                  {shelter.has_medical && (
                    <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full">
                      <Cross size={14} /> {t("medicalSupport")}
                    </span>
                  )}
                  {shelter.has_water && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      <Droplet size={14} /> {t("water")}
                    </span>
                  )}
                  {shelter.has_food && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <Utensils size={14} /> {t("food")}
                    </span>
                  )}
                </div>

                {/* Go there button */}
                <button className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-hover transition-colors">
                  {t("goThere")}
                </button>
              </>
            )}

            {shelter.status === "FULL" && (
              <p className="text-sm text-slate-500">{t("full")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
