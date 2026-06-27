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
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

/**
 * ============================================================================
 * INTERFACES & DATA MODELS
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
 * ANIMATION VARIANTS (Optimized for Mobile GPU)
 * ============================================================================
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
};

/**
 * ============================================================================
 * MAIN COMPONENT: ROADMAP DETAIL
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
  
  // Sanitize the API URL to prevent double-slash bugs
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  /**
   * DATA PROCESSING UTILITY
   * Converts plain text from Django Admin into clean arrays.
   */
  const parseTextToList = (item: any): string[] => {
    if (Array.isArray(item)) return item;
    if (typeof item === "string") {
      return item
        .split('\n')
        .map(line => line.trim())
        .map(line => line.replace(/^[•\-\*\d\.]+\s*/, '')) // Removes dashes or bullets
        .filter(line => line.length > 0);
    }
    return [];
  };

  /**
   * USER PROGRESS SYNC
   * Loads saved checkbox progress from local storage.
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
            if (typeof l === "string") return { name: "Resource Link", url: l.startsWith("http") ? l : `https://${l}` };
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

  // Route protection
  if (!countryId || !courseId) return <Navigate to="/setup" replace />;

  const progressPercent = data?.roadmapSteps.length 
    ? Math.round((completedSteps.length / data.roadmapSteps.length) * 100) 
    : 0;

  return (
    <div className="min-h-[100dvh] bg-[#020202] text-white pt-24 pb-40 selection:bg-purple-500/20 font-sans overflow-x-hidden">
      
      {/* 1. PROGRESS BAR */}
      <AnimatePresence>
        {data && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5 pointer-events-none transform-gpu"
            style={{ transform: 'translateZ(0)' }}
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
        <button 
          onClick={() => navigate(`/${countryId}`)} 
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> 
          Back to Pathways
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4 opacity-80" />
            <p className="text-white/50 text-sm animate-pulse">Loading roadmap from database...</p>
          </div>
        ) : error ? (
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
           >
             <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Map className="w-8 h-8 text-white/10" />
             </div>
             <h2 className="text-2xl font-bold mb-3 text-white/90">Roadmap Coming Soon</h2>
             <p className="text-white/40 max-w-md mx-auto text-base leading-relaxed">
                We are currently crafting the optimal pathway for <strong>{decodedCourse}</strong>. Check back later!
             </p>
           </motion.div>
        ) : data ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="will-change-contents"
          >
            
            {/* 2. HERO SECTION */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">
                  {countryId.toUpperCase()} Roadmap
                </div>
                {supportsNative && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/50">Language:</span>
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value as any)} 
                      className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Native">Native Content</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Standard text sizing, not too massive */}
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl font-display font-bold mb-6"
              >
                {data.title}
              </motion.h1>
              
              <motion.div variants={itemVariants}>
                <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl whitespace-pre-wrap break-words">
                  {data.description}
                </p>
              </motion.div>
            </div>

            {/* 3. VISUAL ROADMAP TIMELINE */}
            <div className="roadmap-timeline bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 mb-12 shadow-xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </span>
                Step-by-Step Learning Path
              </h2>

              <div className="relative border-l-2 border-white/10 ml-2 md:ml-4 space-y-10 pb-4">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      viewport={{ once: true, margin: "-50px" }}
                      className="relative pl-6 md:pl-10 transform-gpu"
                    >
                      {/* Checkpoint Node */}
                      <button 
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-300 z-10 transform-gpu ${
                          isCompleted 
                            ? "bg-green-500 border-[#111] scale-110 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                            : "bg-[#111] border-white/20 hover:border-purple-500"
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3 text-white" strokeWidth={4} /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>}
                      </button>

                      {/* Main Step Container */}
                      <div className={`transition-all duration-500 transform-gpu bg-white/5 border border-white/10 rounded-xl p-5 w-full overflow-hidden ${isCompleted ? "opacity-40 grayscale" : "hover:bg-white/10"}`}>
                        <div className="flex flex-wrap items-center justify-between mb-1">
                          <div className={`${isCompleted ? "text-green-500" : "text-blue-400"} text-sm font-bold`}>
                            Phase {step.step}
                          </div>
                          {isCompleted && (
                            <span className="text-xs text-green-500 font-bold uppercase">Completed</span>
                          )}
                        </div>
                        
                        <h3 className={`text-lg md:text-xl font-bold mb-3 break-words ${isCompleted ? "line-through text-white/50" : "text-white/90"}`}>
                          {step.title}
                        </h3>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-start gap-3 mb-4 max-w-full">
                          <span className="text-xs font-mono px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white/90 h-auto break-words whitespace-normal flex items-center gap-1.5">
                             <Clock className="w-3 h-3" /> {step.timeframe}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-md border h-auto break-words whitespace-normal ${
                            step.difficulty.toLowerCase().includes("beginner") ? "bg-green-500/10 border-green-500/30 text-green-400" :
                            step.difficulty.toLowerCase().includes("intermediate") ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          }`}>
                            ⚡ {step.difficulty}
                          </span>
                        </div>

                        {/* Tools Row */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 w-full mb-4">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="text-xs font-medium px-2 py-1 border border-indigo-500/30 text-indigo-300 rounded-md bg-indigo-500/10 h-auto break-words whitespace-normal">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-white/70 text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap break-words">
                          {step.desc}
                        </p>

                        {/* VIBRANT MILESTONES & AVOID BLOCKS */}
                        {(step.milestones.length > 0 || step.antiPatterns && step.antiPatterns.length > 0) && (
                          <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                            
                            {/* Checkpoints (Bright Blue) */}
                            {step.milestones.length > 0 && (
                              <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:border-blue-500/50 transition-colors transform-gpu">
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                                  <Zap className="w-3.5 h-3.5 fill-current" /> Checkpoints
                                </h4>
                                <ul className="space-y-2.5">
                                  {step.milestones.map((m, mIdx) => (
                                    <li key={mIdx} className="text-sm text-blue-100/80 flex gap-2 items-start leading-relaxed">
                                      <span className="text-blue-500 font-bold mt-0.5 shrink-0">→</span>
                                      <span className="flex-1">{m}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Avoid (Bright Red) */}
                            {step.antiPatterns && step.antiPatterns.length > 0 && (
                              <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:border-red-500/50 transition-colors transform-gpu">
                                 <h4 className="text-xs font-black uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                                  <ShieldAlert className="w-3.5 h-3.5 fill-current" /> Avoid
                                </h4>
                                <ul className="space-y-2.5">
                                  {step.antiPatterns.map((a, aIdx) => (
                                    <li key={aIdx} className="text-sm text-red-100/70 flex gap-2 items-start leading-relaxed italic">
                                      <span className="text-red-500 font-black shrink-0">×</span>
                                      <span className="flex-1">{a}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          </div>
                        )}

                        {!user && (
                          <p className="text-xs text-white/40 mt-4 italic">
                            Log in to track your progress
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 4. PROS & CONS (VIBRANT GREEN AND RED) */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <motion.div variants={itemVariants} className="p-8 bg-green-500/10 border border-green-500/30 rounded-3xl shadow-[0_0_30px_rgba(34,197,94,0.1)] transform-gpu hover:border-green-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-6 text-green-400">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="text-xl font-bold uppercase tracking-tight">Pros</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-green-50/80 text-base leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(34,197,94,1)]"></div> 
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div variants={itemVariants} className="p-8 bg-red-500/10 border border-red-500/30 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.1)] transform-gpu hover:border-red-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-6 text-red-400">
                    <XCircle className="w-6 h-6" />
                    <h3 className="text-xl font-bold uppercase tracking-tight">Cons</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-red-50/80 text-base leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(239,68,68,1)]"></div> 
                        <span className="flex-1">{c}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
            </div>

            {/* 5. DETAILS & STRATEGY */}
            <div className="space-y-8">
              
              {/* Future Outlook */}
              <motion.div variants={itemVariants} className="p-8 md:p-10 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-3xl transform-gpu">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-purple-300">
                  <TrendingUp className="w-6 h-6" /> Future Outlook
                </h3>
                <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 whitespace-pre-wrap">{data.future}</p>
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-200 break-words">
                  <strong>Opportunity:</strong> {data.opportunity}
                </div>
              </motion.div>

              {/* How to Start */}
              <motion.div variants={itemVariants} className="p-8 md:p-10 bg-[#111] border border-white/10 rounded-3xl transform-gpu">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-orange-400" /> How to Start
                </h3>
                <div className="space-y-3 mb-8">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 text-white/80 text-base">
                      {h}
                    </div>
                  ))}
                </div>
                
                {/* Pro Tip Box */}
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-yellow-500 mb-2 uppercase tracking-widest text-xs">Pro Tip</h4>
                    <p className="text-yellow-100/80 text-base leading-relaxed whitespace-pre-wrap">"{data.proTip}"</p>
                  </div>
                </div>
              </motion.div>

              {/* References */}
              {data.links.length > 0 && (
                <motion.div variants={itemVariants} className="p-8 md:p-10 bg-[#111] border border-white/10 rounded-3xl transform-gpu">
                   <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                     <LinkIcon className="w-6 h-6" /> References
                   </h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                    {data.links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl group hover:border-blue-500/40 hover:bg-blue-500/10 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <ExternalLink className="w-4 h-4 text-blue-400/50 group-hover:text-blue-400 transition-colors shrink-0" />
                           <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors truncate">{l.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
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