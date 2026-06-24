import { Users, Target, Shield, Heart } from "lucide-react";
import SpaceBackground from "../components/SpaceBackground";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 relative">
      <SpaceBackground />
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">About Us</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Democratizing career pathways so that anyone, anywhere can navigate the complexities of global education and professional growth.
          </p>
        </div>

        <div className="space-y-16">
          <section className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-400" />
              Our Purpose
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              The modern career landscape is incredibly complex. Traditional degrees don't always align with rapidly shifting market demands, 
              and the sheer volume of "advice" available online is often contradictory, regionally irrelevant, or purely meant to sell you courses.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              <strong>Career Clarity</strong> was born out of a simple need: To provide structured, highly accurate, and regionally tailored roadmaps 
              that remove the guesswork from building a meaningful career. We cut through the noise so you can focus on execution.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-display font-bold mb-8 text-center">Meet the Co-Founders</h2>
            <div className="grid md:grid-cols-0 gap-8">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-indigo-500/30 transition-colors">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/30 font-display font-bold text-2xl">
                  AC
                </div>
                <h3 className="text-2xl font-bold mb-2">Anuj Chauhan</h3>
                <p className="text-indigo-400 font-medium mb-4">Co-Founder & Lead Architect</p>
                <p className="text-gray-400 leading-relaxed">
                  With a deep passion for system architecture, software engineering, and educational equality, Anuj recognized that the biggest barrier to entry in tech wasn't a lack of resources—it was a lack of curation. He built the core infrastructure of Career Clarity to map complex paths intuitively.
                </p>
              </div>


            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <Shield className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold mb-4">Our Commitment</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              We pledge to keep our foundational roadmaps free forever. Education is a fundamental right, and you should never have to pay just to understand what you need to study.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
