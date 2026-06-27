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

// ✅ FIX: All colors are solid hex only — no rgba, no Tailwind opacity modifiers.
// Nested TintBox-inside-TintBox was forcing double alpha compositing on Android,
// which is what caused the GPU glitch at the How To Start / Resources boundary.
const TINT = {
  red:    { bg: "#3F1212", border: "#6B2323", text: "#FCA5A5", icon: "#F87171" },
  blue:   { bg: "#12233F", border: "#23416B", text: "#93C5FD", icon: "#60A5FA" },
  green:  { bg: "#15311E", border: "#276640", text: "#86EFAC", icon: "#4ADE80" },
  purple: { bg: "#241B3F", border: "#3F2E6B", text: "#C4B5FD", icon: "#A78BFA" },
  yellow: { bg: "#3F3212", border: "#6B5423", text: "#FDE68A", icon: "#FBBF24" },
  orange: { bg: "#3F2512", border: "#6B3F23", text: "#FDBA74", icon: "#FB923C" },
} as const;

type TintColor = keyof typeof TINT;

// ✅ FIX: TintBox now uses inline style only — no className color overrides that
// could conflict or produce mixed compositing contexts.
const TintBox = ({
  color,
  rounded = "xl",
  className = "",
  children,
}: {
  color: TintColor;
  rounded?: "xl" | "2xl";
  className?: string;
  children: React.ReactNode;
}) => {
  const t = TINT[color];
  return (
    <div
      className={`${rounded === "2xl" ? "rounded-2xl" : "rounded-xl"} border ${className}`}
      style={{ backgroundColor: t.bg, borderColor: t.border }}
    >
      {children}
    </div>
  );
};

const SectionLabel = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-1.5 rounded-md border" style={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: TINT.purple.icon }} />
      </div>
      <h2 className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: "#666" }}>{title}</h2>
    </div>
    <p className="text-[9px] font-medium ml-8 uppercase tracking-widest" style={{ color: "#444" }}>{subtitle}</p>
  </div>
);

const StatusBadge = ({ children, color = "purple" as TintColor }: { children: React.ReactNode, color?: TintColor }) => {
  const t = TINT[color];
  return (
    <span
      className="px-2.5 py-0.5 border rounded-md text-[9px] font-bold tracking-wider uppercase"
      style={{ backgroundColor: t.bg, borderColor: t.border, color: t.text }}
    >
      {children}
    </span>
  );
};

