import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../contexts/AuthContext";
import { Star, ChevronLeft, ChevronRight, Send, Trash2 } from "lucide-react";

export interface Feedback {
  id: string; 
  user_id: string; 
  name: string;
  rating: number;
  text: string;
  date: string;
}

export default function FeedbackSection() {
  const navigate = useNavigate(); 
  const { user, getToken } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Sanitize API URL
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  useEffect(() => {
    let mounted = true;
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`${apiBase}/api/feedbacks/`);
        const data = await res.json();
        if (mounted) setFeedbacks(data.feedbacks || []);
      } catch (err) {
        // Fail silently
      }
    };
    fetchFeedbacks();
    return () => { mounted = false; };
  }, [apiBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || rating === 0) return;

    setSubmitting(true);
    setErrorMsg("");
    
    const payload = {
      name: user.name || "Anonymous",
      rating,
      text,
    };

    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/feedbacks/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const savedFeedback = await res.json();
      setFeedbacks([savedFeedback, ...feedbacks]);
      setText("");
      setRating(0);
      setCurrentIndex(0);
    } catch (error: any) {
      setErrorMsg("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/feedbacks/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!res.ok) throw new Error();

      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      if (currentIndex >= feedbacks.length - 2 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error: any) {
      // Fail silently
    }
  };

  const nextFeedback = () => {
    if (feedbacks.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    }
  };

  const prevFeedback = () => {
    if (feedbacks.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
    }
  };

  const hasSubmitted = user ? feedbacks.some(f => f.user_id === user.uid) : false;
  const isAdmin = user?.email?.toLowerCase() === "anujchauhan2276@gmail.com";

  return (
    <section id="feedback" className="py-32 bg-[#050505] text-white border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-medium mb-6 tracking-tight">Hear from our community</h2>
          <p className="text-gray-400 text-lg sm:text-xl">Your journey helps the next generation of students find their path.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          <div className="bg-white/[0.02] rounded-3xl p-8 lg:p-10 border border-white/10 relative overflow-hidden backdrop-blur-sm shadow-xl">
            <h3 className="text-2xl font-medium mb-8 text-gray-100">Leave Feedback</h3>
            
            {!user ? (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                <h4 className="text-xl font-medium mb-3 text-white">Join the conversation</h4>
                <p className="text-gray-400 mb-8 max-w-xs leading-relaxed">Log in to leave a review and share your experience with the community.</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-black px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition focus:ring-2 focus:ring-white/50"
                >
                  Log In to Review
                </button>
              </div>
            ) : hasSubmitted ? (
               <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                 <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-5 border border-green-500/20">
                   <Star className="w-8 h-8 fill-current" />
                 </div>
                 <h4 className="text-2xl font-medium mb-2 text-white">Review Submitted</h4>
                 <p className="text-gray-400 mb-6">Thank you for helping us improve.</p>
                 <button
                    onClick={() => {
                      const myFeedback = feedbacks.find(f => f.user_id === user.uid);
                      if (myFeedback) handleDelete(myFeedback.id);
                    }}
                    className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                 >
                    Delete My Review
                 </button>
               </div>
            ) : null}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-7 h-7 ${star <= rating && rating !== 0 ? "fill-yellow-400 text-yellow-400" : "fill-white/10 text-white/20"}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Your Experience</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="How did Career Clarity help you?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[140px] resize-none placeholder-white/20 transition-all font-sans"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || !text.trim() || rating === 0}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-4 px-4 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
                <Send className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>

          {/* Carousel */}
          <div className="flex flex-col justify-center h-full">
            {feedbacks.length === 0 ? (
              <div className="text-center p-12 bg-white/[0.02] rounded-3xl border border-white/5">
                <p className="text-gray-500">No feedbacks yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="relative bg-[#0A0A0A] rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl overflow-hidden group min-h-[350px] flex flex-col justify-between">
                <div className="absolute -top-4 -right-4 p-8 text-white/5 pointer-events-none transform rotate-12">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="flex gap-1.5 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < (feedbacks[currentIndex]?.rating || 0) ? "fill-yellow-500 text-yellow-500" : "fill-white/10 text-white/20"}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8 min-h-[100px] break-words">
                    "{feedbacks[currentIndex]?.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                      {feedbacks[currentIndex]?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div>
                      <h4 className="font-medium text-white tracking-wide">{feedbacks[currentIndex]?.name}</h4>
                      <span className="text-sm text-gray-500">
                        {feedbacks[currentIndex]?.date ? new Date(feedbacks[currentIndex].date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10 relative z-20">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={prevFeedback}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={nextFeedback}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="ml-4 text-xs font-mono text-gray-600">
                      {currentIndex + 1} / {feedbacks.length}
                    </div>
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(feedbacks[currentIndex]?.id)}
                      className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"
                      title="Admin: Delete Feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}