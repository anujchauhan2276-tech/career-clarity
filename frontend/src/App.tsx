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
import { useAuth } from "./contexts/AuthContext";

const VALID_COUNTRIES = ["us", "in", "jp", "cn", "kr", "uk", "de", "es", "fr", "ru"];

function CountryPathGuard() {
  const { countryId } = useParams();
  if (!countryId || !VALID_COUNTRIES.includes(countryId)) {
    return <Navigate to="/setup" replace />;
  }
  return <CountryPath />;
}

// ✅ THE REAL FIX: This inner component reads authLoading and renders
// nothing until Firebase has fully resolved who the user is.
// Without this, the app renders with user=null first, then re-renders
// with user=adminUser — causing both UIs to briefly collide (the glitch).
function AppContent() {
  const { authLoading } = useAuth();

  // Block ALL rendering until Firebase auth is settled.
  // This is just a black screen for ~200-400ms on first load — imperceptible.
  if (authLoading) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="bg-black text-white font-sans selection:bg-purple-500/30 min-h-screen w-full relative">
      <Header />
      <main>
        <Routes>
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
          <Route path="/:countryId" element={<CountryPathGuard />} />
          <Route path="/:countryId/roadmap/:courseId" element={<RoadmapDetail />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ScrollToTop />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}