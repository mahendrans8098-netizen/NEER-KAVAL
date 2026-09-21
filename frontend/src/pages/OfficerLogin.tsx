/**
 * Officer Login — Authentication for officer access
 */

import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { api, setAuthToken } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Shield, User, Lock, AlertCircle } from "lucide-react";

export default function OfficerLogin() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.login(username, password);
      setAuthToken(response.access_token);
      navigate("/officer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield size={48} className="mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold text-white">NEERKAVAL</h1>
          <p className="text-sm text-slate-400 mt-1">{t("officerLogin")}</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              {t("username")}
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                placeholder={t("username")}
                required
                data-testid="input-username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              {t("password")}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                placeholder={t("password")}
                required
                data-testid="input-password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-900/50 border border-red-700 rounded-lg p-3">
              <AlertCircle size={18} className="text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-3 font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
            data-testid="button-login"
          >
            {loading ? "..." : t("login")}
          </button>

          {/* Demo credentials hint */}
          <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Demo Credentials:</p>
            <p>Officer: officer / neerkaval123</p>
            <p>Admin: admin / neerkaval123</p>
          </div>
        </form>

        <div className="text-center mt-4">
          <a href="#/" className="text-sm text-slate-400 hover:text-primary">
            ← {t("home")}
          </a>
        </div>
      </div>
    </div>
  );
}
