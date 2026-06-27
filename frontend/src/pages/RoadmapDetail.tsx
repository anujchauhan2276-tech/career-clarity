import { useState, useEffect, useRef, useMemo } from "react";
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
  Info,
  Layers,
  Layout,
  Compass,
  Trophy,
  AlertCircle,
  Flame,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

/**
 * ============================================================================
 * DATA CONTRACTS & INTERFACES
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
 * SUB-COMPONENTS: ATOMIC UI ELEMENTS
 * ============================================================================
 */

const SectionTitle = ({ icon: Icon, title, subtitle, glowColor }: { icon: any, title: string, subtitle: string, glowColor: string }) => (
  <div className="relative mb-12">
    <div className={`absolute -left-10 top-0 w-20 h-20 blur-[50px] opacity-20 rounded-full ${glowColor}`} />
    <div className="flex items-center gap-4 mb-2">
      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white/90">{title}</h2>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20">{subtitle}</span>
      </div>
    </div>
  </div>
);

const CustomPill = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
  <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
    {children}
  </span>
);

/**
 * ============================================================================
 * MAIN COMPONENT: ROADMAP DETAIL
 * ============================================================================
 */

export default function RoadmapDetail() {
  // HOOKS
  const { countryId, courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlLang = searchParams.get("lang") as "Native" | "English" | null;

  // AUTH & STATE
  const { user, getToken } = useAuth();
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // REFS & URLS
  const containerRef = useRef<HTMLDivElement>(null);
  const decodedCourse = courseId ? decodeURIComponent(courseId) : "";
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  /**
   * LOGIC: PARSING ENGINE
   * Specifically built to handle your new text-only entry method in Django Admin.
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
   * PERSISTENCE: LOADING PROGRESS
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
          console.error("Local persistence failed.");
        }
      };
      fetchProgress();
    }
  }, [user, decodedCourse]);

  /**
   * INTERACTION: TICKING SYSTEM
   */
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
    } catch (e: any) {
      console.warn("Storage write error");
    }
  };

  /**
   * LOCALIZATION LOGIC
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
   * SERVER COMMUNICATION: DJANGO SYNC
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

        if (!res.ok) throw new Error("404");
        
        const dataJson = await res.json();

        if (res.status === 403 && dataJson.is_locked) {
          navigate("/pricing", { replace: true });
          return;
        }

        const safeLinks = (linksData: any) => {
          const arr = Array.isArray(linksData) ? linksData : [];
          return arr.map((l: any) => {
            if (typeof l === "string") return { name: "Verification Link", url: l.startsWith("http") ? l : `https://${l}` };
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
            title: step.title || "Module",
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

  /**
   * CALCULATED STATS
   */
  const progressPercent = data?.roadmapSteps.length 
    ? Math.round((completedSteps.length / data.roadmapSteps.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#020202] text-white pt-24 pb-40 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      
      {/* 1. VIBRANT PROGRESS HEADER */}
      <AnimatePresence>
        {data && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5 pointer-events-none transform-gpu"
          >
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]" 
             />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-5 md:px-12 max-w-6xl" ref={containerRef}>
        
        {/* Navigation Breadcrumb */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/${countryId}`)} 
          className="flex items-center gap-2 text-white/30 hover:text-white mb-10 transition-all group font-black text-[10px] tracking-[0.3em] uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> 
          Back to Country Path
        </motion.button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-6 opacity-80" />
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Database</p>
          </div>
        ) : error ? (
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
           >
             <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                <Map className="w-8 h-8 text-white/10" />
             </div>
             <h2 className="text-2xl font-display font-bold mb-3 text-white/90 tracking-tighter uppercase">Roadmap Pending</h2>
             <p className="text-white/30 max-w-xs mx-auto text-sm leading-relaxed font-light">
                Our strategists are currently finalizing the verified path for <strong>{decodedCourse}</strong>.
             </p>
           </motion.div>
        ) : data ? (
          <div className="space-y-24 md:space-y-32">
            
            {/* 2. HERO SECTION: TYPOGRAPHY RE-BALANCE */}
            <div className="relative">
              <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none transform-gpu" />
              
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <CustomPill colorClass="bg-blue-500/10 border-blue-500/20 text-blue-400">{countryId} Blueprint</CustomPill>
                {progressPercent > 0 && <CustomPill colorClass="bg-green-500/10 border-green-500/20 text-green-400">{progressPercent}% Mastered</CustomPill>}
                <div className="h-px bg-white/5 flex-grow"></div>
                {supportsNative && (
                   <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                      <button onClick={() => setLanguage("English")} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${language === 'English' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}>EN</button>
                      <button onClick={() => setLanguage("Native")} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${language === 'Native' ? "bg-indigo-600 text-white shadow-lg" : "text-white/40 hover:text-white"}`}>Native</button>
                   </div>
                )}
              </div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-7xl font-display font-bold mb-10 tracking-tighter leading-[1.05]"
              >
                {data.title}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-4xl"
              >
                <p className="text-base md:text-xl text-white/50 leading-relaxed font-light border-l-2 border-white/5 pl-8 italic">
                  {data.description}
                </p>
              </motion.div>
            </div>

            {/* 3. CORE TIMELINE (THE MASTER PATH) */}
            <section>
              <SectionTitle icon={Target} title="Mastery Curriculum" subtitle="Sequential Execution" glowColor="bg-purple-600" />

              <div className="relative ml-2 md:ml-6 border-l border-white/10 space-y-16 py-4">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      className="relative pl-10 md:pl-16 group"
                    >
                      {/* Interaction Toggle Node */}
                      <button 
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[17px] md:-left-[21px] top-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-700 z-10 transform-gpu ${
                          isCompleted 
                            ? "bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] rotate-90 scale-110" 
                            : "bg-[#020202] border-white/10 hover:border-purple-500 hover:scale-110"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-white" strokeWidth={5} /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>}
                      </button>

                      {/* Step Content */}
                      <div className={`transition-all duration-700 transform-gpu ${isCompleted ? "opacity-20 grayscale scale-[0.99] blur-[0.5px]" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-500">Stage 0{step.step}</span>
                          <div className="flex items-center gap-2 text-white/30 font-mono text-[10px] uppercase">
                             <Clock className="w-3.5 h-3.5" /> {step.timeframe}
                          </div>
                          <CustomPill colorClass={step.difficulty.toLowerCase().includes('expert') ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"}>
                            {step.difficulty}
                          </CustomPill>
                        </div>
                        
                        <h3 className="text-xl md:text-3xl font-display font-bold mb-4 tracking-tight text-white/90 group-hover:text-white transition-colors">{step.title}</h3>
                        
                        <p className="text-white/50 text-sm md:text-lg leading-relaxed mb-8 whitespace-pre-wrap font-light max-w-3xl">
                          {step.desc}
                        </p>

                        {/* Toolstack List */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white/60 transition-all cursor-default">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* VIBRANT MILESTONES & TRAPS */}
                        <div className="grid md:grid-cols-2 gap-5">
                          {step.milestones.length > 0 && (
                            <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-[1.5rem] shadow-2xl shadow-blue-500/5 hover:border-blue-500/40 transition-colors transform-gpu">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-5 flex items-center gap-3">
                                <Zap className="w-4 h-4 fill-current" /> Mastery Checkpoints
                              </h4>
                              <ul className="space-y-3.5">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-sm text-blue-100/60 flex gap-3 leading-relaxed group/li">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0 group-hover/li:scale-150 transition-transform shadow-[0_0_10px_rgba(59,130,246,1)]" />
                                    <span className="flex-1 group-hover/li:text-blue-100 transition-colors">{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-6 bg-red-600/5 border border-red-500/20 rounded-[1.5rem] shadow-2xl shadow-red-500/5 hover:border-red-500/40 transition-colors transform-gpu">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-5 flex items-center gap-3">
                                <ShieldAlert className="w-4 h-4 fill-current" /> Critical Traps
                              </h4>
                              <ul className="space-y-3.5">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-sm text-red-100/50 flex gap-3 leading-relaxed italic group/li">
                                    <span className="text-red-700 font-black text-lg leading-none">×</span>
                                    <span className="flex-1 group-hover/li:text-red-100 transition-colors">{a}</span>
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
            </section>

            {/* 4. MARKET INTELLIGENCE SECTION (PROS & CONS MERGED) */}
            <section className="relative">
              <div className="absolute inset-0 bg-white/[0.01] rounded-[4rem] -m-10 pointer-events-none -z-10 border border-white/5" />
              <SectionTitle icon={Sparkles} title="Market Intelligence" subtitle="Risk/Reward Ratio" glowColor="bg-emerald-600" />
              
              <div className="grid md:grid-cols-2 gap-6">
                  {/* PROS CARD */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-10 bg-green-500/10 border border-green-500/20 rounded-[3rem] shadow-3xl shadow-green-500/5 hover:border-green-500/40 transition-all duration-500 transform-gpu"
                  >
                    <div className="flex items-center gap-5 mb-10 text-green-400">
                      <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 shadow-inner">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Vantage Points</h3>
                    </div>
                    <ul className="space-y-6">
                      {data.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-4 text-green-50/70 text-lg leading-relaxed group/item">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2.5 shrink-0 shadow-[0_0_15px_rgba(34,197,94,1)] group-hover/item:scale-125 transition-transform"></div> 
                          <span className="flex-1 group-hover/item:text-white transition-colors">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* CONS CARD */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-10 bg-red-500/10 border border-red-500/20 rounded-[3rem] shadow-3xl shadow-red-500/5 hover:border-red-500/40 transition-all duration-500 transform-gpu"
                  >
                    <div className="flex items-center gap-5 mb-10 text-red-400">
                      <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-inner">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Friction Points</h3>
                    </div>
                    <ul className="space-y-6">
                      {data.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-4 text-red-50/60 text-lg leading-relaxed group/item">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2.5 shrink-0 shadow-[0_0_15px_rgba(239,68,68,1)] group-hover/item:scale-125 transition-transform"></div> 
                          <span className="flex-1 group-hover/item:text-white transition-colors">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
              </div>
            </section>

            {/* 5. STRATEGIC MACRO DATA */}
            <div className="space-y-12">
              
              {/* Market Outlook Component */}
              <motion.div 
                whileHover={{ scale: 1.005 }}
                className="p-10 md:p-20 bg-[#080808] border border-white/5 rounded-[4rem] relative overflow-hidden group shadow-3xl transform-gpu"
              >
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-1000 transform-gpu group-hover:rotate-12">
                   <TrendingUp className="w-64 h-64" />
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-bold mb-10 text-purple-200 tracking-tighter leading-none uppercase">Long-Term Trajectory</h3>
                <p className="text-lg md:text-2xl text-white/40 leading-relaxed mb-16 font-light max-w-4xl tracking-tight">{data.future}</p>
                
                <div className="p-8 bg-purple-600/5 rounded-[2rem] border border-purple-500/10 inline-block backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-4">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400/50">Industry Arbitrage</span>
                    </div>
                    <p className="text-purple-200 text-lg md:text-2xl font-bold tracking-tight italic">
                      "{data.opportunity}"
                    </p>
                </div>
              </motion.div>

              {/* Step-by-Step Entry Logic */}
              <div className="p-10 md:p-20 bg-[#040404] border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden transform-gpu">
                <SectionTitle icon={MousePointer2} title="Execution Playbook" subtitle="Tactical Onboarding" glowColor="bg-amber-600" />
                <div className="grid gap-6 mb-20 relative z-10">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-center gap-10 p-6 bg-white/[0.01] rounded-[2.5rem] border border-transparent hover:border-white/10 transition-all group shadow-inner">
                      <span className="text-5xl md:text-7xl font-display font-black text-white/[0.03] group-hover:text-amber-500/20 transition-all duration-1000 leading-none select-none">0{i+1}</span>
                      <p className="text-white/70 text-base md:text-xl font-light leading-relaxed">{h}</p>
                    </div>
                  ))}
                </div>
                
                {/* Pro Tip Callout */}
                <motion.div 
                  whileInView={{ x: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="p-10 md:p-14 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border border-amber-500/10 rounded-[3.5rem] flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group shadow-2xl transform-gpu"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.08),_transparent_50%)] pointer-events-none"></div>
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-all duration-1000">
                    <Flame className="w-8 h-8 text-amber-500 fill-current" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-amber-500/60 font-black tracking-[0.5em] uppercase text-[9px] mb-4">Elite Insider Insight</h4>
                    <p className="text-amber-100/70 text-xl md:text-3xl leading-tight font-display font-light whitespace-pre-wrap tracking-tighter">
                      "{data.proTip}"
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* 6. VERIFIED KNOWLEDGE VAULT */}
              {data.links.length > 0 && (
                <div className="p-10 md:p-20 bg-black border border-white/5 rounded-[4rem] shadow-3xl transform-gpu">
                   <SectionTitle icon={LinkIcon} title="Resource Repository" subtitle="Global Knowledge Vault" glowColor="bg-blue-600" />
                   <div className="grid sm:grid-cols-2 gap-6">
                    {data.links.map((l, i) => (
                      <motion.a 
                        whileHover={{ y: -4, backgroundColor: "rgba(37, 99, 235, 0.05)", borderColor: "rgba(37, 99, 235, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        key={i} 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group transition-all transform-gpu"
                      >
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-all border border-blue-500/10">
                             <Globe className="w-5 h-5 text-blue-400" />
                           </div>
                           <span className="text-base md:text-lg font-bold text-white/30 group-hover:text-blue-400 transition-colors">{l.name}</span>
                        </div>
                        <ExternalLink className="w-5 h-5 text-white/5 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
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