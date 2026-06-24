import { ArrowLeft, Box, Target, Layers, LineChart, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Process() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">
            Our Process
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            How we demystify the global career landscape to provide you with absolute clarity and actionable direction.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl relative overflow-hidden aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
              <Globe className="w-32 h-32 text-indigo-400/50" strokeWidth={1} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xl">
                  1
                </span>
                <h2 className="text-3xl font-bold">Country-Specific Mapping</h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                A computer science degree in Germany is not equivalent to a B.Tech in India. We begin by charting the unique academic and professional taxonomy of your local region.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Cultural expectations and norms
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Degree equivalencies and validation
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Regional job market biases
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xl">
                  2
                </span>
                <h2 className="text-3xl font-bold">Taxonomy of Roles</h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Next, we break down industry roles far beyond generic titles. What does a "Developer" actually do? We split domains into specialized sub-classes to match your precise strengths.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Mapping traditional vs. emerging roles
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Deep-dive into day-to-day responsibilities
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Assessing skill adjacencies
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-white/[0.02] border border-white/5 p-12 rounded-3xl relative overflow-hidden aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"></div>
              <Layers className="w-32 h-32 text-purple-400/50" strokeWidth={1} />
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl relative overflow-hidden aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none"></div>
              <Target className="w-32 h-32 text-green-400/50" strokeWidth={1} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 flex items-center justify-center font-bold text-xl">
                  3
                </span>
                <h2 className="text-3xl font-bold">Actionable Roadmaps</h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                We distill massive amounts of unstructured industry advice into linear, actionable steps involving exactly what tools to master, which concepts to internalize, and how long it should take.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Tooling and software stacks
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Theoretical prerequisites
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Exact timeframes and difficulty curves
                </li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xl">
                  4
                </span>
                <h2 className="text-3xl font-bold">Data-Driven Evolution</h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                The market shifts rapidly. We constantly update our milestones, pro tips, and anti-patterns based on macroeconomic trends, AI disruption signals, and community feedback.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Real-time skill depreciation tracking
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Adapting to AI augmentation 
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Open-feedback loop with industry pros
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-white/[0.02] border border-white/5 p-12 rounded-3xl relative overflow-hidden aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none"></div>
              <LineChart className="w-32 h-32 text-orange-400/50" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
