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
  MousePointer2,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

/**
 * ============================================================================
 * INTERFACES & TYPES
 * ============================================================================
 */

interface RoadmapStep {
  step: number;
  title: string;
  timeframe: string;
  difficulty: string;
  tools: string[];
  desc: string;
  milestones: string[];
  antiPatterns?: string[];
}

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
  roadmapSteps: RoadmapStep[];
}

/**
 * ============================================================================
 * SUB-COMPONENTS (For Clean Architecture & Length)
 * ============================================================================
 */

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-purple-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/30">{title}</h2>
    </div>
    <p className="text-white/10 text-xs font-medium ml-10 uppercase tracking-widest">{subtitle}</p>
  </div>
);

const Badge = ({ children, color = "purple" }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
  };
  return (
    <span className={`px-3 py-1 border rounded-full text-[10px] font-black tracking-widest uppercase ${colors[color]}`}>
      {children}
    </span>
  );
};

/**
 * ============================================================================
 * MAIN COMPONENT: RoadmapDetail
 * ============================================================================
 */

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

  // Sanitize the Base URL from .env to prevent double slashes
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  /**
   * DATA PARSING UTILITY
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
   * LOAD SAVED PROGRESS
   */
  useEffect(() => {
    if (user && decodedCourse) {
      const fetchProgress = async () => {
        try {
          const key = `user_progress_${user.uid}_${decodedCourse}`;
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            setCompletedSteps(parsed.completedSteps || []);
          }
        } catch (e: any) {
          console.error("Local persistence error");
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
   * LANGUAGE PREFERENCE
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
   * BACKEND SYNCHRONIZATION
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

        if (!res.ok) throw new Error();

        const safeLinks = (linksData: any) => {
          const arr = Array.isArray(linksData) ? linksData : [];
          return arr.map((l: any) => {
            if (typeof l === "string") return { name: "External Resource", url: l.startsWith("http") ? l : `https://${l}` };
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
            title: step.title || "Untitled Phase",
            timeframe: step.timeframe || "TBD",
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
    <div className="min-h-screen bg-[#020202] text-white pt-24 pb-40 selection:bg-purple-500/40 font-sans overflow-x-hidden">
      
      {/* 1. ELITE PROGRESS BAR */}
      <AnimatePresence>
        {data && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-white/5 backdrop-blur-md"
          >
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 shadow-[0_0_25px_rgba(168,85,247,0.6)]" 
             />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-12 max-w-6xl" ref={containerRef}>
        
        {/* Navigation */}
        <motion.button 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate(`/${countryId}`)} 
          className="flex items-center gap-3 text-white/30 hover:text-indigo-400 mb-16 transition-all group font-bold text-xs tracking-widest uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> 
          Explore All Pathways
        </motion.button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500/20" />
              <Loader2 className="w-16 h-16 animate-spin text-purple-500 absolute top-0 left-0 [animation-delay:0.2s]" />
            </div>
            <p className="mt-8 text-white/20 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Database</p>
          </div>
        ) : error ? (
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
           >
             <div className="w-28 h-28 bg-gradient-to-b from-white/10 to-transparent border border-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl">
                <Map className="w-12 h-12 text-white/10" />
             </div>
             <h2 className="text-4xl font-display font-bold mb-4 text-white/90">Pathway Restricted</h2>
             <p className="text-white/30 max-w-md mx-auto text-lg leading-relaxed font-light">
                We are currently curating the verified data for <strong>{decodedCourse}</strong>. Our experts update the database every 24 hours.
             </p>
           </motion.div>
        ) : data ? (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            
            {/* 2. MAGNIFICENT HERO SECTION */}
            <div className="mb-24 relative">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Badge color="purple">{countryId} Regional Insight</Badge>
                {progressPercent > 0 && <Badge color="green">{progressPercent}% Mastery</Badge>}
                <div className="h-px bg-white/5 flex-grow"></div>
                {supportsNative && (
                   <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/10">
                     <button onClick={() => setLanguage("English")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === 'English' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}>English</button>
                     <button onClick={() => setLanguage("Native")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === 'Native' ? "bg-indigo-600 text-white shadow-lg" : "text-white/40 hover:text-white"}`}>Native</button>
                   </div>
                )}
              </div>

              <motion.h1 
                className="text-5xl md:text-[7rem] font-display font-bold mb-10 tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/20"
              >
                {data.title}
              </motion.h1>
              
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl text-white/50 leading-relaxed font-light italic border-l-4 border-purple-500/30 pl-8 py-2">
                    {data.description}
                  </p>
                </div>
                <div className="w-full md:w-64 shrink-0 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Quick Stat
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    This path requires approximately <strong>{data.roadmapSteps.reduce((acc, curr) => acc + 100, 0)} hours</strong> of focused execution to reach a professional baseline in {countryId.toUpperCase()}.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. THE ARCHITECTURAL TIMELINE */}
            <div className="mb-40">
              <SectionHeader icon={Target} title="Mastery Path" subtitle="Chronological phases of professional development" />

              <div className="relative ml-4 md:ml-12 border-l border-white/10 space-y-24">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <motion.div 
                      key={i} 
                      viewport={{ once: true, margin: "-100px" }}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="relative pl-12 md:pl-20"
                    >
                      {/* Advanced Multi-state Toggle Node */}
                      <div className="absolute -left-[25px] md:-left-[29px] top-0 flex flex-col items-center group">
                        <button 
                          onClick={() => toggleStep(step.step)}
                          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 shadow-2xl ${
                            isCompleted 
                              ? "bg-green-500 border-green-400 rotate-[360deg] scale-110" 
                              : "bg-[#020202] border-white/10 hover:border-indigo-500 hover:scale-110"
                          }`}
                        >
                          {isCompleted ? <Check className="w-6 h-6 text-white" strokeWidth={4} /> : <span className="text-xs font-black text-white/20 group-hover:text-indigo-400">{i + 1}</span>}
                        </button>
                        <div className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent mt-2"></div>
                      </div>

                      {/* Content Card */}
                      <div className={`transition-all duration-1000 ease-out ${isCompleted ? "opacity-20 grayscale blur-[1px] pointer-events-none" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <span className="text-[11px] font-black tracking-[0.3em] uppercase text-indigo-500 bg-indigo-500/5 px-2 py-1 rounded">Module {step.step}</span>
                          <div className="flex items-center gap-2 text-white/30 font-mono text-[10px] bg-white/5 px-3 py-1 rounded-full border border-white/5">
                             <Clock className="w-3 h-3" /> {step.timeframe}
                          </div>
                          <Badge color={step.difficulty.toLowerCase().includes("expert") ? "orange" : "blue"}>{step.difficulty}</Badge>
                        </div>
                        
                        <h3 className="text-3xl md:text-5xl font-display font-bold mb-8 tracking-tight leading-[1.1]">{step.title}</h3>
                        
                        <p className="text-white/50 text-lg md:text-xl leading-relaxed mb-10 whitespace-pre-wrap font-light max-w-3xl">
                          {step.desc}
                        </p>

                        {/* Technology / Tool Pills */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-12">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-bold text-white/40 uppercase tracking-widest hover:text-indigo-400 hover:bg-indigo-500/5 transition-all cursor-default">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Context-Specific Checkpoints */}
                        <div className="grid md:grid-cols-2 gap-8">
                          {step.milestones.length > 0 && (
                            <div className="p-8 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[2rem] hover:border-indigo-500/20 transition-colors shadow-inner">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60 mb-6 flex items-center gap-3">
                                <Award className="w-4 h-4" /> Certification Milestones
                              </h4>
                              <ul className="space-y-5">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-base text-white/60 flex gap-4 leading-relaxed group/li">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover/li:scale-150 transition-transform"></div>
                                    <span className="flex-1 group-hover/li:text-white transition-colors">{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-8 bg-rose-500/[0.02] border border-rose-500/10 rounded-[2rem] hover:border-rose-500/20 transition-colors shadow-inner">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400/60 mb-6 flex items-center gap-3">
                                <ShieldAlert className="w-4 h-4" /> Strategic Pitfalls
                              </h4>
                              <ul className="space-y-5">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-base text-white/40 flex gap-4 leading-relaxed group/li italic">
                                    <span className="text-rose-900 font-black text-xl leading-none">×</span>
                                    <span className="flex-1 group-hover/li:text-white transition-colors">{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 4. MARKET ADVANTAGE GRID (PROS & CONS) */}
            <div className="mb-40">
              <SectionHeader icon={Sparkles} title="Career Equilibrium" subtitle="Analysis of ROI and operational overhead" />
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-10 md:p-16 bg-gradient-to-br from-emerald-500/[0.07] to-transparent border border-emerald-500/10 rounded-[3rem] shadow-3xl hover:border-emerald-500/30 transition-all duration-700">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      </div>
                      <h3 className="text-3xl font-display font-bold text-white">Competitive Advantages</h3>
                    </div>
                    <ul className="space-y-8">
                      {data.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-5 text-white/60 text-xl leading-relaxed group/pro">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-3 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover/pro:scale-125 transition-transform"></div> 
                          <span className="flex-1 group-hover/pro:text-white transition-colors">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-10 md:p-16 bg-gradient-to-br from-rose-500/[0.07] to-transparent border border-rose-500/10 rounded-[3rem] shadow-3xl hover:border-rose-500/30 transition-all duration-700">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-14 h-14 rounded-3xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-inner">
                        <XCircle className="w-7 h-7 text-rose-400" />
                      </div>
                      <h3 className="text-3xl font-display font-bold text-white">Potential Challenges</h3>
                    </div>
                    <ul className="space-y-8">
                      {data.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-5 text-white/60 text-xl leading-relaxed group/con">
                          <div className="w-2 h-2 rounded-full bg-rose-500 mt-3 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover/con:scale-125 transition-transform"></div> 
                          <span className="flex-1 group-hover/con:text-white transition-colors">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
              </div>
            </div>

            {/* 5. STRATEGIC MACRO DATA */}
            <div className="space-y-16">
              {/* Future Landscape */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-10 md:p-20 bg-white/[0.01] border border-white/5 rounded-[4rem] relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000">
                   <TrendingUp className="w-64 h-64" />
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-bold mb-10 text-indigo-200 tracking-tighter leading-none">Macro Trajectory</h3>
                <p className="text-2xl md:text-3xl text-white/40 leading-relaxed mb-16 font-light max-w-4xl">{data.future}</p>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex-1">
                     <div className="flex items-center gap-4 mb-4">
                       <Award className="w-5 h-5 text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/50">Market Arbitrage Opportunity</span>
                     </div>
                     <p className="text-indigo-200 text-xl md:text-2xl font-medium leading-relaxed italic">
                        "{data.opportunity}"
                     </p>
                  </div>
                </div>
              </motion.div>

              {/* Execution Strategy */}
              <div className="p-10 md:p-20 bg-[#080808] border border-white/5 rounded-[4rem] shadow-2xl">
                <SectionHeader icon={MousePointer2} title="Mastery Execution" subtitle="Standard operating procedures for initial entry" />
                <div className="grid gap-8 mb-20">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-start gap-10 p-8 bg-white/[0.02] rounded-[2.5rem] border border-transparent hover:border-white/10 transition-all group shadow-inner">
                      <span className="text-6xl md:text-8xl font-display font-black text-white/[0.03] group-hover:text-indigo-500/20 transition-all duration-700 leading-none select-none">0{i+1}</span>
                      <div className="pt-4">
                        <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed">{h}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Elite Tip */}
                <div className="p-10 md:p-14 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border border-amber-500/10 rounded-[3.5rem] flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.05),_transparent_50%)]"></div>
                  <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform duration-700">
                    <Lightbulb className="w-10 h-10 text-amber-500" />
                  </div>
                  <div className="relative z-10 text-center md:text-left">
                    <h4 className="text-amber-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4">Elite Industry Insight</h4>
                    <p className="text-amber-100/70 text-2xl md:text-3xl leading-tight font-display font-light whitespace-pre-wrap">
                      "{data.proTip}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. VERIFIED RESOURCES */}
              {data.links.length > 0 && (
                <div className="p-10 md:p-20 bg-black border border-white/5 rounded-[4rem] shadow-3xl">
                   <SectionHeader icon={LinkIcon} title="Knowledge Vault" subtitle="Curated list of mission-critical references" />
                   <div className="grid sm:grid-cols-2 gap-6">
                    {data.links.map((l, i) => (
                      <motion.a 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={i} 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all"
                      >
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                             <ExternalLink className="w-5 h-5 text-blue-400" />
                           </div>
                           <span className="text-lg font-bold text-white/40 group-hover:text-blue-400 transition-colors">{l.name}</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-blue-400 group-hover:translate-x-2 transition-all" />
                      </motion.a>
                    ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}