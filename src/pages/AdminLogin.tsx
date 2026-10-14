import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, User, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedId = adminId.trim();
    // Accept either the Admin ID 'PAFSS26' or full email
    const email = trimmedId.includes('@') 
      ? trimmedId 
      : `${trimmedId.toLowerCase()}@society.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Invalid Admin ID or Password. (Reminder: Admin ID: PAFSS26, Password: register)' 
        : error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-comic-dots p-4 selection:bg-[#0056A8] selection:text-white">
      <div className="max-w-md w-full mx-auto pt-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-[#0056A8] transition-colors mb-4 bg-white px-3.5 py-1.5 rounded-full border-2 border-slate-900 comic-shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fun Portal</span>
        </Link>
      </div>

      <div className="flex items-center justify-center my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl border-3 border-slate-900 comic-shadow-lg p-7 sm:p-9 relative"
        >
          <div className="text-center mb-7">
            <div className="flex items-center justify-between gap-3 mb-6 px-2">
              <img src="/paf_iast_logo.png" alt="PAF-IAST" className="h-11 sm:h-12 w-auto object-contain" />
              <div className="h-7 w-px bg-slate-300"></div>
              <img src="/science_society_logo.png" alt="Science Society" className="h-11 sm:h-12 w-auto object-contain" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300 text-slate-950 text-xs font-black border-2 border-slate-900 comic-shadow-sm mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Vault Sign-In</span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900">Confidential Admin</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">Access submitted anonymous comments & hot takes</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-100 text-red-900 border-2 border-red-500 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <p className="text-xs sm:text-sm font-bold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Admin ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 rounded-xl comic-input bg-slate-50 text-slate-900 text-sm font-bold placeholder:text-slate-400"
                  placeholder="PAFSS26"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 rounded-xl comic-input bg-slate-50 text-slate-900 text-sm font-bold placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-black text-white bg-[#0056A8] hover:bg-[#004282] comic-btn disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Verifying Admin...' : 'Unlock Admin Vault 🔑'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Admin credentials: <span className="font-black text-slate-800">PAFSS26</span> / <span className="font-black text-slate-800">register</span>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="text-center py-4 text-xs text-slate-500 font-bold">
        PAF-IAST Science Society • Admin Access
      </div>
    </div>
  );
}
