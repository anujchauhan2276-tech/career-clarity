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
  const [error, setError] = useState(false); // Changed to simple boolean!
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const decodedCourse = courseId ? decodeURIComponent(courseId) : "";
  const freePaths = countryId && countryRoadmaps[countryId] ? countryRoadmaps[countryId] : [];
  const allPaths = [...freePaths, ...premiumRoadmaps];

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
          // Silent catch
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
      // Silent catch
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

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/roadmap/get/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            courseId: decodedCourse,
            countryId: countryId,
            language: language === "Native" ? "the native language of the country" : "English"
          }),
        });

        const dataJson = await res.json();

        if (res.status === 403 && dataJson.is_locked) {
            navigate("/pricing", { replace: true });
            return;
        }

        if (!res.ok) {
          throw new Error("Not found");
        }

        // --- NEW SMART TEXT PARSER ---
        // Takes your Django text box (with dashes or newlines) and makes it a perfect list!
        const parseTextToList = (item: any): string[] => {
          if (Array.isArray(item)) return item;
          if (typeof item === "string") {
            return item
              .split('\n')
              .map(line => line.replace(/^-\s*/, '').trim()) // Removes the dash if you typed one
              .filter(line => line.length > 0);
          }
          return [];
        };

        // Links parser (Kept as JSON!)
        const safeLinks = (linksData: any) => {
          const arr = Array.isArray(linksData) ? linksData : [];
          return arr.map((l: string | { name?: string; url?: string }) => {
            if (typeof l === "string") {
              return { name: l, url: l.startsWith("http") ? l : `https://${l}` };
            }
            if (typeof l === "object" && l !== null) {
              return { name: l.name || "Resource Link", url: l.url || "#" };
            }
            return { name: "Resource Link", url: "#" };
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
        // Just fail gracefully without ugly technical jargon
        setError(true);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchRoadmap();
  }, [decodedCourse, user, language, countryId, navigate, getToken]);

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
          </div>
        ) : error ? (
           // --- BEAUTIFUL "COMING SOON" STATE ---
           <div className="flex flex-col items-center justify-center py-32 text-gray-400">
             <Map className="w-16 h-16 mb-4 text-white/20" />
             <h2 className="text-2xl font-bold mb-2 text-white/80">Roadmap Coming Soon</h2>
             <p className="text-center max-w-md">
               We are currently crafting the optimal pathway for <strong>{decodedCourse}</strong>. Check back later!
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
                      <option value="Native">Native Content</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                {data.title}
              </h1>
              <p className="text-xl text-white/70 leading-relaxed max-w-3xl whitespace-pre-wrap break-words">
                {data.description}
              </p>
            </div>

            <div className="roadmap-timeline bg-[#111] border border-white/10 rounded-3xl p-8 mb-12 shadow-xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                </span>
                Step-by-Step Learning Path
              </h2>

              <div className="relative border-l border-white/20 ml-2 sm:ml-4 space-y-10 pb-4">
                {data.roadmapSteps.map((step, i) => {
                  const isCompleted = completedSteps.includes(step.step);
                  return (
                    <div key={i} className="roadmap-step-item relative pl-6 sm:pl-8">
                      <button
                        onClick={() => toggleStep(step.step)}
                        className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full border-4 border-[#111] flex items-center justify-center transition-colors ${
                          isCompleted ? "bg-green-500" : "bg-blue-500 hover:bg-blue-400"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        ) : (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </button>
                      
                      <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-colors h-auto w-full overflow-hidden ${isCompleted ? "opacity-50" : "hover:bg-white/10"}`}>
                        <div className="flex flex-wrap items-center justify-between mb-1">
                          <div className={`${isCompleted ? "text-green-500" : "text-blue-400"} text-sm font-bold`}>
                            Phase {step.step}
                          </div>
                          {isCompleted && (
                            <span className="text-xs text-green-500 font-bold uppercase">Completed</span>
                          )}
                        </div>
                        
                        <h3 className={`text-lg font-bold mb-3 break-words ${isCompleted ? "line-through text-white/50" : ""}`}>
                          {step.title}
                        </h3>

                        <div className="flex flex-wrap items-start gap-3 mb-4 max-w-full">
                          <span className="text-xs font-mono px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white/90 h-auto break-words whitespace-normal max-w-full text-left">
                            ⏳ {step.timeframe}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-md border h-auto break-words whitespace-normal max-w-full text-left ${
                            step.difficulty === "Beginner" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                            step.difficulty === "Intermediate" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            step.difficulty === "Advanced" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                            "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}>
                            ⚡ {step.difficulty}
                          </span>
                        </div>

                        {step.tools.length > 0 && (
                          <div className="flex flex-wrap gap-2 w-full mb-4">
                            {step.tools.map((tool, idx) => (
                              <span key={idx} className="text-xs font-medium px-2 py-1 border border-indigo-500/30 text-indigo-300 rounded-md bg-indigo-500/10 h-auto break-words whitespace-normal max-w-full">
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-white/70 text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">
                          {step.desc}
                        </p>

                        {(step.milestones.length > 0 || step.antiPatterns.length > 0) && (
                          <div className="bg-black/30 rounded-xl p-4 border border-white/5 mt-4">
                            {step.milestones.length > 0 && (
                              <>
                                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  Key Milestones
                                </h4>
                                <ul className="space-y-2 mb-4">
                                  {step.milestones.map((milestone, mIdx) => (
                                    <li key={mIdx} className="text-sm text-white/70 flex gap-2 items-start break-words w-full">
                                      <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                                      <span className="whitespace-pre-wrap flex-1">{milestone}</span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                            
                            {step.antiPatterns.length > 0 && (
                              <>
                                <h4 className="text-xs font-bold text-red-400/80 uppercase tracking-wider mb-3 flex items-center gap-2 mt-4">
                                  Anti-Patterns (Avoid)
                                </h4>
                                <ul className="space-y-2">
                                  {step.antiPatterns.map((anti, aIdx) => (
                                    <li key={aIdx} className="text-sm text-white/60 flex gap-2 items-start break-words w-full">
                                      <span className="text-red-500/80 mt-0.5 shrink-0 w-3 text-center">×</span>
                                      <span className="whitespace-pre-wrap flex-1">{anti}</span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}

                        {!user && (
                          <p className="text-xs text-white/40 mt-3 italic">
                            Log in to track your progress
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="comparison-section grid md:grid-cols-2 gap-6 mb-12">
              <div className="space-y-6">
                <div className="comparison-card bg-[#111] border border-white/10 rounded-2xl p-6 h-full shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" /> Pros
                  </h3>
                  <ul className="space-y-3">
                    {data.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 break-words">
                        <span className="text-green-500 mt-1 shrink-0">•</span> 
                        <span className="flex-1">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="comparison-card bg-[#111] border border-white/10 rounded-2xl p-6 h-full shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" /> Cons
                  </h3>
                  <ul className="space-y-3">
                    {data.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 break-words">
                        <span className="text-red-500 mt-1 shrink-0">•</span> 
                        <span className="flex-1">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="details-section space-y-8">
              <div className="detail-block bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-300">
                  <TrendingUp className="w-6 h-6" /> Future Outlook & Opportunities
                </h3>
                <p className="text-white/80 leading-relaxed mb-6 whitespace-pre-wrap break-words">
                  {data.future}
                </p>
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-200 break-words">
                  <strong>Opportunity:</strong> {data.opportunity}
                </div>
              </div>

              <div className="detail-block bg-[#111] border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-orange-400" /> How to Start
                </h3>
                <div className="space-y-3 text-white/80 mb-8">
                  {data.howTo.map((step, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 break-words">
                      {step}
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex gap-4">
                  <Lightbulb className="w-6 h-6 text-yellow-500 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-yellow-500 mb-1">Pro Tip</h4>
                    <p className="text-yellow-200/80 text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {data.proTip}
                    </p>
                  </div>
                </div>
              </div>

              {data.links.length > 0 && (
                <div className="detail-block bg-[#111] border border-white/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                    <LinkIcon className="w-6 h-6" /> References & Further Reading
                  </h3>
                  <ul className="space-y-3">
                    {data.links.map((link, i) => (
                      <li key={i} className="truncate">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2 w-fit max-w-full"
                        >
                          <span className="truncate">{link.name}</span> <LinkIcon className="w-3 h-3 shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}