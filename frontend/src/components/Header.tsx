import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogIn, Crown, Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  // FIX: Removed setLoginModalOpen
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage = location.pathname === "/";
  const isPricingPage = location.pathname === "/pricing";

  return (
    <header className={cn(
      "absolute top-0 left-0 w-full z-40 py-5 border-b transition-colors",
      isHomePage ? "bg-black/95 backdrop-blur-md border-white/10 text-white" : 
      isPricingPage ? "bg-black/95 backdrop-blur-md border-white/10 text-white" :
      "bg-transparent border-transparent text-white"
    )}>
      <div className="w-full px-4 lg:px-8 flex items-center justify-between">
        
        {/* Logo & Name */}
        <div className="flex items-center gap-3">
          {isHomePage && (
            <button 
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-white/10 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
               <img src="/src/assets/images/career_clarity_logo_1779860461640.png" className="w-full h-full object-cover mix-blend-multiply" alt="Career Clarity Logo" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl tracking-wide hidden sm:block">Career Clarity</span>
          </Link>
        </div>
        
        {/* Navigation Middle */}
        {isHomePage && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80 absolute left-1/2 -translate-x-1/2">
            <Link to="/learn-more" className="hover:text-white transition-colors">Learn More</Link>
            <Link to="/process" className="hover:text-white transition-colors">Process</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <a href="#feedback" className="hover:text-white transition-colors">Feedback</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
          </nav>
        )}
        
        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* THEME TOGGLE BUTTON */}
          <button 
            onClick={toggleTheme} 
            className="p-2 text-white/70 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            title="Toggle Light/Dark Mode"
          >
             {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!isPricingPage && (
            <button 
              onClick={() => navigate("/pricing")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-semibold text-xs md:text-sm transition-colors"
            >
              <Crown className="w-4 h-4" />
              Premium
            </button>
          )}
          
          {user ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                className={cn("flex items-center gap-2 px-2 py-1 rounded-full transition-colors focus:outline-none",
                  "bg-white/10 hover:bg-white/20"
                )}
              >
                <img 
                  src={user.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.name + "&backgroundColor=transparent"} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
                />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#111] rounded-xl border border-white/10 py-2 z-50 shadow-xl exclude-invert">
                   <div className="px-4 py-2 border-b border-white/10 mb-2">
                     <p className="text-sm font-medium text-white truncate">{user.name}</p>
                   </div>
                   <button 
                     onClick={() => {
                        logout();
                        setProfileOpen(false);
                     }}
                     className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors font-medium"
                   >
                     Logout
                   </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              // FIX: Now securely routes to the /login page
              onClick={() => navigate('/login')}
              className={cn("flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm transition-colors",
                "bg-white text-black hover:bg-white/90"
              )}
            >
              <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isHomePage && mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 py-4 px-6 flex flex-col gap-4 shadow-2xl">
          <Link to="/learn-more" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium text-lg py-2 border-b border-white/5">Learn More</Link>
          <Link to="/process" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium text-lg py-2 border-b border-white/5">Process</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium text-lg py-2 border-b border-white/5">Pricing</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium text-lg py-2 border-b border-white/5">About Us</Link>
          <a href="#feedback" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium text-lg py-2">Feedback</a>
        </div>
      )}
    </header>
  );
}