import { useState } from 'react';
import { Lock, User, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { verifyAdminCredentials, saveAdminSession } from '../lib/applications';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Artificial tiny pause for smooth UX
    await new Promise(r => setTimeout(r, 400));

    const isValid = verifyAdminCredentials(adminId, password);

    if (isValid) {
      saveAdminSession(adminId);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } else {
      setError('Invalid Admin ID or Password. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-900 via-[#0A1128] to-slate-950 p-4 selection:bg-blue-600 selection:text-white text-slate-100">
      
      {/* Top Bar with Back Link */}
      <div className="max-w-md w-full mx-auto pt-4 sm:pt-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Registration Portal</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="flex items-center justify-center my-auto py-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/90 rounded-3xl border border-slate-700/60 backdrop-blur-xl shadow-2xl p-7 sm:p-9 relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-7 relative z-10">
            {/* Dual Logos Header - Identical Sizes */}
            <div className="flex items-center justify-between gap-4 mb-6 px-2 pb-5 border-b border-slate-800">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center w-14 h-14 shrink-0">
                <img 
                  src="/dsc_logo.png" 
                  alt="The Data Science Community" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center w-14 h-14 shrink-0">
                <img 
                  src="/paf_iast_logo.png" 
                  alt="PAF-IAST" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrative Portal</span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Sign-In</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Enter your authorized administrative credentials to manage registrations
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 text-red-300 border border-red-500/20 flex items-start gap-2.5 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                  autoComplete="username"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-inner"
                  placeholder="Enter Admin ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>

        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-500 font-medium">
        PAF-IAST Data Science Community • Confidential Administrative System
      </div>
    </div>
  );
}
