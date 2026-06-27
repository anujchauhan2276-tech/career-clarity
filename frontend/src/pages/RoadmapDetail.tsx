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
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-1.5 bg-white/5 rounded-md border border-white/10">
        <Icon className="w-3.5 h-3.5 text-purple-400" />
      </div>
      <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40">{title}</h2>
    </div>
    <p className="text-[9px] font-medium ml-8 uppercase tracking-widest text-white/20">{subtitle}</p>
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
 * Segmented language toggle.
 * Two independent pill buttons — whichever is active gets the solid purple fill.
 * Built with plain background-color swaps (no animated gradient/blur layer),
 * which is what was causing the color flicker on mobile GPUs.
 */
const LanguageToggle = ({
  value,
  nativeLabel,
  onChange,
}: {
  value: "Native" | "English";
  nativeLabel: string;
  onChange: (v: "Native" | "English") => void;
}) => {
  const baseBtn =
    "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors duration-150";
  const active = "bg-purple-500 text-white";
  const inactive = "bg-transparent text-white/40 hover:text-white/70";

  return (
    <div className="flex items-center gap-1 p-1 bg-[#020202] border border-white/10 rounded-lg">
      <button
        type="button"
        onClick={() => onChange("English")}
        className={`${baseBtn} ${value === "English" ? active : inactive}`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("Native")}
        className={`${baseBtn} ${value === "Native" ? active : inactive}`}
      >
        {nativeLabel}
      </button>
    </div>
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

  // Get native language name based on country
  const getNativeLanguageName = () => {
    const languageMap: Record<string, string> = {
      es: "Español",
      de: "Deutsch",
      fr: "Français",
      cn: "中文",
      jp: "日本語",
      kr: "한국어",
      ru: "Русский",
      in: "हिन्दी"
    };
    return languageMap[countryId || ""] || "Native";
  };

  return (
    <div className="min-h-[100dvh] bg-[#020202] text-white pt-20 pb-20 selection:bg-purple-500/20 font-sans">

      {/* 1. NARROW PROGRESS BAR
          Plain fixed bar, no manual GPU-layer promotion. `position: fixed`
          already gets its own compositor layer in mobile browsers; stacking
          `translateZ(0)` on top of that double-promotes it and is what was
          causing the tearing/ghosting on the content scrolling underneath
          (visible as duplicated text and horizontal scan lines on Android
          WebView). `transform: scaleX()` is kept for the fill animation
          since that part is correct — it's compositor-only and doesn't
          trigger layout, unlike animating `width`. */}
      {data && !loading && !error && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 origin-left transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${progressPercent / 100})`, width: "100%" }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-10 max-w-5xl" ref={containerRef}>

        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate(`/${countryId}`)}
          className="flex items-center gap-2 text-white/30 hover:text-white mb-8 transition-all group font-bold text-[10px] tracking-widest uppercase"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4 opacity-50" />
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">Loading...</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center py-32 text-center">
             <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mb-8">
                <Map className="w-8 h-8 text-white/10" />
             </div>
             <h2 className="text-xl font-bold mb-3 text-white/90 uppercase tracking-tight">Path Under Maintenance</h2>
             <p className="text-white/30 max-w-xs mx-auto text-sm leading-relaxed">
                The data for <strong>{decodedCourse}</strong> is currently being verified for {countryId.toUpperCase()} standards.
             </p>
           </div>
        ) : data ? (
          <div>

            {/* 2. HERO SECTION */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <StatusBadge color="purple">{countryId}</StatusBadge>
                {progressPercent > 0 && <StatusBadge color="green">{progressPercent}% Done</StatusBadge>}
                <div className="h-px bg-white/5 flex-grow"></div>
                {supportsNative && (
                  <LanguageToggle
                    value={language}
                    nativeLabel={getNativeLanguageName()}
                    onChange={setLanguage}
                  />
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight text-white">
                {data.title}
              </h1>

              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* 3. STEPS */}
            <div className="mb-10">
              <SectionLabel icon={Target} title="Steps" subtitle="Follow in order" />

              <div className="relative ml-2 md:ml-4 border-l border-white/10 space-y-10">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <div key={i} className="relative pl-8 md:pl-12">
                      {/* Node */}
                      <button
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[13px] top-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                          isCompleted
                            ? "bg-green-500 border-green-400"
                            : "bg-[#020202] border-white/10 hover:border-purple-500"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 text-white" strokeWidth={5} /> : <div className="w-1 h-1 bg-white/20 rounded-full"></div>}
                      </button>

                      <div className={`transition-opacity duration-300 ${isCompleted ? "opacity-40" : "opacity-100"}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[9px] font-black tracking-widest uppercase text-indigo-400">Step {step.step}</span>
                          <span className="text-[9px] font-medium text-white/30 flex items-center gap-1">
                             <Clock className="w-2.5 h-2.5" /> {step.timeframe}
                          </span>
                          <StatusBadge color={step.difficulty.toLowerCase().includes("beginner") ? "green" : "orange"}>{step.difficulty}</StatusBadge>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-white">{step.title}</h3>

                        <p className="text-white/60 text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap">
                          {step.desc}
                        </p>

                        {/* Tools */}
                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {step.tools.map((t, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] font-medium text-white/50 uppercase tracking-tighter">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Milestones & Anti-patterns */}
                        <div className="grid md:grid-cols-2 gap-3">
                          {step.milestones.length > 0 && (
                            <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl">
                              <h4 className="text-[8px] font-black uppercase tracking-widest text-blue-300 mb-2 flex items-center gap-2">
                                <Zap className="w-2.5 h-2.5" /> Checkpoints
                              </h4>
                              <ul className="space-y-2">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-xs text-white/70 flex gap-2 leading-relaxed">
                                    <span className="text-blue-400 font-bold">•</span> {m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl">
                               <h4 className="text-[8px] font-black uppercase tracking-widest text-red-300 mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-2.5 h-2.5" /> Avoid
                              </h4>
                              <ul className="space-y-2">
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. PROS & CONS */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
                <div className="p-6 bg-green-950/40 border border-green-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <h3 className="text-base font-bold text-green-300">Pros</h3>
                  </div>
                  <ul className="space-y-3">
                    {data.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></div> {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <h3 className="text-base font-bold text-red-300">Cons</h3>
                  </div>
                  <ul className="space-y-3">
                    {data.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0"></div> {c}
                      </li>
                    ))}
                  </ul>
                </div>
            </div>

            {/* 5. FUTURE OUTLOOK */}
            <div className="space-y-6">
              <div className="p-6 md:p-10 bg-purple-950/40 border border-purple-500/30 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                   <TrendingUp className="w-24 h-24" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-purple-300">Future Outlook</h3>
                <p className="text-sm md:text-base text-white/60 leading-relaxed mb-6">{data.future}</p>
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 inline-flex items-center gap-2">
                   <Award className="w-4 h-4 text-purple-300" />
                   <p className="text-purple-200 text-[10px] font-bold uppercase tracking-wider">{data.opportunity}</p>
                </div>
              </div>

              {/* 6. HOW TO START */}
              <div className="p-6 md:p-10 bg-blue-950/40 border border-blue-500/30 rounded-2xl">
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-blue-300">How to Start</h3>
                <div className="space-y-3 mb-8">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 hover:bg-white/[0.02] rounded-xl transition-colors">
                      <span className="text-lg font-bold text-blue-400/30">{i+1}.</span>
                      <p className="text-white/70 text-sm md:text-base">{h}</p>
                    </div>
                  ))}
                </div>

                {/* Pro Tip */}
                <div className="p-4 bg-yellow-950/40 border border-yellow-500/30 rounded-xl flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-yellow-300/60 font-black tracking-widest uppercase text-[8px] mb-1">Pro Tip</h4>
                    <p className="text-yellow-100/80 text-sm leading-relaxed italic">"{data.proTip}"</p>
                  </div>
                </div>
              </div>

              {/* 7. RESOURCES */}
              {data.links.length > 0 && (
                <div className="p-6 md:p-10 bg-white/5 border border-white/10 rounded-2xl">
                   <h3 className="text-[9px] font-black tracking-widest uppercase text-white/30 mb-6 text-center">Resources</h3>
                   <div className="grid sm:grid-cols-2 gap-3">
                    {data.links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl group hover:border-blue-500/50 transition-all">
                        <div className="flex items-center gap-3">
                           <ExternalLink className="w-3.5 h-3.5 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                           <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{l.name}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-white/20 group-hover:translate-x-1 transition-all" />
                      </a>
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