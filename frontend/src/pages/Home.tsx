import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Globe,
  Layers,
  Map,
  Compass,
  BookOpen,
  Bookmark,
  Star,
  Zap,
  Network,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FeedbackSection from "../components/FeedbackSection";
import SpaceBackground from "../components/SpaceBackground";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Globe,
    title: "Country Guides",
    desc: "Detailed, culturally accurate layouts for paths in USA, India, Japan, Europe, and more.",
  },
  {
    icon: Layers,
    title: "Roadmaps",
    desc: "Step-by-step visual roadmaps similar to 'Roadmap.sh' with pros and cons.",
  },
  {
    icon: Map,
    title: "Non-Traditional Paths",
    desc: "Actionable routes for UX/UI design, Web dev, and Entrepreneurship.",
  },
  {
    icon: Zap,
    title: "Career Insights",
    desc: "Unlock detailed insights and global market-fit assessments for your chosen field.",
  },
  {
    icon: BookOpen,
    title: "Higher Studies",
    desc: "Master's and PhD guides, strictly tailored to your target region.",
  },
  {
    icon: Bookmark,
    title: "Resource Vault",
    desc: "Curated lists of essential books, sites, and communities.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Animation only
      gsap.from(".hero-content > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-[#0A0A0A]"
      >
        <SpaceBackground />

        <div className="hero-content container mx-auto px-4 md:px-6 max-w-5xl text-center relative z-10 filter drop-shadow-lg">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-medium tracking-tighter mb-6 md:mb-8 leading-[1.05] text-white">
            Find absolute <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              clarity
            </span>{" "}
            in your future.
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Navigate traditional degrees, advanced Ph.D. paths, or modern tech
            skills with region-specific roadmaps tailored to your country.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={() => navigate("/setup")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold text-base hover:bg-gray-100 transition-all focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              Start for free
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigate("/learn-more")}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* 2. About Section */}
      <section
        ref={aboutRef}
        id="about"
        className="py-24 bg-[#0A0A0A] border-t border-white/5"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="about-img relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-900 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                alt="Students collaborating"
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
              />
            </div>
            <div className="about-text">
              <h2 className="text-4xl md:text-5xl font-display font-medium mb-6 tracking-tight text-white">
                Demystifying the global career landscape.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Every country has a unique educational ecosystem. In America,
                you major in CS; in India, you pursue a B-Tech. We dynamically
                adapt to your region to provide the most culturally relevant
                guidance.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Whether you're aiming for a classic engineering track, pivoting
                into self-taught UI/UX design, or forging your own path as an
                entrepreneur, Career Clarity untangles the complexity.
              </p>
              <button
                onClick={() => navigate("/process")}
                className="inline-flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition group text-base"
              >
                Explore our process
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Services */}
      <section
        ref={servicesRef}
        id="services"
        className="py-32 bg-[#050505] border-t border-white/5 relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] pointer-events-none"></div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-medium mb-6 tracking-tight text-white">
              Our Services
            </h2>
            <p className="text-gray-400 text-lg sm:text-xl">
              Everything you need to navigate your next chapter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <div
                key={i}
                className="service-card group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 flex flex-col gap-5"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svc.icon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-3 text-gray-100">
                    {svc.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Pricing */}
      <section
        ref={pricingRef}
        id="pricing"
        className="py-32 bg-black text-white border-t border-white/5"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-6">
              Simple, student-friendly pricing
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Access the core roadmaps entirely for free. Regional pricing
              available for premium tiers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="pricing-card p-10 rounded-3xl bg-[#0A0A0A] border border-white/10 relative overflow-hidden flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
              <div className="text-5xl font-display font-bold mb-6">
                $0
                <span className="text-lg text-gray-400 font-normal">
                  /forever
                </span>
              </div>
              <p className="text-gray-400 mb-8 h-12">
                All traditional paths, basic roadmaps, and community access.
              </p>

              <ul className="space-y-4 mb-10 flex-grow text-gray-300">
                <li className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-gray-400" />{" "}
                  <span>Country-specific data</span>
                </li>
                <li className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-400" />{" "}
                  <span>Visual standard roadmaps</span>
                </li>
              </ul>

              <button
                onClick={() => navigate("/setup")}
                className="w-full py-4 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition"
              >
                Get Started
              </button>
            </div>

            {/* Premium Tier */}
            <div className="pricing-card p-10 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 text-white relative shadow-2xl flex flex-col">
              <div className="absolute top-6 right-6 px-3 py-1 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full uppercase tracking-wider">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-5xl font-display font-bold mb-6 text-yellow-400">
                $??
                <span className="text-lg text-gray-400 font-normal">/mo</span>
              </div>
              <p className="text-gray-400 mb-8 h-12">
                Deep-dives, advanced academia (PhD/Masters), and high-level
                1-on-1s.
              </p>

              <ul className="space-y-4 mb-10 text-gray-300 flex-grow">
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-yellow-500" />{" "}
                  <span>Complete global mobility guide</span>
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-yellow-500" />{" "}
                  <span>Advanced Study Roadmaps (Ph.D, etc.)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-yellow-500" />{" "}
                  <span>Modern & Entrepreneurial skills</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-4 rounded-xl font-semibold bg-white/10 text-white cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feedback (Complete White) */}
      <FeedbackSection />
    </div>
  );
}
