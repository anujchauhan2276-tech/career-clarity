import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { countryRoadmaps, premiumRoadmaps, nativeCountryRoadmaps, nativePremiumRoadmaps } from "../data/countryRoadmaps";
import { ChevronRight, Lock, Unlock, Search, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const COUNTRIES: Record<string, string> = {
  us: "United States", in: "India", jp: "Japan", cn: "China", kr: "South Korea",
  uk: "United Kingdom", de: "Germany", es: "Spain", fr: "France", ru: "Russia",
};

// UI Translations
const UI_DICT: Record<string, any> = {
  en: { title: "Pathways for", subtitle: "Explore the top in-demand career and educational roadmaps tailored to your region.", search: "Search roadmaps in", noResults: "No roadmaps found", noResultsDesc: "We couldn't find any paths matching", traditional: "Traditional Pathways", bonus: "Bonus Pathways", bonusSub: "(Emerging & Underrated)", premium: "Premium Pathways", premiumSub: "(Advanced, Modern & Entrepreneurial)", back: "Back to Country Selector", lang: "Language:", premiumBadge: "Premium" },
  jp: { title: "の経路", subtitle: "あなたの地域に合わせた、需要の高いキャリアと教育のロードマップを探索してください。", search: "検索...", noResults: "ロードマップが見つかりません", noResultsDesc: "一致する経路が見つかりませんでした:", traditional: "伝統的な経路", bonus: "ボーナス経路", bonusSub: "(新興・過小評価)", premium: "プレミアム経路", premiumSub: "(高度・現代的・起業家)", back: "国選択に戻る", lang: "表示言語:", premiumBadge: "プレミアム" },
  es: { title: "Rutas para", subtitle: "Explora las hojas de ruta profesionales y educativas más demandadas adaptadas a tu región.", search: "Buscar rutas en", noResults: "No se encontraron rutas", noResultsDesc: "No pudimos encontrar rutas que coincidan con", traditional: "Rutas Tradicionales", bonus: "Rutas de Bonificación", bonusSub: "(Emergentes y Subestimadas)", premium: "Rutas Premium", premiumSub: "(Avanzadas, Modernas y Emprendedoras)", back: "Volver a Países", lang: "Idioma:", premiumBadge: "Premium" },
  fr: { title: "Parcours pour", subtitle: "Explorez les feuilles de route professionnelles et éducatives les plus demandées, adaptées à votre région.", search: "Rechercher des parcours en", noResults: "Aucun parcours trouvé", noResultsDesc: "Nous n'avons trouvé aucun parcours correspondant à", traditional: "Parcours Traditionnels", bonus: "Parcours Bonus", bonusSub: "(Émergents et Sous-estimés)", premium: "Parcours Premium", premiumSub: "(Avancés, Modernes et Entrepreneuriaux)", back: "Retour aux Pays", lang: "Langue:", premiumBadge: "Premium" },
  de: { title: "Wege für", subtitle: "Entdecken Sie die gefragtesten Karriere- und Bildungs-Roadmaps, zugeschnitten auf Ihre Region.", search: "Suche Roadmaps in", noResults: "Keine Roadmaps gefunden", noResultsDesc: "Wir konnten keine passenden Wege finden für", traditional: "Traditionelle Wege", bonus: "Bonus-Wege", bonusSub: "(Aufstrebend & Unterschätzt)", premium: "Premium-Wege", premiumSub: "(Fortgeschritten, Modern & Unternehmerisch)", back: "Zurück zur Länderauswahl", lang: "Sprache:", premiumBadge: "Premium" },
  cn: { title: "路线 -", subtitle: "探索为您所在地区量身定制的最热门职业和教育路线图。", search: "搜索路线...", noResults: "未找到路线图", noResultsDesc: "我们找不到任何匹配的路径：", traditional: "传统路线", bonus: "奖励路线", bonusSub: "（新兴和被低估的）", premium: "高级路线", premiumSub: "（高级，现代与创业）", back: "返回国家选择器", lang: "语言:", premiumBadge: "高级" },
  kr: { title: "경로 -", subtitle: "귀하의 지역에 맞춘 수요가 가장 많은 직업 및 교육 로드맵을 탐색하십시오.", search: "로드맵 검색...", noResults: "로드맵을 찾을 수 없습니다", noResultsDesc: "일치하는 경로를 찾을 수 없습니다:", traditional: "전통적인 경로", bonus: "보너스 경로", bonusSub: "(신흥 및 과소평가된)", premium: "프리미엄 경로", premiumSub: "(고급, 현대 및 기업가적)", back: "국가 선택기로 돌아가기", lang: "언어:", premiumBadge: "프리미엄" },
  ru: { title: "Маршруты для", subtitle: "Изучите самые востребованные карьерные и образовательные маршруты, адаптированные для вашего региона.", search: "Поиск маршрутов в", noResults: "Маршруты не найдены", noResultsDesc: "Мы не смогли найти пути, соответствующие", traditional: "Традиционные маршруты", bonus: "Бонусные маршруты", bonusSub: "(Развивающиеся и недооцененные)", premium: "Премиум маршруты", premiumSub: "(Передовые, современные и предпринимательские)", back: "Вернуться к выбору", lang: "Язык:", premiumBadge: "Премиум" },
  in: { title: "मार्ग -", subtitle: "अपने क्षेत्र के लिए अनुकूलित सबसे अधिक मांग वाले करियर और शैक्षिक रोडमैप का अन्वेषण करें।", search: "रोडमैप खोजें...", noResults: "कोई रोडमैप नहीं मिला", noResultsDesc: "हमें इससे मेल खाने वाला कोई मार्ग नहीं मिला:", traditional: "पारंपरिक मार्ग", bonus: "बोनस मार्ग", bonusSub: "(उभरते और कम आंके गए)", premium: "प्रीमियम मार्ग", premiumSub: "(उन्नत, आधुनिक और उद्यमशील)", back: "देश चयन पर वापस जाएं", lang: "भाषा:", premiumBadge: "प्रीमियम" }
};

const getLangCode = (country: string) => {
  const map: Record<string, string> = { jp: 'ja', es: 'es', fr: 'fr', de: 'de', cn: 'zh-CN', kr: 'ko', ru: 'ru', in: 'hi' };
  return map[country] || 'en';
};

export default function CountryPath() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  if (!countryId || !COUNTRIES[countryId]) {
    return <Navigate to="/setup" replace />;
  }

  const supportsNative = ["es", "de", "fr", "cn", "jp", "kr", "ru", "in"].includes(countryId);
  const [language, setLanguage] = useState<"Native" | "English">("English");
  
  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const freePaths = countryRoadmaps[countryId] || [];
  const traditionalPaths = freePaths.slice(0, 50);
  const bonusPaths = freePaths.slice(50);
  const hasPremiumAccess = user?.email?.toLowerCase() === "anujchauhan2276@gmail.com";

  const ui = (language === "Native" && UI_DICT[countryId]) ? UI_DICT[countryId] : UI_DICT['en'];

  // FIX: This is the missing function that caused the TypeScript error
  const getNativeTitle = (path: string, idx: number, isPremiumRoute: boolean) => {
    if (!supportsNative || language === "English") return path;
    if (isPremiumRoute) return nativePremiumRoadmaps[countryId]?.[idx - 100] || path;
    return nativeCountryRoadmaps[countryId]?.[idx] || path;
  };

  useEffect(() => {
    if (language === 'English' || !supportsNative) {
        setTranslatedTitles({});
        return;
    }

    const targetLang = getLangCode(countryId);
    const cacheKey = `translations_${countryId}_${targetLang}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Object.keys(parsedCache).length > 50) {
            setTranslatedTitles(parsedCache);
            return;
        }
    }

    const translateAll = async () => {
        setIsTranslating(true);
        const allToTranslate = [...traditionalPaths, ...bonusPaths, ...premiumRoadmaps];
        const dict: Record<string, string> = {};
        let successCount = 0;
        
        try {
            const chunkSize = 15; 
            for(let i=0; i < allToTranslate.length; i+=chunkSize) {
                const chunk = allToTranslate.slice(i, i+chunkSize);
                const text = chunk.join("\n");
                
                try {
                    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
                    if (!res.ok) throw new Error("Translation blocked by Google.");
                    
                    const data = await res.json();
                    
                    const translatedText = data[0].map((item: any) => item[0] || "").join("");
                    const translatedArray = translatedText.split("\n").map((s: string) => s.trim()).filter(Boolean);
                    
                    chunk.forEach((eng, idx) => {
                        dict[eng] = translatedArray[idx] || eng;
                    });
                    successCount++;
                } catch(chunkErr) {
                    chunk.forEach(eng => dict[eng] = eng); 
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
                setTranslatedTitles({...dict});
            }
            
            if (successCount > 0) {
                localStorage.setItem(cacheKey, JSON.stringify(dict));
            }
        } catch(e) {
            console.error("Auto-translation critically failed", e);
        } finally {
            setIsTranslating(false);
        }
    };

    translateAll();
  }, [language, countryId, traditionalPaths, bonusPaths]);

  // Dual-Language Search Filter
  const query = searchQuery.toLowerCase().trim();
  const filterPath = (path: string, idx: number, isPremiumRoute: boolean) => {
    const engTitle = path.toLowerCase();
    const translatedTitle = getNativeTitle(path, idx, isPremiumRoute).toLowerCase();
    return engTitle.includes(query) || translatedTitle.includes(query);
  };

  const filteredTraditional = traditionalPaths
    .map((path, idx) => ({ path, idx, isPremium: false }))
    .filter(item => filterPath(item.path, item.idx, item.isPremium));

  const filteredBonus = bonusPaths
    .map((path, idx) => ({ path, idx: idx + 50, isPremium: false }))
    .filter(item => filterPath(item.path, item.idx, item.isPremium));

  const filteredPremium = premiumRoadmaps
    .map((path, idx) => ({ path, idx: idx + 100, isPremium: true }))
    .filter(item => filterPath(item.path, item.idx, item.isPremium));

  const totalResults = filteredTraditional.length + filteredBonus.length + filteredPremium.length;

  const renderCard = (path: string, idx: number, isPremiumRoute: boolean) => {
    const isLocked = isPremiumRoute && !hasPremiumAccess;
    const displayTitle = getNativeTitle(path, idx, isPremiumRoute);

    return (
      <div
        key={idx}
        onClick={() => {
          if (isLocked) {
            navigate("/pricing");
          } else {
            navigate(`/${countryId}/roadmap/${encodeURIComponent(path)}?lang=${language}`);
          }
        }}
        // FIX: Stripped all shadow-lg, backdrop-blur, and transform-gpu from here! 
        // This is now purely flat CSS so your phone GPU doesn't melt.
        className={`pathway-card flex flex-col justify-between p-4 sm:p-5 min-h-[100px] sm:min-h-[120px] rounded-xl border group cursor-pointer ${
          isTranslating && !translatedTitles[path] ? "opacity-70" : ""
        } ${
          isPremiumRoute
            ? hasPremiumAccess
              ? "border-yellow-500/30 bg-[#1a1500] hover:bg-yellow-900/30 hover:border-yellow-500/50"
              : "border-yellow-500/10 bg-[#110d00] hover:bg-yellow-900/20"
            : "border-white/10 bg-[#111] hover:bg-white/5 hover:border-purple-500/30"
        }`}
      >
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          <span
            className={`font-semibold text-sm sm:text-base leading-snug break-words ${isPremiumRoute ? "text-yellow-200/90" : "text-white/90"}`}
          >
            {displayTitle}
          </span>
          {isPremiumRoute &&
            (isLocked ? (
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500/50 shrink-0 mt-1" />
            ) : (
              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 shrink-0 mt-1" />
            ))}
        </div>
        <div className="flex justify-end mt-3 sm:mt-4 items-center gap-2 sm:gap-3">
          {isLocked && (
            <span className="text-[10px] sm:text-xs font-bold text-yellow-600/80 uppercase tracking-wider">
              {ui.premiumBadge}
            </span>
          )}
          <ChevronRight
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isPremiumRoute ? "text-yellow-500/40" : "text-white/20 group-hover:text-purple-400"}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 flex flex-col items-center justify-start text-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl" ref={containerRef}>
        
        <button
          onClick={() => navigate('/setup')}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {ui.back}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
            {language === 'Native' && countryId !== 'en' ? '' : ui.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
              {COUNTRIES[countryId]}
            </span>
            {language === 'Native' && countryId === 'jp' && 'の経路'}
            {language === 'Native' && ['kr', 'cn', 'in'].includes(countryId) && ui.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            {ui.subtitle}
          </p>

          {supportsNative && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                {ui.lang}
              </span>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
                <button
                  onClick={() => setLanguage("English")}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    language === "English" 
                      ? "bg-purple-500 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("Native")}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    language === "Native" 
                      ? "bg-purple-500 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Native 
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto mb-16 relative group mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all text-base sm:text-lg shadow-xl"
            placeholder={`${ui.search} ${COUNTRIES[countryId]}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{ui.noResults}</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              {ui.noResultsDesc} "<span className="text-white">{searchQuery}</span>".
            </p>
          </div>
        ) : (
          <>
            {filteredTraditional.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-6 sm:mb-8 flex items-center gap-3">
                  {ui.traditional}
                  <div className="h-px bg-white/20 flex-grow ml-4"></div>
                </h2>
                <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredTraditional.map((item) => renderCard(item.path, item.idx, item.isPremium))}
                </div>
              </div>
            )}

            {filteredBonus.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-6 sm:mb-8 flex items-center gap-3 text-purple-300">
                  <span className="shrink-0">{ui.bonus}</span>
                  <span className="text-xs sm:text-sm font-normal text-purple-300/60 hidden sm:inline shrink-0">
                    {ui.bonusSub}
                  </span>
                  <div className="h-px bg-purple-500/30 flex-grow ml-2 sm:ml-4"></div>
                </h2>
                <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredBonus.map((item) => renderCard(item.path, item.idx, item.isPremium))}
                </div>
              </div>
            )}

            {filteredPremium.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-6 sm:mb-8 flex items-center gap-3 text-yellow-500">
                  <span className="shrink-0">{ui.premium}</span>
                  <span className="text-xs sm:text-sm font-normal text-yellow-500/60 hidden sm:inline shrink-0">
                    {ui.premiumSub}
                  </span>
                  <div className="h-px bg-yellow-500/30 flex-grow ml-2 sm:ml-4"></div>
                </h2>
                <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredPremium.map((item) => renderCard(item.path, item.idx, item.isPremium))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}