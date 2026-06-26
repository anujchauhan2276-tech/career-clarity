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
  Map
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { countryRoadmaps, premiumRoadmaps } from "../data/countryRoadmaps";

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

  // Sanitize the Base URL from .env to prevent double slashes
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

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
          // Fail silently for user progress
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
      // Fail silently
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

        const dataJson = await res.json();

        if (res.status === 403 && dataJson.is_locked) {
            navigate("/pricing", { replace: true });
            return;
        }

        if (!res.ok) {
          throw new Error("Missing");
        }

        /**
         * SMART TEXT PARSER
         * This converts the plain text you type in Django Admin into a clean list for React.
         * It looks for new lines and removes any dashes (-) or asterisks (*) you might have typed.
         */
        const parseTextToList = (item: any): string[] => {
          if (Array.isArray(item)) return item;
          if (typeof item === "string") {
            return item
              .split('\n')
              .map(line => line.trim())
              // Remove leading dashes, dots, or asterisks if the admin typed them
              .map(line => line.replace(/^[•\-\*\d\.]+\s*/, ''))
              .filter(line => line.length > 0);
          }
          return [];
        };

        // Links stay as JSON Objects as requested
        const safeLinks = (linksData: any) => {
          const arr = Array.isArray(linksData) ? linksData : [];
          return arr.map((l: any) => {
            if (typeof l === "string") {
              return { name: "Resource", url: l.startsWith("http") ? l : `https://${l}` };
            }
            return {
              name: l.name || "Resource Link",
              url: l.url || "#"
            };
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
        // No technical jargon, just set the error state to show "Coming Soon"
        setError(true);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchRoadmap();
  }, [decodedCourse, user, language, countryId, navigate, getToken, apiBase]);

  if (!countryId || !courseId) return <Navigate to="/setup" replace />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-5xl" ref={containerRef}>
        <button
          onClick={() => navigate(`/${countryId}`)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pathways
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-purple-300">
            <Loader2 className="w-12 h-12 animate-spin mb-6" />
            <p className="text-xl font-medium animate-pulse text-white/80">
              Loading roadmap...
            </p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center py-32 text-gray-400 text-center">
              <Map className="w-16 h-16 mb-6 text-white/10 mx-auto" />
              <h2 className="text-3xl font-display font-bold mb-3 text-white/90">Roadmap Coming Soon</h2>
              <p className="text-lg max-w-md mx-auto leading-relaxed">
                We are currently hand-crafting the definitive pathway for <strong>{decodedCourse}</strong>. Please check back soon!
              </p>
           </div>
        ) : data ? (
          <>
            <div className="roadmap-header mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">
                  {countryId.toUpperCase()} Roadmap
                </div>
                {supportsNative && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/50">Language:</span>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "Native" | "English")}
                      className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="English">English</option>
                      <option value="Native">Native Content</option>
                    </select>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                {data.title}
              </h1>
              <p className="text-xl text-white/70 leading-relaxed max-w-3xl whitespace-pre-wrap break-words">
                {data.description}
              </p>
            </div>

            {/* Visual Timeline */}
            <div className="roadmap-timeline bg-[#111] border border-white/10 rounded-3xl p-8 mb-12 shadow-xl">
              <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                Learning Path
              </h2>

              <div className="relative border-l-2 border-white/10 ml-4 space-y-12 pb-4">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <div key={i} className="roadmap-step-item relative pl-10">
                      {/* Node Circle */}
                      <button
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-[#111] flex items-center justify-center transition-all duration-300 ${
                          isCompleted ? "bg-green-500 scale-125" : "bg-blue-500 hover:scale-110"
                        }`}
                      >
                        {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </button>
                      
                      <div className={`bg-white/[0.03] border border-white/10 rounded-2xl p-6 transition-all duration-300 h-auto w-full ${isCompleted ? "opacity-40 grayscale" : "hover:bg-white/[0.06] hover:border-white/20"}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className={`${isCompleted ? "text-green-500" : "text-blue-400"} text-sm font-black uppercase tracking-widest`}>
                            Phase {step.step}
                          </div>
                          {isCompleted && <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-bold uppercase">Completed</span>}
                        </div>
                        
                        <h3 className={`text-2xl font-display font-bold mb-4 break-words ${isCompleted ? "line-through" : ""}`}>
                          {step.title}
                        </h3>

                        <div className="flex flex-wrap items-start gap-3 mb-6">
                          <div className="text-xs font-mono px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 h-auto break-words whitespace-normal">
                             {step.timeframe}
                          </div>
                          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border h-auto break-words whitespace-normal ${
                            step.difficulty.toLowerCase().includes("beginner") ? "bg-green-500/10 border-green-500/20 text-green-400" :
                            step.difficulty.toLowerCase().includes("intermediate") ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            "bg-orange-500/10 border-orange-500/20 text-orange-400"
                          }`}>
                            {step.difficulty}
                          </div>
                        </div>

                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 w-full mb-6">
                            {step.tools.map((tool, idx) => (
                              <span key={idx} className="text-[11px] font-bold px-2 py-1 border border-white/5 text-white/40 rounded-md bg-white/5 uppercase tracking-tight">
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-white/60 text-base leading-relaxed mb-6 whitespace-pre-wrap break-words">
                          {step.desc}
                        </p>

                        {(step.milestones.length > 0 || (step.antiPatterns && step.antiPatterns.length > 0)) && (
                          <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                            {step.milestones.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Milestones</h4>
                                <ul className="space-y-2">
                                  {step.milestones.map((m, mIdx) => (
                                    <li key={mIdx} className="text-sm text-white/70 flex gap-2 items-start break-words"><span className="text-blue-500 mt-1">→</span><span className="flex-1">{m}</span></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {step.antiPatterns && step.antiPatterns.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold text-red-400/30 uppercase tracking-widest mb-3">Avoid</h4>
                                <ul className="space-y-2">
                                  {step.antiPatterns.map((a, aIdx) => (
                                    <li key={aIdx} className="text-sm text-white/50 flex gap-2 items-start break-words"><span className="text-red-500/50 mt-1">×</span><span className="flex-1 italic">{a}</span></li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {!user && <p className="text-[10px] text-white/20 mt-6 text-center italic uppercase tracking-tighter">Login to track your progress</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pros & Cons Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-400">
                  <CheckCircle2 className="w-6 h-6" /> Pros
                </h3>
                <ul className="space-y-4">
                  {data.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 text-lg">
                      <span className="text-green-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span> 
                      <span className="flex-1">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-red-400">
                  <XCircle className="w-6 h-6" /> Cons
                </h3>
                <ul className="space-y-4">
                  {data.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 text-lg">
                      <span className="text-red-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span> 
                      <span className="flex-1">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final Details */}
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-purple-950/30 to-black border border-purple-500/20 rounded-3xl p-8 md:p-12">
                <h3 className="text-3xl font-display font-bold mb-6 flex items-center gap-3 text-purple-300">
                  <TrendingUp className="w-8 h-8" /> Future Outlook
                </h3>
                <p className="text-xl text-white/80 leading-relaxed mb-8 break-words">{data.future}</p>
                <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-200 text-lg italic">
                  <strong>Market Opportunity:</strong> {data.opportunity}
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12">
                <h3 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-orange-400" /> Getting Started
                </h3>
                <div className="grid gap-4 mb-12">
                  {data.howTo.map((h, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 text-lg text-white/80">
                      <span className="text-orange-400 font-bold mr-3">{i+1}.</span> {h}
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex gap-5">
                  <Lightbulb className="w-10 h-10 text-yellow-500 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xl font-bold text-yellow-500 mb-2">Pro Strategist Tip</h4>
                    <p className="text-yellow-100/70 text-lg leading-relaxed whitespace-pre-wrap">{data.proTip}</p>
                  </div>
                </div>
              </div>

              {data.links.length > 0 && (
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12">
                  <h3 className="text-3xl font-display font-bold mb-8 flex items-center gap-3 text-blue-400">
                    <LinkIcon className="w-8 h-8" /> References
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:bg-blue-500/10 hover:border-blue-500/50 transition-all">
                        <span className="font-bold text-white/80 group-hover:text-blue-400 truncate pr-4">{l.name}</span>
                        <LinkIcon className="w-4 h-4 text-white/20 group-hover:text-blue-400 shrink-0" />
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