const LanguageToggle = ({
  value,
  nativeLabel,
  onChange,
}: {
  value: "Native" | "English";
  nativeLabel: string;
  onChange: (v: "Native" | "English") => void;
}) => {
  const baseBtn = "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider";
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "#050505", border: "1px solid #222" }}>
      <button
        type="button"
        onClick={() => onChange("English")}
        className={baseBtn}
        style={{
          backgroundColor: value === "English" ? "#7C3AED" : "transparent",
          color: value === "English" ? "#fff" : "#555",
        }}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("Native")}
        className={baseBtn}
        style={{
          backgroundColor: value === "Native" ? "#7C3AED" : "transparent",
          color: value === "Native" ? "#fff" : "#555",
        }}
      >
        {nativeLabel}
      </button>
    </div>
  );
};

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

  useEffect(() => {
    if (user && decodedCourse) {
      try {
        const key = `user_progress_${user.uid}_${decodedCourse}`;
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          setCompletedSteps(parsed.completedSteps || []);
        }
      } catch (e) {
        console.error("Local persistence read error");
      }
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
      localStorage.setItem(key, JSON.stringify({ completedSteps: newCompleted, lastUpdated: new Date().toISOString() }));
    } catch (e) {
      console.error("Local persistence write error");
    }
  };

  const supportsNative = ["es", "de", "fr", "cn", "jp", "kr", "ru", "in"].includes(countryId || "");
  const [language, setLanguage] = useState<"Native" | "English">(urlLang || "English");

  useEffect(() => {
    if (urlLang !== language) {
      const params = new URLSearchParams(searchParams);
      params.set("lang", language);
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [language, navigate, searchParams, urlLang]);

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

  const getNativeLanguageName = () => {
    const languageMap: Record<string, string> = {
      es: "Español", de: "Deutsch", fr: "Français", cn: "中文",
      jp: "日本語", kr: "한국어", ru: "Русский", in: "हिन्दी"
    };
    return languageMap[countryId || ""] || "Native";
  };

  return (
    // ✅ FIX: bg-[#020202] replaced with solid bg-black. Near-black custom
    // values like #020202 can trigger sub-pixel dithering on some Android
    // GPU drivers during scroll, contributing to the scan-line artifact.
    <div className="min-h-screen bg-black text-white pt-20 pb-20 font-sans">

      {/* Progress bar — position:fixed gets its own compositor layer naturally */}
      {data && !loading && !error && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100]" style={{ backgroundColor: "#111" }}>
          <div
            className="h-full origin-left"
            style={{
              background: "linear-gradient(to right, #6366f1, #ec4899)",
              transform: `scaleX(${progressPercent / 100})`,
              width: "100%",
              transition: "transform 0.5s ease-out",
            }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-10 max-w-5xl" ref={containerRef}>

        <button
          onClick={() => navigate(`/${countryId}`)}
          className="flex items-center gap-2 mb-8 font-bold text-[10px] tracking-widest uppercase"
          style={{ color: "#444" }}
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: "#7C3AED", opacity: 0.5 }} />
            <p className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: "#333" }}>Loading...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a" }}>
              <Map className="w-8 h-8" style={{ color: "#222" }} />
            </div>
            <h2 className="text-xl font-bold mb-3 uppercase tracking-tight">Path Under Maintenance</h2>
            <p className="max-w-xs mx-auto text-sm leading-relaxed" style={{ color: "#555" }}>
              The data for <strong>{decodedCourse}</strong> is currently being verified for {countryId.toUpperCase()} standards.
            </p>
          </div>
        ) : data ? (
          <div>

            {/* HERO */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <StatusBadge color="purple">{countryId}</StatusBadge>
                {progressPercent > 0 && <StatusBadge color="green">{progressPercent}% Done</StatusBadge>}
                <div className="h-px flex-grow" style={{ backgroundColor: "#1a1a1a" }} />
                {supportsNative && (
                  <LanguageToggle value={language} nativeLabel={getNativeLanguageName()} onChange={setLanguage} />
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight text-white">
                {data.title}
              </h1>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "#aaa" }}>
                {data.description}
              </p>
            </div>

            {/* STEPS */}
            <div className="mb-10">
              <SectionLabel icon={Target} title="Steps" subtitle="Follow in order" />
              <div className="relative ml-2 md:ml-4 space-y-10" style={{ borderLeft: "1px solid #1e1e1e" }}>
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <div key={i} className="relative pl-8 md:pl-12">
                      <button
                        onClick={() => toggleStep(step.step)}
                        className="absolute -left-[13px] top-0 w-6 h-6 rounded-lg flex items-center justify-center z-10"
                        style={{
                          backgroundColor: isCompleted ? "#22c55e" : "#050505",
                          border: isCompleted ? "2px solid #4ade80" : "2px solid #222",
                        }}
                      >
                        {isCompleted
                          ? <Check className="w-4 h-4 text-white" strokeWidth={5} />
                          : <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#333" }} />
                        }
                      </button>

                      <div style={{ opacity: isCompleted ? 0.4 : 1 }}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: TINT.purple.icon }}>Step {step.step}</span>
                          <span className="text-[9px] font-medium flex items-center gap-1" style={{ color: "#555" }}>
                            <Clock className="w-2.5 h-2.5" /> {step.timeframe}
                          </span>
                          <StatusBadge color={step.difficulty.toLowerCase().includes("beginner") ? "green" : "orange"}>
                            {step.difficulty}
                          </StatusBadge>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-white">{step.title}</h3>
                        <p className="text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: "#888" }}>
                          {step.desc}
                        </p>

                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {step.tools.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-tighter"
                                style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", color: "#666" }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-3">
                          {step.milestones.length > 0 && (
                            <TintBox color="blue" className="p-4">
                              <h4 className="text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: TINT.blue.text }}>
                                <Zap className="w-2.5 h-2.5" /> Checkpoints
                              </h4>
                              <ul className="space-y-2">
                                {step.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="text-xs flex gap-2 leading-relaxed" style={{ color: "#ccc" }}>
                                    <span className="font-bold" style={{ color: TINT.blue.icon }}>•</span> {m}
                                  </li>
                                ))}
                              </ul>
                            </TintBox>
                          )}
                          {step.antiPatterns && step.antiPatterns.length > 0 && (
                            <TintBox color="red" className="p-4">
                              <h4 className="text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: TINT.red.text }}>
                                <ShieldAlert className="w-2.5 h-2.5" /> Avoid
                              </h4>
                              <ul className="space-y-2">
                                {step.antiPatterns.map((a, aIdx) => (
                                  <li key={aIdx} className="text-xs flex gap-2 leading-relaxed italic" style={{ color: "#aaa" }}>
                                    <span className="font-black" style={{ color: TINT.red.icon }}>×</span> {a}
                                  </li>
                                ))}
                              </ul>
                            </TintBox>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROS & CONS */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              <TintBox color="green" rounded="2xl" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4" style={{ color: TINT.green.icon }} />
                  <h3 className="text-base font-bold" style={{ color: TINT.green.text }}>Pros</h3>
                </div>
                <ul className="space-y-3">
                  {data.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#ccc" }}>
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: TINT.green.icon }} /> {p}
                    </li>
                  ))}
                </ul>
              </TintBox>

              <TintBox color="red" rounded="2xl" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-4 h-4" style={{ color: TINT.red.icon }} />
                  <h3 className="text-base font-bold" style={{ color: TINT.red.text }}>Cons</h3>
                </div>
                <ul className="space-y-3">
                  {data.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#ccc" }}>
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: TINT.red.icon }} /> {c}
                    </li>
                  ))}
                </ul>
              </TintBox>
            </div>

            {/* FUTURE OUTLOOK */}
            <div className="space-y-6">
              <TintBox color="purple" rounded="2xl" className="p-6 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 pointer-events-none" style={{ opacity: 0.03 }}>
                  <TrendingUp className="w-24 h-24" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: TINT.purple.text }}>Future Outlook</h3>
                <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "#aaa" }}>{data.future}</p>
                <div
                  className="p-3 rounded-xl inline-flex items-center gap-2"
                  style={{ backgroundColor: TINT.purple.border, border: `1px solid ${TINT.purple.border}` }}
                >
                  <Award className="w-4 h-4" style={{ color: TINT.purple.text }} />
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TINT.purple.text }}>{data.opportunity}</p>
                </div>
              </TintBox>

              {/* HOW TO START
                  ✅ FIX: Pro Tip is NO LONGER a nested TintBox inside another TintBox.
                  Nesting two elements that both have inline backgroundColor was the
                  direct cause of the GPU compositing glitch at this section boundary.
                  Pro Tip is now a plain div with a solid border-top separator instead. */}
              <TintBox color="blue" rounded="2xl" className="p-6 md:p-10">
                <h3 className="text-xl md:text-2xl font-bold mb-6" style={{ color: TINT.blue.text }}>How to Start</h3>
                <div className="space-y-3 mb-8">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 rounded-xl">
                      <span className="text-lg font-bold" style={{ color: TINT.blue.icon }}>{i + 1}.</span>
                      <p className="text-sm md:text-base" style={{ color: "#ccc" }}>{h}</p>
                    </div>
                  ))}
                </div>

                {/* Pro Tip — flat div, no nesting, no extra backgroundColor layer */}
                <div
                  className="flex gap-4 items-start p-4 rounded-xl"
                  style={{ borderTop: `1px solid ${TINT.blue.border}`, backgroundColor: "#0a1628" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: TINT.yellow.border }}
                  >
                    <Lightbulb className="w-4 h-4" style={{ color: TINT.yellow.icon }} />
                  </div>
                  <div>
                    <h4 className="font-black tracking-widest uppercase text-[8px] mb-1" style={{ color: TINT.yellow.text }}>Pro Tip</h4>
                    <p className="text-sm leading-relaxed italic" style={{ color: TINT.yellow.text }}>"{data.proTip}"</p>
                  </div>
                </div>
              </TintBox>

              {/* RESOURCES */}
              {data.links.length > 0 && (
                <div
                  className="p-6 md:p-10 rounded-2xl"
                  style={{ backgroundColor: "#0a0a0a", border: "1px solid #1e1e1e" }}
                >
                  <h3 className="text-[9px] font-black tracking-widest uppercase text-center mb-6" style={{ color: "#444" }}>Resources</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {data.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}
                      >
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-3.5 h-3.5" style={{ color: "#4b87c8" }} />
                          <span className="text-xs font-bold" style={{ color: "#888" }}>{l.name}</span>
                        </div>
                        <ChevronRight className="w-3 h-3" style={{ color: "#333" }} />
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