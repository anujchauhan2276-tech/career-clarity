import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  MousePointer2,
  BarChart3,
  Compass,
  Trophy,
  Activity,
  Flame
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// --- TYPES & INTERFACES ---

interface RoadmapStep {
  step: number;
  title: string;
  timeframe: string;
  tools: string[];
  desc: string;
  milestones: string[];
  antiPatterns?: string[];
  difficulty: string;
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

// --- UTILITY COMPONENTS ---

/**
 * A beautiful, animated progress bar fixed to the top of the viewport.
 */
const GlobalProgressBar = ({ progress }: { progress: number }) => (
  <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-white/5 overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1, ease: "circOut" }}
    />
  </div>
);

/**
 * A stylized section label for consistent branding.
 */
const SectionLabel = ({ icon: Icon, label, color = "text-purple-500" }: { icon: any, label: string, color?: string }) => (
  <div className="flex items-center gap-3 mb-10">
    <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${color}`}>
      <Icon size={16} />
    </div>
    <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">
      {label}
    </h2>
  </div>
);

/**
 * Quick info cards for the top of the page.
 */
const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="flex flex-col p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
    <div className={`mb-3 ${color}`}>
      <Icon size={20} />
    </div>
    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-sm font-medium text-white/80">{value}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---

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

  // --- DATA PARSING ---

  const parseTextToList = (item: any): string[] => {
    if (Array.isArray(item)) return item;
    if (typeof item === "string") {
      return item
        .split("\n")
        .map((line) => line.trim())
        .map((line) => line.replace(/^[•\-\*\d\.]+\s*/, ""))
        .filter((line) => line.length > 0);
    }
    return [];
  };

  // --- PERSISTENCE ---

  useEffect(() => {
    if (user && decodedCourse) {
      const saved = localStorage.getItem(`user_progress_${user.uid}_${decodedCourse}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCompletedSteps(parsed.completedSteps || []);
        } catch (e) {
          console.error("Local Storage parse error.");
        }
      }
    }
  }, [user, decodedCourse]);

  const toggleStep = async (stepNum: number) => {
    if (!user) return;
    const nextSteps = completedSteps.includes(stepNum)
      ? completedSteps.filter((s) => s !== stepNum)
      : [...completedSteps, stepNum];

    setCompletedSteps(nextSteps);
    localStorage.setItem(
      `user_progress_${user.uid}_${decodedCourse}`,
      JSON.stringify({ completedSteps: nextSteps, lastUpdated: new Date().toISOString() })
    );
  };

  // --- LANGUAGE SETTINGS ---

  const supportsNative = ["es", "de", "fr", "cn", "jp", "kr", "ru", "in"].includes(countryId || "");
  const [language, setLanguage] = useState<"Native" | "English">(urlLang || "English");

  useEffect(() => {
    if (urlLang !== language) {
      const params = new URLSearchParams(searchParams);
      params.set("lang", language);
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [language, navigate, searchParams, urlLang]);

  // --- API COMMUNICATION ---

  useEffect(() => {
    if (!decodedCourse) return;

    const fetchRoadmap = async () => {
      setLoading(true);
      setError(false);

      try {
        const token = await getToken();
        const response = await fetch(`${apiBase}/api/roadmap/get/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            courseId: decodedCourse,
            countryId: countryId,
            language: language === "Native" ? "Native" : "English",
          }),
        });

        if (!response.ok) throw new Error("API Failure");
        const json = await response.json();

        if (response.status === 403 && json.is_locked) {
          navigate("/pricing", { replace: true });
          return;
        }

        setData({
          title: json.title || decodedCourse,
          description: json.overview || "",
          future: json.future_outlook || "",
          pros: parseTextToList(json.pros),
          cons: parseTextToList(json.cons),
          opportunity: json.opportunity || "",
          howTo: parseTextToList(json.how_to),
          proTip: json.pro_tip || "",
          links: Array.isArray(json.links) ? json.links : [],
          roadmapSteps: (Array.isArray(json.steps) ? json.steps : []).map((s: any) => ({
            step: s.step_number || 1,
            title: s.title || "Untitled Stage",
            timeframe: s.timeframe || "TBD",
            difficulty: s.difficulty || "Standard",
            tools: parseTextToList(s.tools),
            desc: s.description || "",
            milestones: parseTextToList(s.milestones),
            antiPatterns: parseTextToList(s.anti_patterns),
          })),
        });
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchRoadmap();
  }, [decodedCourse, user, language, countryId, navigate, getToken, apiBase]);

  const progressPercent = useMemo(() => {
    if (!data?.roadmapSteps.length) return 0;
    return Math.round((completedSteps.length / data.roadmapSteps.length) * 100);
  }, [completedSteps, data]);

  if (!countryId || !courseId) return <Navigate to="/setup" replace />;

  return (
    <div className="min-h-screen bg-[#020202] text-white pt-24 pb-40 selection:bg-indigo-500/30 overflow-x-hidden">
      <GlobalProgressBar progress={progressPercent} />

      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-6xl" ref={containerRef}>
        
        {/* TOP NAVIGATION BAR */}
        <nav className="flex items-center justify-between mb-16 sm:mb-24">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate(`/${countryId}`)}
            className="flex items-center gap-3 text-white/40 hover:text-white transition-colors font-bold text-[10px] tracking-[0.2em] uppercase"
          >
            <ArrowLeft size={16} /> 
            Back to Dashboard
          </motion.button>

          {supportsNative && (
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => setLanguage("English")} 
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${language === 'English' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage("Native")} 
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${language === 'Native' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white'}`}
              >
                NATIVE
              </button>
            </div>
          )}
        </nav>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="mb-8"
            >
              <Loader2 size={48} className="text-indigo-500" />
            </motion.div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Assembling Roadmap</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 text-center"
          >
            <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-3xl">
              <Compass className="w-12 h-12 text-white/5" />
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight text-white/90">Path Pending</h2>
            <p className="text-white/30 max-w-sm mx-auto text-lg font-light leading-relaxed">
              We are currently hand-curating the definitive career strategy for <strong>{decodedCourse}</strong>.
            </p>
          </motion.div>
        ) : data ? (
          <main className="animate-in fade-in duration-1000">
            
            {/* HERO SECTION */}
            <header className="relative mb-32">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-10"
              >
                <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black tracking-[0.25em] uppercase text-indigo-400">
                  Global Blueprint: {countryId}
                </div>
                {progressPercent === 100 && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black tracking-[0.25em] uppercase text-green-400 flex items-center gap-2"
                  >
                    <Trophy size={12} /> Mastered
                  </motion.div>
                )}
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-display font-bold mb-10 tracking-tighter leading-[0.85] text-white"
              >
                {data.title}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-2xl lg:text-3xl text-white/40 leading-relaxed font-light max-w-4xl mb-16"
              >
                {data.description}
              </motion.p>

              {/* QUICK STATS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatCard icon={Activity} label="Complexity" value="High Impact" color="text-orange-500" />
                 <StatCard icon={Clock} label="Duration" value={`${data.roadmapSteps.length * 4} Months Avg.`} color="text-blue-500" />
                 <StatCard icon={Flame} label="Market Demand" value="Rising Fast" color="text-pink-500" />
                 <StatCard icon={Check} label="Milestones" value={`${data.roadmapSteps.length * 3} To Complete`} color="text-green-500" />
              </div>
            </header>

            {/* CORE TIMELINE */}
            <section className="mb-48">
              <SectionLabel icon={Target} label="Chronological Execution" />

              <div className="relative ml-4 md:ml-10 border-l-2 border-white/5 space-y-32">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <motion.div 
                      key={i} 
                      viewport={{ once: true, margin: "-100px" }}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="relative pl-12 md:pl-24"
                    >
                      {/* STEP BUTTON */}
                      <button 
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[23px] md:-left-[27px] top-0 w-12 h-12 rounded-3xl border border-white/10 flex items-center justify-center transition-all duration-700 z-30 ${
                          isCompleted 
                            ? "bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.6)] rotate-[360deg]" 
                            : "bg-[#020202] hover:border-indigo-500 hover:scale-110 shadow-2xl"
                        }`}
                      >
                        {isCompleted ? <Check size={20} strokeWidth={4} /> : <span className="text-[10px] font-black text-white/20">{step.step}</span>}
                      </button>

                      {/* STEP CONTENT */}
                      <div className={`transition-all duration-1000 ${isCompleted ? "opacity-20 grayscale scale-[0.98] blur-[2px]" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-500 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">Stage 0{step.step}</span>
                          <div className="flex items-center gap-2 text-white/20 font-mono text-[10px] uppercase tracking-widest">
                             <Clock size={12} /> {step.timeframe}
                          </div>
                          <div className="px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">{step.difficulty}</div>
                        </div>
                        
                        <h3 className="text-3xl md:text-6xl font-display font-bold mb-8 tracking-tight leading-[1.1] text-white/90">
                          {step.title}
                        </h3>
                        
                        <p className="text-white/50 text-lg md:text-2xl leading-relaxed mb-10 font-light max-w-4xl">
                          {step.desc}
                        </p>

                        {/* TOOLS PILLS */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-12">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black text-white/30 uppercase tracking-[0.1em] hover:text-white/60 hover:bg-white/10 transition-all cursor-default">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* SUB-GRIDS FOR MILESTONES */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {step.milestones.length > 0 && (
                            <div className="p-8 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[2.5rem] backdrop-blur-xl">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/40 mb-8 flex items-center gap-3">
                                <Award size={14} /> Benchmarks
                              </h4>
                              <ul className="space-y-6">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-base text-white/60 flex gap-5 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                    <span className="flex-1 font-light italic">{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-8 bg-red-500/[0.01] border border-red-500/10 rounded-[2.5rem] backdrop-blur-xl">
                               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400/40 mb-8 flex items-center gap-3">
                                <ShieldAlert size={14} /> Critical Pitfalls
                              </h4>
                              <ul className="space-y-6">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-base text-white/40 flex gap-5 leading-relaxed font-light">
                                    <span className="text-red-900 font-black text-lg">!</span>
                                    <span className="flex-1">{a}</span>
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

            {/* PROS & CONS */}
            <section className="mb-48">
              <SectionLabel icon={BarChart3} label="Strategic Analysis" color="text-green-500" />
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] shadow-3xl"
                >
                  <div className="flex items-center gap-5 mb-12">
                    <div className="w-16 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                      <CheckCircle2 size={28} className="text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-display font-bold text-white/90 tracking-tight">Competitive Advantage</h3>
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2 font-black">Success Drivers</p>
                    </div>
                  </div>
                  <ul className="space-y-10">
                    {data.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-6 text-white/40 text-xl leading-relaxed font-light group">
                        <span className="text-green-500 font-black text-2xl group-hover:scale-125 transition-transform">+</span> 
                        <span className="flex-1 border-b border-white/5 pb-4">{p}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div 
                   whileHover={{ y: -10 }}
                   className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] shadow-3xl"
                >
                  <div className="flex items-center gap-5 mb-12">
                    <div className="w-16 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                      <XCircle size={28} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-display font-bold text-white/90 tracking-tight">The Bottlenecks</h3>
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2 font-black">Entry Barriers</p>
                    </div>
                  </div>
                  <ul className="space-y-10">
                    {data.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-6 text-white/40 text-xl leading-relaxed font-light group">
                        <span className="text-red-900 font-black text-2xl group-hover:scale-125 transition-transform">-</span> 
                        <span className="flex-1 border-b border-white/5 pb-4">{c}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </section>

            {/* DETAILED STRATEGIC BLOCKS */}
            <div className="space-y-24 mb-48">
              
              {/* Industry Future */}
              <motion.div 
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-12 md:p-24 bg-gradient-to-br from-[#080808] to-transparent border border-white/5 rounded-[5rem] relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 opacity-[0.02] pointer-events-none">
                   <TrendingUp size={600} />
                </div>
                <h3 className="text-4xl md:text-7xl font-display font-bold mb-12 text-white tracking-tighter">Market Trajectory</h3>
                <p className="text-2xl md:text-4xl text-white/30 leading-snug font-light max-w-4xl mb-16 italic">
                  "{data.future}"
                </p>
                <div className="p-8 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 inline-flex items-center gap-8 shadow-2xl">
                   <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/40">
                      <Zap size={32} className="text-white" />
                   </div>
                   <div>
                      <span className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-black block mb-2 text-left">Strategic Arbitrage</span> 
                      <p className="text-indigo-200 text-xl md:text-3xl font-medium tracking-tight text-left">
                        {data.opportunity}
                      </p>
                   </div>
                </div>
              </motion.div>

              {/* Start Sequence */}
              <section>
                <SectionLabel icon={Sparkles} label="Immediate Roadmap" color="text-yellow-500" />
                <div className="grid gap-8 mb-24">
                  {data.howTo.map((h, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 10 }}
                      className="flex items-start md:items-center gap-12 p-10 bg-white/[0.015] rounded-[3rem] border border-transparent hover:border-white/5 transition-all group"
                    >
                      <span className="text-8xl font-display font-black text-white/[0.01] group-hover:text-indigo-500/10 transition-colors duration-1000 leading-none">0{i+1}</span>
                      <p className="text-white/60 text-2xl md:text-4xl font-light tracking-tight flex-1 leading-tight">{h}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Advisor Tip */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="p-12 md:p-20 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-[4rem] flex flex-col md:flex-row gap-12 items-start md:items-center"
                >
                  <div className="w-24 h-24 rounded-[2.5rem] bg-yellow-500/10 flex items-center justify-center shrink-0 shadow-[0_0_60px_rgba(234,179,8,0.15)] border border-yellow-500/20">
                    <Lightbulb size={40} className="text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-yellow-500/40 font-black tracking-[0.5em] uppercase text-[10px] mb-6">Expert Advisory Intelligence</h4>
                    <p className="text-yellow-100/70 text-3xl md:text-5xl leading-tight font-display font-light italic whitespace-pre-wrap tracking-tighter">
                      "{data.proTip}"
                    </p>
                  </div>
                </motion.div>
              </section>

              {/* EXTERNAL INFRASTRUCTURE */}
              {data.links.length > 0 && (
                <div className="p-16 bg-[#030303] border border-white/5 rounded-[5rem]">
                   <h3 className="text-[10px] font-black tracking-[0.6em] uppercase text-white/10 mb-16 text-center">Reference Architecture</h3>
                   <div className="grid sm:grid-cols-2 gap-6">
                    {data.links.map((l, i) => (
                      <motion.a 
                        key={i} 
                        href={l.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] transition-all"
                      >
                        <div className="flex items-center gap-8 overflow-hidden">
                           <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-700">
                             <ExternalLink size={24} className="text-white/20 group-hover:text-indigo-400" />
                           </div>
                           <div className="flex flex-col text-left">
                              <span className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-2">Verified Resource</span>
                              <span className="font-display font-bold text-2xl text-white/40 group-hover:text-white transition-colors truncate">{l.name}</span>
                           </div>
                        </div>
                        <ChevronRight size={32} className="text-white/5 group-hover:text-indigo-400 group-hover:translate-x-3 transition-all" />
                      </motion.a>
                    ))}
                   </div>
                </div>
              )}
            </div>

            {/* END OF DOCUMENT */}
            <footer className="text-center pb-20">
                <div className="flex flex-col items-center gap-6 opacity-20 hover:opacity-100 transition-opacity duration-700">
                    <p className="text-[10px] font-black tracking-[0.5em] uppercase">End of Career Blueprint</p>
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="p-6 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <MousePointer2 size={24} />
                    </button>
                </div>
            </footer>
          </main>
        ) : null}
      </div>
    </div>
  );
}