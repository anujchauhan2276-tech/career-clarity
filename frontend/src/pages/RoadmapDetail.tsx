import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Check,
  Map,
  Zap,
  Target,
  ShieldAlert,
  Award,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MousePointer2
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

/**
 * Interface definition for the full Roadmap object.
 * This version is built to handle heavy data without visual clutter.
 */
interface RoadmapData {
  title: string;
  description: string;
  future: string;
  pros: string[];
  cons: string[];
  opportunity: string;
  howTo: string[];
  proTip: string;
  links: { name: string; url: string }[];
  roadmapSteps: { 
    step: number; 
    title: string; 
    timeframe: string; 
    tools: string[]; 
    desc: string;
    milestones: string[];
    antiPatterns?: string[];
    difficulty: string;
  }[];
}

export default function RoadmapDetail() {
  const { countryId, courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlLang = searchParams.get("lang") as "Native" | "English" | null;

  const { user, getToken } = useAuth();
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const decodedCourse = courseId ? decodeURIComponent(courseId) : "";
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  /**
   * DATA PARSING UTILITY
   * Transforms raw text from Django Admin into clean UI components.
   */
  const parseTextToList = (item: any): string[] => {
    if (Array.isArray(item)) return item;
    if (typeof item === "string") {
      return item
        .split('\n')
        .map(line => line.trim())
        .map(line => line.replace(/^[•\-\*\d\.]+\s*/, ''))
        .filter(line => line.length > 0);
    }
    return [];
  };

  /**
   * SYNC USER PROGRESS
   */
  useEffect(() => {
    if (user && decodedCourse) {
      const fetchProgress = async () => {
        try {
          const key = `user_progress_${user.uid}_${decodedCourse}`;
          const val = localStorage.getItem(key);
          if (val) {
            const data = JSON.parse(val);
            setCompletedSteps(data.completedSteps || []);
          }
        } catch (e: any) {
          console.warn("Local storage sync error.");
        }
      };
      fetchProgress();
    }
  }, [user, decodedCourse]);

  const toggleStep = async (stepNum: number) => {
    if (!user) return; 
    const newCompleted = completedSteps.includes(stepNum) 
      ? completedSteps.filter((s) => s !== stepNum) 
      : [...completedSteps, stepNum];
    
    setCompletedSteps(newCompleted);

    try {
      const key = `user_progress_${user.uid}_${decodedCourse}`;
      localStorage.setItem(key, JSON.stringify({ 
        completedSteps: newCompleted, 
        lastUpdated: new Date().toISOString() 
      }));
    } catch (e: any) {}
  };

  /**
   * THEME & LANGUAGE HANDLING
   */
  const supportsNative = ["es", "de", "fr", "cn", "jp", "kr", "ru", "in"].includes(countryId || "");
  const [language, setLanguage] = useState<"Native" | "English">(urlLang || "English");

  useEffect(() => {
    if (urlLang !== language) {
      const params = new URLSearchParams(searchParams);
      params.set("lang", language);
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [language, navigate, searchParams, urlLang]);

  /**
   * CORE FETCH LOGIC
   */
  useEffect(() => {
    if (!decodedCourse) return;

    const fetchRoadmap = async () => {
      setLoading(true);
      setError(false);

      try {
        const token = await getToken();

        const res = await fetch(`${apiBase}/api/roadmap/get/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            courseId: decodedCourse,
            countryId: countryId,
            language: language === "Native" ? "Native" : "English"
          }),
        });

        if (!res.ok) throw new Error("Database miss.");
        const dataJson = await res.json();

        if (res.status === 403 && dataJson.is_locked) {
            navigate("/pricing", { replace: true });
            return;
        }

        setData({
          title: dataJson.title || decodedCourse,
          description: dataJson.overview || "",
          future: dataJson.future_outlook || "",
          pros: parseTextToList(dataJson.pros),
          cons: parseTextToList(dataJson.cons),
          opportunity: dataJson.opportunity || "",
          howTo: parseTextToList(dataJson.how_to),
          proTip: dataJson.pro_tip || "",
          links: Array.isArray(dataJson.links) ? dataJson.links : [],
          roadmapSteps: (Array.isArray(dataJson.steps) ? dataJson.steps : []).map((step: any) => ({
            step: step.step_number || 1,
            title: step.title || "Untitled Phase",
            timeframe: step.timeframe || "",
            difficulty: step.difficulty || "Standard",
            tools: parseTextToList(step.tools),
            desc: step.description || "",
            milestones: parseTextToList(step.milestones),
            antiPatterns: parseTextToList(step.anti_patterns),
          })),
        });

      } catch (err: any) {
        setError(true);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchRoadmap();
  }, [decodedCourse, user, language, countryId, navigate, getToken, apiBase]);

  if (!countryId || !courseId) return <Navigate to="/setup" replace />;

  const progressPercent = data?.roadmapSteps.length 
    ? Math.round((completedSteps.length / data.roadmapSteps.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#020202] text-white pt-24 pb-32">
      
      {/* 1. ELITE TOP PROGRESS TRACKER */}
      {data && !loading && !error && (
        <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-white/5">
           <div 
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 transition-all duration-1000 ease-in-out shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
            style={{ width: `${progressPercent}%` }}
           />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-8 max-w-6xl" ref={containerRef}>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-16">
          <button 
            onClick={() => navigate(`/${countryId}`)} 
            className="flex items-center gap-2 text-white/30 hover:text-white transition-all group font-bold text-xs tracking-widest uppercase"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          
          {supportsNative && (
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
               <button onClick={() => setLanguage("English")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'English' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>EN</button>
               <button onClick={() => setLanguage("Native")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${language === 'Native' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}>NATIVE</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6" />
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Data</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="w-24 h-24 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-2xl">
                <Map className="w-12 h-12 text-white/5" />
             </div>
             <h2 className="text-4xl font-display font-bold mb-4 text-white/90 tracking-tight">Curriculum Pending</h2>
             <p className="text-white/30 max-w-sm mx-auto text-lg font-light leading-relaxed">
                This specific pathway for <strong>{decodedCourse}</strong> is currently being verified by our industry leads.
             </p>
           </div>
        ) : data ? (
          <>
            {/* 2. HERO AREA */}
            <header className="mb-24 md:mb-32 max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-indigo-400">
                    Regional Blueprint: {countryId}
                 </div>
                 {progressPercent === 100 && (
                   <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-green-400 flex items-center gap-2">
                     <Award className="w-3 h-3" /> Mastered
                   </div>
                 )}
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold mb-10 tracking-tighter leading-[0.9] text-white">
                {data.title}
              </h1>
              <p className="text-xl md:text-3xl text-white/40 leading-relaxed font-light max-w-3xl">
                {data.description}
              </p>
            </header>

            {/* 3. CORE TIMELINE */}
            <section className="mb-40">
              <div className="flex items-center gap-6 mb-20">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                   <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20 mb-1">Chronological Order</h2>
                   <p className="text-xl font-display font-bold text-white/80">Step-by-Step Execution Plan</p>
                </div>
              </div>

              <div className="relative ml-4 md:ml-12 border-l border-white/5 space-y-24">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <div key={i} className="relative pl-12 md:pl-20 group">
                      
                      {/* Interactive Button */}
                      <button 
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[21px] md:-left-[25px] top-0 w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-700 z-20 overflow-hidden ${
                          isCompleted 
                            ? "bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.5)] rotate-[360deg]" 
                            : "bg-[#020202] hover:border-indigo-500 hover:scale-110"
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5 text-white" strokeWidth={4} /> : <div className="w-2 h-2 bg-white/10 rounded-full group-hover:bg-indigo-500 transition-colors"></div>}
                      </button>

                      {/* Content Layout */}
                      <div className={`transition-all duration-1000 ease-in-out ${isCompleted ? "opacity-20 grayscale scale-[0.97] blur-[2px]" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="text-[11px] font-black tracking-widest uppercase text-indigo-500">Stage 0{step.step}</span>
                          <div className="flex items-center gap-2 text-white/20 font-mono text-[10px] uppercase tracking-tighter">
                             <Clock className="w-3 h-3" /> {step.timeframe}
                          </div>
                          <div className="px-2 py-0.5 rounded-md border border-white/5 bg-white/5 text-[9px] font-black uppercase text-white/30">{step.difficulty}</div>
                        </div>
                        
                        <h3 className="text-3xl md:text-5xl font-display font-bold mb-8 tracking-tight leading-tight">
                          {step.title}
                        </h3>
                        
                        <p className="text-white/50 text-lg md:text-2xl leading-relaxed mb-10 font-light max-w-4xl">
                          {step.desc}
                        </p>

                        {/* Tools / Assets */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-12">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white/60 transition-all">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Detail Grids */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {step.milestones.length > 0 && (
                            <div className="p-8 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[2rem]">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/40 mb-6 flex items-center gap-3">
                                <Target className="w-4 h-4" /> Benchmarks
                              </h4>
                              <ul className="space-y-4">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-base text-white/60 flex gap-4 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                    <span className="flex-1">{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-8 bg-red-500/[0.01] border border-red-500/10 rounded-[2rem]">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400/40 mb-6 flex items-center gap-3">
                                <ShieldAlert className="w-4 h-4" /> Risks & Pitfalls
                              </h4>
                              <ul className="space-y-4">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-base text-white/40 flex gap-4 leading-relaxed italic">
                                    <span className="text-red-900 font-bold">×</span>
                                    <span className="flex-1">{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. BALANCED ANALYSIS (PROS & CONS) */}
            <div className="grid md:grid-cols-2 gap-8 mb-40">
                <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[3rem] shadow-3xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                      <CheckCircle2 className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white/90 leading-none">The Advantages</h3>
                        <p className="text-xs text-white/20 uppercase tracking-widest mt-2">Why pursue this path?</p>
                    </div>
                  </div>
                  <ul className="space-y-8">
                    {data.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-5 text-white/40 text-lg md:text-xl leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-green-500 mt-3 shrink-0"></div> 
                        <span className="flex-1 font-light">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[3rem] shadow-3xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                      <XCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white/90 leading-none">The Realities</h3>
                        <p className="text-xs text-white/20 uppercase tracking-widest mt-2">What are the hurdles?</p>
                    </div>
                  </div>
                  <ul className="space-y-8">
                    {data.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-5 text-white/40 text-lg md:text-xl leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-red-500 mt-3 shrink-0"></div> 
                        <span className="flex-1 font-light">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>

            {/* 5. STRATEGIC DEEP DIVE */}
            <div className="space-y-20 mb-40">
              
              {/* Industry Future */}
              <div className="p-10 md:p-20 bg-gradient-to-br from-[#0A0A0A] to-transparent border border-white/5 rounded-[4rem] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5">
                   <TrendingUp className="w-80 h-80" />
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-bold mb-10 text-white tracking-tighter">Industry Evolution</h3>
                <p className="text-xl md:text-3xl text-white/40 leading-relaxed mb-12 font-light max-w-4xl">{data.future}</p>
                <div className="p-8 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/20 inline-flex items-center gap-6">
                   <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-white" />
                   </div>
                   <p className="text-indigo-200 text-lg md:text-2xl font-medium tracking-tight">
                      <span className="text-white/20 mr-2 uppercase tracking-[0.2em] text-[10px] font-black block mb-1">High-Yield Opportunity</span> 
                      {data.opportunity}
                   </p>
                </div>
              </div>

              {/* Start Sequence */}
              <div className="p-10 md:p-20 bg-white/[0.01] border border-white/5 rounded-[4rem]">
                <h3 className="text-4xl md:text-6xl font-display font-bold mb-16 tracking-tighter text-white">Starting Sequence</h3>
                <div className="grid gap-8 mb-20">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-start md:items-center gap-10 p-8 bg-white/[0.02] rounded-[2.5rem] border border-transparent hover:border-white/10 transition-all group">
                      <span className="text-7xl font-display font-black text-white/[0.02] group-hover:text-indigo-500/20 transition-colors duration-700">0{i+1}</span>
                      <p className="text-white/60 text-xl md:text-3xl font-light tracking-tight">{h}</p>
                    </div>
                  ))}
                </div>
                
                {/* Advisor Tip */}
                <div className="p-10 bg-yellow-500/[0.03] border border-yellow-500/10 rounded-[3rem] flex flex-col md:flex-row gap-10 items-start md:items-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-yellow-500/10 flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(234,179,8,0.15)] border border-yellow-500/20">
                    <Lightbulb className="w-10 h-10 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-yellow-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4">Strategic Advisor Intelligence</h4>
                    <p className="text-yellow-100/70 text-2xl md:text-4xl leading-snug italic font-light whitespace-pre-wrap tracking-tight">"{data.proTip}"</p>
                  </div>
                </div>
              </div>

              {/* 6. VERIFIED LINKS */}
              {data.links.length > 0 && (
                <div className="p-12 bg-black border border-white/5 rounded-[4rem]">
                   <h3 className="text-[10px] font-black tracking-[0.5em] uppercase text-white/20 mb-12 text-center">Reference Infrastructure</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                    {data.links.map((l, i) => (
                      <a 
                        key={i} 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] group hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all"
                      >
                        <div className="flex items-center gap-6 overflow-hidden">
                           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-500">
                             <ExternalLink className="w-5 h-5 text-white/20 group-hover:text-indigo-400" />
                           </div>
                           <span className="font-bold text-xl text-white/40 group-hover:text-white transition-colors truncate">{l.name}</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/5 group-hover:text-indigo-400 group-hover:translate-x-2 transition-all" />
                      </a>
                    ))}
                   </div>
                </div>
              )}
            </div>

            {/* Footer Sign-off */}
            <div className="text-center py-20 border-t border-white/5">
                <p className="text-white/20 text-[10px] font-black tracking-[0.3em] uppercase mb-4">End of Roadmap</p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <MousePointer2 className="w-6 h-6" />
                </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}