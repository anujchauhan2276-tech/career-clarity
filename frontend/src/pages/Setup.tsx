import { useNavigate } from "react-router-dom";
import { Globe2 } from "lucide-react";

const COUNTRIES = [
  { id: "us", name: "United States" },
  { id: "in", name: "India" },
  { id: "jp", name: "Japan" },
  { id: "cn", name: "China" },
  { id: "kr", name: "South Korea" },
  { id: "uk", name: "United Kingdom" },
  { id: "de", name: "Germany" },
  { id: "es", name: "Spain" },
  { id: "fr", name: "France" },
  { id: "ru", name: "Russia" },
];

export default function Setup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-12 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
          <h1 className="text-4xl font-display font-bold mb-4">
            Customize your experience
          </h1>
          <p className="text-white/60">
            Select your regional context. Career Clarity adapts roadmaps and
            educational terms based on your selection.
          </p>
        </div>

        <div className="space-y-12">
          {/* Country Selection */}
          <div className="bg-[#111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Globe2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Target Region</h2>
            </div>

            {/* FIX: 'grid-cols-2' strictly forces 2 items per row on mobile screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {COUNTRIES.map((country) => (
                <button
                  key={country.id}
                  onClick={() => navigate(`/${country.id}`)}
                  className="w-full min-h-[100px] sm:min-h-[120px] p-3 rounded-xl border border-white/20 text-white hover:border-purple-500/80 bg-[#1A1A1A] hover:bg-[#2A2A2A] hover:shadow-lg hover:shadow-purple-500/30 text-sm md:text-base font-semibold transition-all duration-300 flex flex-col items-center justify-center text-center"
                >
                  <span className="leading-tight break-words">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}