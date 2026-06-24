import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 p-4 md:p-6 z-50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="text-sm text-gray-400 max-w-4xl">
        <strong className="text-white">We value your privacy.</strong> We use cookies to enhance your browsing experience, remember your regional language settings, and save your visual preferences (Dark/Light mode). By clicking "Accept All", you consent to our use of cookies.
      </div>
      <div className="flex gap-3 shrink-0 w-full md:w-auto">
        <button 
          onClick={acceptCookies} 
          className="w-full md:w-auto px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}