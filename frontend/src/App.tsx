import { Routes, Route } from "react-router-dom";
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
import LoginPage from "./pages/LoginPage"; // FIX: Updated Import Name
import Register from "./pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ScrollToTop />
        <div className={`bg-black text-white font-sans selection:bg-purple-500/30 min-h-[100dvh]`}>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} /> {/* FIX: Updated Component */}
              <Route path="/register" element={<Register />} />
              <Route path="/learn-more" element={<LearnMore />} />
              <Route path="/process" element={<Process />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/:countryId" element={<CountryPath />} />
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