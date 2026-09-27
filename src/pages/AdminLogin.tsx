import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
        ? 'Invalid Admin ID or Password. Please try again.' 
        : error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/science_society_logo.png" alt="Science Society" className="h-10 w-auto object-contain" />
            <div className="h-8 w-px bg-slate-200"></div>
            <img src="/paf_iast_logo.png" alt="PAF-IAST" className="h-12 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
          <p className="text-slate-500 mt-2">Sign in to view recruitment applications</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0056A8] focus:border-[#0056A8] bg-white transition-shadow"
                placeholder="PAFSS26"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0056A8] focus:border-[#0056A8] bg-white transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#0056A8] hover:bg-[#0056A8]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056A8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
