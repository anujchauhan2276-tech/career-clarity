import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import CountryPath from "./pages/CountryPath";
import RoadmapDetail from "./pages/RoadmapDetail";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Process from "./pages/Process";
import LearnMore from "./pages/LearnMore";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";

// ✅ FIX: Guard that validates countryId BEFORE CountryPath ever mounts.
// Previously, /:countryId would match paths like /pricing or /login on
// re-renders triggered by auth state changes (e.g. admin login), causing
// CountryPath to mount with an invalid countryId and collide with the
// correct page — producing the glitch you saw.
const VALID_COUNTRIES = ["us", "in", "jp", "cn", "kr", "uk", "de", "es", "fr", "ru"];

function CountryPathGuard() {
  const { countryId } = useParams();
  if (!countryId || !VALID_COUNTRIES.includes(countryId)) {
    return <Navigate to="/setup" replace />;
  }
  return <CountryPath />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ScrollToTop />
        <div className="bg-black text-white font-sans selection:bg-purple-500/30 min-h-screen w-full relative">
          <Header />
          <main>
            <Routes>
              {/* ✅ All named routes come first so they are never shadowed by /:countryId */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/learn-more" element={<LearnMore />} />
              <Route path="/process" element={<Process />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />

              {/* ✅ Dynamic country routes — guarded so only valid country codes mount CountryPath */}
              <Route path="/:countryId" element={<CountryPathGuard />} />
              <Route path="/:countryId/roadmap/:courseId" element={<RoadmapDetail />} />
            </Routes>
          </main>
          <Footer />
          <CookieBanner />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}