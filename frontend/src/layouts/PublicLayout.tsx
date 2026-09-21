/**
 * Public layout — mobile-first with bottom navigation
 * Includes language toggle and offline indicator
 */

import { Outlet } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { Link, useLocation } from "react-router-dom";
import { Home, Navigation, Building, LifeBuoy, MoreHorizontal, WifiOff } from "lucide-react";

export default function PublicLayout() {
  const { lang, setLang, t } = useI18n();
  const { isOnline } = useNetworkStatus();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: t("home") },
    { path: "/safety", icon: Navigation, label: t("safety") },
    { path: "/shelter", icon: Building, label: t("shelter") },
    { path: "/sos", icon: LifeBuoy, label: t("sos") },
    { path: "/report", icon: MoreHorizontal, label: t("more") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="text-2xl">💧</div>
          <div>
            <h1 className="text-lg font-bold leading-none">NEERKAVAL</h1>
            <p className="text-xs opacity-90 leading-none mt-1">{t("appName")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="flex items-center gap-1 text-xs bg-red-600 px-2 py-1 rounded-full">
              <WifiOff size={14} />
              {t("offlineMode")}
            </span>
          )}
          <button
            onClick={() => setLang(lang === "ta" ? "en" : "ta")}
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
            aria-label="Switch language"
          >
            {lang === "ta" ? "EN" : "த"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-slate-500"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
