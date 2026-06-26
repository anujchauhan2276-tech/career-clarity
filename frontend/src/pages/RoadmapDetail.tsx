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
  ChevronRight
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

/**
 * Interface for the detailed Roadmap Data structure.
 * This matches the data returned by our Django Backend.
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

  /** 
   * SANITIZE API URL
   * Prevents the common //api double-slash bug if Vercel variable has a trailing slash.
   */
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  /**
   * PROGRESS TRACKING
   * Pulls checked steps from LocalStorage to keep user motivated.
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
          console.warn("Progress load failed silently.");
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
        lastUpdated: new Date().toISOString(),
      }));
    } catch (e: any) {}
  };

  /**
   * LANGUAGE LOGIC
   * Handles switching between Global English and the regional native language.
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
   * DATA FETCHING & PARSING
   * Communicates with Django, validates Token, and transforms plain text to UI Lists.
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

        const dataJson = await res.json();

        if (res.status === 403 && dataJson.is_locked) {
            navigate("/pricing", { replace: true });
            return;
        }

        if (!res.ok) throw new Error("Not found");

        /**
         * TEXT TO LIST PARSER
         * Converts Django Admin plain text (with or without dashes) into clean arrays.
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

        const safeLinks = (linksData: any) => {
          const arr = Array.isArray(linksData) ? linksData : [];
          return arr.map((l: any) => {
            if (typeof l === "string") return { name: "Resource", url: l.startsWith("http") ? l : `https://${l}` };
            return { name: l.name || "Resource Link", url: l.url || "#" };
          });
        };

        setData({
          title: dataJson.title || decodedCourse,
          description: dataJson.overview || "",
          future: dataJson.future_outlook || "",
          pros: parseTextToList(dataJson.pros),
          cons: parseTextToList(dataJson.cons),
          opportunity: dataJson.opportunity || "",
          howTo: parseTextToList(dataJson.how_to),
          proTip: dataJson.pro_tip || "",
          links: safeLinks(dataJson.links),
          roadmapSteps: (Array.isArray(dataJson.steps) ? dataJson.steps : []).map((step: any) => ({
            step: step.step_number || 1,
            title: step.title || "Phase",
            timeframe: step.timeframe || "",
            difficulty: step.difficulty || "Beginner",
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

  /**
   * PROGRESS CALCULATION
   */
  const progressPercent = data?.roadmapSteps.length 
    ? Math.round((completedSteps.length / data.roadmapSteps.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 selection:bg-purple-500/40">
      
      {/* 1. STICKY TOP PROGRESS BAR */}
      {data && !loading && !error && (
        <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-white/5">
           <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
            style={{ width: `${progressPercent}%` }}
           />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-4xl" ref={containerRef}>
        
        {/* Header Navigation */}
        <button 
          onClick={() => navigate(`/${countryId}`)} 
          className="flex items-center gap-2 text-white/30 hover:text-white mb-12 transition-all group font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Pathways
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-6" />
            <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">Analyzing Database</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
             <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                <Map className="w-12 h-12 text-white/10" />
             </div>
             <h2 className="text-3xl font-display font-bold mb-4 text-white/90">Roadmap Coming Soon</h2>
             <p className="text-white/40 max-w-sm mx-auto text-base leading-relaxed">
                We are currently building the comprehensive career architecture for <strong>{decodedCourse}</strong>.
             </p>
           </div>
        ) : data ? (
          <>
            {/* 2. HERO SECTION */}
            <div className="mb-20">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black tracking-widest uppercase text-purple-400">
                  {countryId.toUpperCase()} STRATEGY
                </div>
                {progressPercent > 0 && (
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black tracking-widest uppercase text-green-400">
                    {progressPercent}% COMPLETE
                  </div>
                )}
                <div className="h-px bg-white/5 flex-grow"></div>
                {supportsNative && (
                   <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)} 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase text-white/50 outline-none cursor-pointer hover:text-white transition-colors"
                   >
                     <option value="English">English</option>
                     <option value="Native">Native</option>
                   </select>
                )}
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold mb-8 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                {data.title}
              </h1>
              <p className="text-xl md:text-3xl text-white/50 leading-relaxed font-light max-w-3xl">
                {data.description}
              </p>
            </div>

            {/* 3. THE INTERACTIVE TIMELINE */}
            <div className="mb-32">
              <div className="flex items-center gap-4 mb-16">
                <Target className="w-6 h-6 text-purple-500" />
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-white/20">The Path to Mastery</h2>
              </div>

              <div className="relative ml-3 md:ml-8 border-l border-white/10 space-y-20">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <div key={i} className="relative pl-10 md:pl-16 group">
                      
                      {/* Timeline Connector Dot */}
                      <button 
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[21px] md:-left-[25px] top-0 w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-700 z-10 ${
                          isCompleted ? "bg-green-500 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] rotate-[360deg]" : "bg-[#0A0A0A] hover:border-purple-500 hover:scale-110"
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5 text-white" strokeWidth={4} /> : <div className="w-2 h-2 bg-white/20 rounded-full group-hover:bg-purple-500"></div>}
                      </button>

                      {/* Content Section */}
                      <div className={`transition-all duration-700 ease-in-out ${isCompleted ? "opacity-25 grayscale scale-[0.98] blur-[1px]" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="text-[11px] font-black tracking-[0.2em] uppercase text-purple-500">Phase 0{step.step}</span>
                          <div className="flex items-center gap-2 text-white/30 font-mono text-[10px]">
                             <Clock className="w-3 h-3" /> {step.timeframe}
                          </div>
                          <div className={`px-2 py-0.5 rounded border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest ${
                            step.difficulty.toLowerCase().includes("beginner") ? "text-green-500" : "text-orange-500"
                          }`}>
                            {step.difficulty}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl md:text-4xl font-display font-bold mb-6 tracking-tight group-hover:text-purple-100 transition-colors">
                          {step.title}
                        </h3>
                        
                        <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-8 whitespace-pre-wrap font-light">
                          {step.desc}
                        </p>

                        {/* Technology / Tool Pills */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-10">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white/60 hover:bg-white/5 transition-all">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Checkpoint Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {step.milestones.length > 0 && (
                            <div className="p-6 bg-blue-500/[0.03] border border-blue-500/10 rounded-[1.5rem] backdrop-blur-sm">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60 mb-5 flex items-center gap-3">
                                <Zap className="w-4 h-4" /> Hard Milestones
                              </h4>
                              <ul className="space-y-4">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-sm text-white/70 flex gap-3 leading-relaxed">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                    <span className="flex-1">{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-[1.5rem] backdrop-blur-sm">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/60 mb-5 flex items-center gap-3">
                                <ShieldAlert className="w-4 h-4" /> Strategy: Avoid
                              </h4>
                              <ul className="space-y-4">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-sm text-white/40 flex gap-3 leading-relaxed italic">
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
            </div>

            {/* 4. INSIGHTS SECTION (PROS & CONS) */}
            <div className="grid md:grid-cols-2 gap-8 mb-32">
                <div className="p-10 bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 rounded-[2.5rem] shadow-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-green-400">Competitive Advantages</h3>
                  </div>
                  <ul className="space-y-6">
                    {data.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-4 text-white/60 text-lg leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 shrink-0"></div> 
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-10 bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/10 rounded-[2.5rem] shadow-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-red-400">The Roadblocks</h3>
                  </div>
                  <ul className="space-y-6">
                    {data.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-4 text-white/60 text-lg leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 shrink-0"></div> 
                        <span className="flex-1">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>

            {/* 5. STRATEGIC DETAILS */}
            <div className="space-y-12 mb-20">
              {/* Future Landscape */}
              <div className="p-10 md:p-16 bg-[#080808] border border-white/5 rounded-[3rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                   <TrendingUp className="w-40 h-40" />
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-bold mb-8 text-purple-200 tracking-tight">Market Trajectory</h3>
                <p className="text-xl md:text-2xl text-white/50 leading-relaxed mb-12 font-light">{data.future}</p>
                <div className="inline-flex items-center gap-4 p-5 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                   <Award className="w-5 h-5 text-purple-400" />
                   <p className="text-purple-300 text-base md:text-lg font-medium">
                      {data.opportunity}
                   </p>
                </div>
              </div>

              {/* Entry Strategy */}
              <div className="p-10 md:p-16 bg-white/[0.01] border border-white/5 rounded-[3rem]">
                <h3 className="text-3xl md:text-5xl font-display font-bold mb-12 tracking-tight">Deployment Strategy</h3>
                <div className="grid gap-6 mb-16">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-center gap-8 p-6 bg-white/[0.02] rounded-[2rem] border border-transparent hover:border-white/10 transition-all group">
                      <span className="text-5xl font-display font-black text-white/[0.03] group-hover:text-purple-500/20 transition-colors">0{i+1}</span>
                      <p className="text-white/70 text-lg md:text-xl font-light">{h}</p>
                    </div>
                  ))}
                </div>
                
                {/* Pro Tip Box */}
                <div className="p-8 bg-yellow-500/[0.03] border border-yellow-500/10 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                    <Lightbulb className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-yellow-500 font-black tracking-[0.2em] uppercase text-[10px] mb-3">Principal Advisor Intelligence</h4>
                    <p className="text-yellow-100/70 text-xl md:text-2xl leading-relaxed italic font-light whitespace-pre-wrap">"{data.proTip}"</p>
                  </div>
                </div>
              </div>

              {/* 6. GLOBAL REFERENCES */}
              {data.links.length > 0 && (
                <div className="p-10 bg-black border border-white/5 rounded-[3rem]">
                   <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 mb-10 text-center">Verified Industry Resources</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                    {data.links.map((l, i) => (
                      <a 
                        key={i} 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <ExternalLink className="w-4 h-4 text-blue-400" />
                           </div>
                           <span className="font-bold text-white/40 group-hover:text-blue-400 transition-colors">{l.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                   </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}