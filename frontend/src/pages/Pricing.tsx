import { Map, Layers, Bot, Globe, BookOpen } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">Simple, student-friendly pricing</h1>
          <p className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto leading-relaxed">
            Access the core roadmaps entirely for free. Regional pricing available for premium tiers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="p-10 rounded-3xl bg-[#0A0A0A] border border-white/10 relative overflow-hidden flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
            <div className="text-5xl font-display font-bold mb-6">$0<span className="text-lg text-gray-400 font-normal">/forever</span></div>
            <p className="text-gray-400 mb-8 h-12">All traditional paths, basic roadmaps, and community access.</p>
            
            <ul className="space-y-4 mb-10 flex-grow text-gray-300">
              <li className="flex items-center gap-3"><Map className="w-5 h-5 text-gray-400" /> <span>Country-specific data</span></li>
              <li className="flex items-center gap-3"><Layers className="w-5 h-5 text-gray-400" /> <span>Visual standard roadmaps</span></li>
            </ul>
            
            <button 
              onClick={() => window.location.href = "/setup"}
              className="w-full py-4 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition"
            >
              Get Started
            </button>
          </div>
          
          {/* Premium Tier */}
          <div className="p-10 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 text-white relative shadow-2xl flex flex-col">
            <div className="absolute top-6 right-6 px-3 py-1 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full uppercase tracking-wider">
              Coming Soon
            </div>
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-5xl font-display font-bold mb-6 text-yellow-400">$??<span className="text-lg text-gray-400 font-normal">/mo</span></div>
            <p className="text-gray-400 mb-8 h-12">Deep-dives, advanced academia (PhD/Masters), and high-level 1-on-1s.</p>
            
            <ul className="space-y-4 mb-10 text-gray-300 flex-grow">
              <li className="flex items-center gap-3"><Globe className="w-5 h-5 text-yellow-500" /> <span>Complete global mobility guide</span></li>
              <li className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-yellow-500" /> <span>Advanced Study Roadmaps (Ph.D, etc.)</span></li>
              <li className="flex items-center gap-3"><Layers className="w-5 h-5 text-yellow-500" /> <span>Modern & Entrepreneurial skills</span></li>
            </ul>
            
            <button disabled className="w-full py-4 rounded-xl font-semibold bg-white/10 text-white cursor-not-allowed hidden sm:block">
              Coming Soon
            </button>
            <button disabled className="w-full py-4 rounded-xl font-semibold bg-white/10 text-white cursor-not-allowed sm:hidden">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
