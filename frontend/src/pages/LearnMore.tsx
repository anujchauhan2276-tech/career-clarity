import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, Target, Globe, Award, Shield } from "lucide-react";
import AnimatedSection from "../components/AnimatedSection";

export default function LearnMore() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-12 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <AnimatedSection>
          <h1 className="text-5xl md:text-6xl font-display font-medium tracking-tight mb-8">
            How Career Clarity Works
          </h1>
          <p className="text-xl text-gray-400 mb-16 leading-relaxed">
            We provide definitive, step-by-step roadmaps to help you pivot into high-value careers 
            across the globe. Deep architectural context over shallow tutorials.
          </p>
        </AnimatedSection>

        <div className="grid gap-12 md:gap-16">
          <AnimatedSection delay={0.1}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-purple-500/10 p-4 rounded-2xl shrink-0 border border-purple-500/20">
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-4">Hyper-Localized Context</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Every country has distinct academic systems, certification requirements, 
                  and market demands. We structure each path (e.g., Medicine in Germany, Law in Spain, 
                  Engineering in the US) to respect the literal laws and conventions of that region.
                  No generic advice.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-blue-500/10 p-4 rounded-2xl shrink-0 border border-blue-500/20">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-4">Step-by-Step Execution</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  We don't just dump resources. We map out the chronological phases of a career. 
                  From Month 1 foundational mental models to Year 4 enterprise architecture, 
                  you will always know exactly what phase you are in, and what tools you must master.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-emerald-500/10 p-4 rounded-2xl shrink-0 border border-emerald-500/20">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-4">Anti-Patterns & Traps</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Success is often defined by what you avoid doing. Each phase highlights common 
                  traps, pitfalls, and anti-patterns that derail juniors. Avoiding them accelerates 
                  your growth dramatically.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-rose-500/10 p-4 rounded-2xl shrink-0 border border-rose-500/20">
                <BookOpen className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-4">Native Languages Support</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Whenever possible, we provide content translated to the native language of the selected region. 
                  This ensures that local terminology and specific regional exams are represented accurately.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.5}>
           <div className="mt-24 p-10 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-sm">
             <h3 className="text-3xl font-medium tracking-tight mb-6">Ready to find your path?</h3>
             <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Explore the top global markets and uncover the exact roadmap you need to build mastery.
             </p>
             <Link
                to="/setup"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition-colors duration-300 shadow-xl"
             >
                Explore Destinations
             </Link>
           </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
