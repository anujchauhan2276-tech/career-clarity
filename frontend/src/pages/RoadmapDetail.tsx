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
  Info,
  Calendar,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

/**
 * ============================================================================
 * DATA MODELS & INTERFACES
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
 * REUSABLE UI SUB-COMPONENTS
 * ============================================================================
 */

const SectionLabel = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-1.5 bg-white/5 rounded-md border border-white/10">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <h2 className="text-xs font-black tracking-[0.2em] uppercase text-white/40">{title}</h2>
    </div>
    <p className="text-[10px] font-medium ml-9 uppercase tracking-widest text-white/20">{subtitle}</p>
  </div>
);

const StatusBadge = ({ children, color = "purple" }: { children: React.ReactNode, color?: string }) => {
  const colorMap: Record<string, string> = {
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    green: "bg-green-500/20 border-green-500/30 text-green-300",
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    orange: "bg-orange-500/20 border-orange-500/30 text-orange-300",
    red: "bg-red-500/20 border-red-500/30 text-red-300",
  };
  return (
    <span className={`px-2.5 py-0.5 border rounded-md text-[9px] font-bold tracking-wider uppercase ${colorMap[color]}`}>
      {children}
    </span>
  );
};

/**
 * ============================================================================
 * ANIMATION VARIANTS (Framer Motion)
 * ============================================================================
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
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
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  /**
   * DATA PROCESSING UTILITY
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
   * USER PROGRESS SYNC
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
          console.error("Local persistence read error");
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
    } catch (e: any) {
      console.error("Local persistence write error");
    }
  };

  /**
   * MULTILINGUAL SUPPORT
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
   * SERVER COMMUNICATION
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

        if (!res.ok) throw new Error("Backend retrieval failed");
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

  const progressPercent = data?.roadmapSteps.length 
    ? Math.round((completedSteps.length / data.roadmapSteps.length) * 100) 
    : 0;

  return (
    <div className="min-h-[100dvh] bg-[#020202] text-white pt-24 pb-40 selection:bg-purple-500/20 font-sans">
      
      {/* 1. NARROW PROGRESS BAR */}
      <AnimatePresence>
        {data && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5"
          >
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
             />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-5 md:px-10 max-w-5xl" ref={containerRef}>
        
        {/* Navigation Breadcrumb */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(`/${countryId}`)} 
          className="flex items-center gap-2 text-white/30 hover:text-white mb-10 transition-all group font-bold text-[10px] tracking-widest uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
          Back to Country Path
        </motion.button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4 opacity-50" />
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">Establishing Sync</p>
          </div>
        ) : error ? (
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
           >
             <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mb-8">
                <Map className="w-8 h-8 text-white/10" />
             </div>
             <h2 className="text-xl font-display font-bold mb-3 text-white/90 uppercase tracking-tight">Path Under Maintenance</h2>
             <p className="text-white/30 max-w-xs mx-auto text-sm leading-relaxed">
                The data for <strong>{decodedCourse}</strong> is currently being verified for {countryId.toUpperCase()} standards.
             </p>
           </motion.div>
        ) : data ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* 2. BALANCED HERO SECTION */}
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <StatusBadge color="purple">{countryId} Blueprint</StatusBadge>
                {progressPercent > 0 && <StatusBadge color="green">{progressPercent}% Mastery</StatusBadge>}
                <div className="h-px bg-white/5 flex-grow"></div>
                {supportsNative && (
                   <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)} 
                    className="bg-transparent text-[10px] font-black uppercase text-purple-400 outline-none cursor-pointer hover:text-purple-300"
                   >
                     <option value="English">EN</option>
                     <option value="Native">Native</option>
                   </select>
                )}
              </div>

              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight leading-tight"
              >
                {data.title}
              </motion.h1>
              
              <motion.div variants={itemVariants}>
                <p className="text-base md:text-lg text-white/60 leading-relaxed font-normal">
                  {data.description}
                </p>
              </motion.div>
            </div>

            {/* 3. MODERN TIMELINE */}
            <div className="mb-12">
              <SectionLabel icon={Target} title="Curriculum Structure" subtitle="Chronological Order" />

              <div className="relative ml-2 md:ml-4 border-l border-white/10 space-y-14">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      className="relative pl-8 md:pl-12"
                    >
                      {/* Interaction Node */}
                      <button 
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[13px] top-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-500 z-10 ${
                          isCompleted 
                            ? "bg-green-500 border-green-400 rotate-90" 
                            : "bg-[#020202] border-white/10 hover:border-purple-500"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-white" strokeWidth={5} /> : <div className="w-1 h-1 bg-white/20 rounded-full"></div>}
                      </button>

                      <div className={`transition-all duration-700 ${isCompleted ? "opacity-30 grayscale blur-[0.3px]" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="text-[9px] font-black tracking-widest uppercase text-indigo-400">Stage 0{step.step}</span>
                          <span className="text-[9px] font-medium text-white/20 flex items-center gap-1">
                             <Clock className="w-2.5 h-2.5" /> {step.timeframe}
                          </span>
                          <StatusBadge color={step.difficulty.toLowerCase().includes("beginner") ? "green" : "orange"}>{step.difficulty}</StatusBadge>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-display font-bold mb-3 tracking-tight text-white/90">{step.title}</h3>
                        
                        <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap font-light">
                          {step.desc}
                        </p>

                        {/* Minimal Tool Pills */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] font-medium text-white/40 uppercase tracking-tighter">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Milestone Grids */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {step.milestones.length > 0 && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                              <h4 className="text-[8px] font-black uppercase tracking-widest text-blue-300 mb-3 flex items-center gap-2">
                                <Zap className="w-2.5 h-2.5" /> Checkpoints
                              </h4>
                              <ul className="space-y-2.5">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-xs text-white/70 flex gap-2 leading-relaxed">
                                    <span className="text-blue-400 font-bold">•</span> {m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                               <h4 className="text-[8px] font-black uppercase tracking-widest text-red-300 mb-3 flex items-center gap-2">
                                <ShieldAlert className="w-2.5 h-2.5" /> Avoid
                              </h4>
                              <ul className="space-y-2.5">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-xs text-white/60 flex gap-2 leading-relaxed italic">
                                    <span className="text-red-400 font-black">×</span> {a}
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

            {/* 4. BALANCED ANALYSIS GRID */}
            <div className="grid md:grid-cols-2 gap-5 mb-12">
                <motion.div variants={itemVariants} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-3xl shadow-inner">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <h3 className="text-lg font-bold text-white/90 uppercase tracking-tighter">Strategic Value</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/60 text-sm leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-green-400 mt-2 shrink-0"></div> {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div variants={itemVariants} className="p-8 bg-[#0A0A0A] border border-white/5 rounded-3xl shadow-inner">
                  <div className="flex items-center gap-3 mb-6">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <h3 className="text-lg font-bold text-white/90 uppercase tracking-tighter">Operational Risks</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/60 text-sm leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-red-400 mt-2 shrink-0"></div> {c}
                      </li>
                    ))}
                  </ul>
                </motion.div>
            </div>

            {/* 5. MACRO STRATEGY */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                   <TrendingUp className="w-32 h-32" />
                </div>
                <h3 className="text-xl md:text-3xl font-display font-bold mb-6 text-purple-200 uppercase tracking-tight">Market Outlook</h3>
                <p className="text-sm md:text-lg text-white/50 leading-relaxed mb-10 font-light">{data.future}</p>
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 inline-flex items-center gap-3">
                   <Award className="w-4 h-4 text-purple-400" />
                   <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">{data.opportunity}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="p-8 md:p-12 bg-[#050505] border border-white/5 rounded-[2rem]">
                <h3 className="text-xl md:text-3xl font-display font-bold mb-8 uppercase tracking-tight">Entry Execution</h3>
                <div className="space-y-3 mb-10">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-center gap-5 p-3 hover:bg-white/[0.02] rounded-xl transition-colors group">
                      <span className="text-xl font-display font-black text-white/10 group-hover:text-purple-500/30 transition-colors">0{i+1}</span>
                      <p className="text-white/60 text-sm md:text-base font-light">{h}</p>
                    </div>
                  ))}
                </div>
                
                {/* Clean Pro Tip */}
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-yellow-300/60 font-black tracking-widest uppercase text-[8px] mb-2">Industry Intelligence</h4>
                    <p className="text-yellow-100/70 text-sm md:text-base leading-relaxed italic font-light">"{data.proTip}"</p>
                  </div>
                </div>
              </motion.div>

              {/* 6. VAULT RESOURCES */}
              {data.links.length > 0 && (
                <motion.div variants={itemVariants} className="p-8 md:p-12 bg-black border border-white/5 rounded-[2rem]">
                   <h3 className="text-[9px] font-black tracking-widest uppercase text-white/20 mb-8 text-center">Reference Library</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                    {data.links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                           <ExternalLink className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400 transition-colors" />
                           <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">{l.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                   </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}