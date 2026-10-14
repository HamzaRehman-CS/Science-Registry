import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  fetchAnonymousComments, 
  deleteAnonymousComment, 
  type SocietyComment 
} from '../lib/comments';
import { 
  Search, 
  LogOut, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  X,
  User,
  Coffee,
  Flame,
  AlertOctagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TeaCatSticker } from '../components/CoolMascots';

export default function AdminDashboard() {
  const [comments, setComments] = useState<SocietyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Delete modal state
  const [commentToDelete, setCommentToDelete] = useState<SocietyComment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    const { comments: data, error } = await fetchAnonymousComments();
    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await deleteAnonymousComment(commentToDelete.id);
    setDeleting(false);

    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentToDelete.id));
      setCommentToDelete(null);
    } else {
      setDeleteError(res.error || "Failed to delete comment");
    }
  };

  const handleExportCSV = () => {
    if (comments.length === 0) return;
    const headers = ["Target Person", "Comment / Roast", "Unfit Nominee Mention", "Date Submitted"];
    const rows = comments.map(c => [
      `"${c.target_name.replace(/"/g, '""')}"`,
      `"${c.comment.replace(/"/g, '""')}"`,
      `"${(c.unfit_nominee || '').replace(/"/g, '""')}"`,
      `"${new Date(c.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `paf_science_society_comments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter comments based on search
  const filteredComments = comments.filter(c => {
    const q = search.toLowerCase();
    return (
      c.target_name.toLowerCase().includes(q) ||
      c.comment.toLowerCase().includes(q) ||
      (c.unfit_nominee && c.unfit_nominee.toLowerCase().includes(q))
    );
  });

  // Calculate statistics
  const totalComments = comments.length;
  const mentionsCount: Record<string, number> = {};
  comments.forEach(c => {
    const key = c.target_name.trim();
    mentionsCount[key] = (mentionsCount[key] || 0) + 1;
  });
  const topTarget = Object.entries(mentionsCount).sort((a, b) => b[1] - a[1])[0];

  const unfitCount = comments.filter(c => c.unfit_nominee && c.unfit_nominee.trim().length > 0).length;

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-comic-dots text-slate-900 flex flex-col selection:bg-[#0056A8] selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b-3 border-slate-900 sticky top-0 z-30 py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/paf_iast_logo.png" 
              alt="PAF-IAST Logo" 
              className="h-9 sm:h-11 w-auto object-contain" 
            />
            <div className="h-6 w-px bg-slate-300"></div>
            <img 
              src="/science_society_logo.png" 
              alt="Science Society Logo" 
              className="h-9 sm:h-11 w-auto object-contain" 
            />
            <div className="hidden md:block ml-2 pl-3 border-l-2 border-slate-900">
              <h1 className="text-sm font-black text-slate-900 leading-tight">Admin Vault 🕵️‍♂️</h1>
              <p className="text-xs text-slate-500 font-semibold">Anonymous Whispers & Hot Takes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-900 comic-shadow-sm transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal View</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 border-2 border-slate-900 comic-shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex-grow">
        
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 sm:p-5 comic-shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider mb-1">
              <span>Total Whispers / Comments</span>
              <Coffee className="w-4 h-4 text-[#0056A8]" />
            </div>
            <div className="text-3xl font-black text-slate-900">{totalComments}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">100% Anonymous submissions</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 sm:p-5 comic-shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider mb-1">
              <span>Most Talked About</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">
              {topTarget ? topTarget[0] : 'None yet'}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {topTarget ? `${topTarget[1]} comment${topTarget[1] > 1 ? 's' : ''} received` : 'Awaiting entries'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 sm:p-5 comic-shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider mb-1">
              <span>Unfit Nominations Mentioned</span>
              <AlertOctagon className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">{unfitCount}</div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleExportCSV}
                disabled={comments.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-300 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl border-2 border-slate-900 comic-shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={loadComments}
                disabled={loading}
                className="inline-flex items-center justify-center p-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl border-2 border-slate-900 comic-shadow-sm transition-all cursor-pointer"
                title="Refresh comments"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-3.5 mb-6 comic-shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by person name, keywords, or comments..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0056A8] text-slate-900 font-semibold transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Comments Feed / Cards */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#0056A8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-slate-600">Retrieving confidential whispers...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-white rounded-3xl border-3 border-slate-900 p-10 text-center comic-shadow-lg max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <TeaCatSticker className="w-20 h-20" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">No Comments Found</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4">
              {search 
                ? 'No comments matched your search criteria.' 
                : 'No anonymous comments submitted yet. Share the website link with society members!'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 bg-amber-300 text-slate-900 text-xs font-black rounded-xl border-2 border-slate-900 comic-shadow-sm cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComments.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-slate-900 p-5 comic-shadow-sm hover:comic-shadow transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Target Person */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        Comment Written For
                      </div>
                      <div className="font-black text-lg text-slate-900 group-hover:text-[#0056A8] transition-colors flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#0056A8]" />
                        <span>{item.target_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(item.id, `About: ${item.target_name}\nComment: "${item.comment}"${item.unfit_nominee ? `\nUnfit Mention: "${item.unfit_nominee}"` : ''}`)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        title="Copy comment"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => setCommentToDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Comment */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border-2 border-slate-200 mb-3 text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    “{item.comment}”
                  </div>

                  {/* Unfit Nominee section if answered */}
                  {item.unfit_nominee && (
                    <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 mb-3 text-xs">
                      <div className="font-black text-rose-800 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                        <span>Voted Unfit For Position:</span>
                      </div>
                      <p className="text-slate-800 font-medium italic">
                        "{item.unfit_nominee}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata (Strictly NO author identity) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimestamp(item.created_at)}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    ANONYMOUS 🤫
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {commentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl border-3 border-slate-900 max-w-md w-full p-6 comic-shadow-lg relative"
            >
              <button
                onClick={() => setCommentToDelete(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 border-2 border-slate-900 comic-shadow-sm flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">Delete this comment?</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4 leading-relaxed">
                Are you sure you want to permanently delete the comment written for <span className="font-black text-slate-900">"{commentToDelete.target_name}"</span>?
              </p>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-300 mb-5 max-h-24 overflow-y-auto">
                "{commentToDelete.comment}"
              </div>

              {deleteError && (
                <p className="text-xs text-red-600 mb-4 font-bold">{deleteError}</p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCommentToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl border-2 border-slate-900 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-black text-white border-2 border-slate-900 comic-shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t-2 border-slate-900 bg-white py-4 text-center text-xs text-slate-600 font-bold">
        PAF-IAST Science Society • Confidential Admin Vault
      </footer>
    </div>
  );
}
