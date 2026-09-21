/**
 * Officer layout — desktop sidebar with auth guard
 */

import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { getAuthToken, setAuthToken } from "../services/api";
import { LayoutDashboard, LogOut, Shield } from "lucide-react";

export default function OfficerLayout() {
  const { t } = useI18n();
  const location = useLocation();
  const token = getAuthToken();

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/officer/login" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    setAuthToken(null);
    window.location.hash = "/officer/login";
  };

  const navItems = [
    { path: "/officer", icon: LayoutDashboard, label: t("dashboard") },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={28} />
            <div>
              <h1 className="text-lg font-bold">NEERKAVAL</h1>
              <p className="text-xs text-slate-400">Officer Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? "bg-primary text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
}
