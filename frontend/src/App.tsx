/**
 * NEERKAVAL — நீர் காவல்
 * Main App component with routing
 */

import { HashRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./i18n/I18nContext";
import PublicLayout from "./layouts/PublicLayout";
import OfficerLayout from "./layouts/OfficerLayout";
import PublicHome from "./pages/PublicHome";
import PublicSafety from "./pages/PublicSafety";
import PublicShelter from "./pages/PublicShelter";
import PublicSOS from "./pages/PublicSOS";
import PublicWeather from "./pages/PublicWeather";
import PublicReport from "./pages/PublicReport";
import OfficerLogin from "./pages/OfficerLogin";
import OfficerDashboard from "./pages/OfficerDashboard";

function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/safety" element={<PublicSafety />} />
            <Route path="/shelter" element={<PublicShelter />} />
            <Route path="/sos" element={<PublicSOS />} />
            <Route path="/weather" element={<PublicWeather />} />
            <Route path="/report" element={<PublicReport />} />
          </Route>

          {/* Officer routes */}
          <Route path="/officer/login" element={<OfficerLogin />} />
          <Route element={<OfficerLayout />}>
            <Route path="/officer" element={<OfficerDashboard />} />
          </Route>
        </Routes>
      </HashRouter>
    </I18nProvider>
  );
}

export default App;
