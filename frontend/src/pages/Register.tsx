import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { registerWithEmail } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerWithEmail(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-gray-500 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-display font-bold text-center mb-8 mt-4">Create Account</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4 mb-8">
          <div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" required placeholder="Create Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition flex items-center justify-center mt-6">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}