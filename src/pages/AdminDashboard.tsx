import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, LogOut, FileText, ChevronRight, X, Calendar, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const filteredApps = applications.filter(app => {
    const term = search.toLowerCase();
    return (
      (app.applicant_name && app.applicant_name.toLowerCase().includes(term)) ||
      (app.registration_number && app.registration_number.toLowerCase().includes(term)) ||
      (app.applied_position && app.applied_position.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/paf_iast_logo.png" alt="PAF-IAST" className="h-9 w-auto object-contain" />
              <div className="h-6 w-px bg-slate-200"></div>
              <img src="/science_society_logo.png" alt="Science Society" className="h-8 w-auto object-contain hidden sm:block" />
              <span className="text-lg font-bold text-slate-900 border-l border-slate-200 pl-3 ml-1">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                PAFSS26
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Applications</h1>
            <p className="text-sm text-slate-500 mt-1">View all submitted recruitment applications.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, reg no, or position..."
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-white text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 relative"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading applications...</td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      {search ? "No matching applications found." : "No applications have been submitted yet."}
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm">
                            {app.applicant_name?.charAt(0) || '?'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{app.applicant_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {app.registration_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {app.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-brand-blue border border-blue-100">
                          {app.applied_position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className="text-brand-blue group-hover:text-brand-blue/80 flex items-center justify-end">
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal / Slider for details */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-brand-blue" />
                  Application Details
                </h2>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-2xl">
                      {selectedApp.applicant_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{selectedApp.applicant_name}</h3>
                      <div className="inline-flex items-center mt-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-brand-blue border border-blue-100">
                        {selectedApp.applied_position}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-sm"><User className="w-4 h-4 mr-1.5" /> Registration No</div>
                      <div className="font-medium text-slate-900">{selectedApp.registration_number}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-sm"><BookOpen className="w-4 h-4 mr-1.5" /> Department</div>
                      <div className="font-medium text-slate-900">{selectedApp.department}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-sm"><Calendar className="w-4 h-4 mr-1.5" /> Semester</div>
                      <div className="font-medium text-slate-900">{selectedApp.semester}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-sm"><Calendar className="w-4 h-4 mr-1.5" /> Applied On</div>
                      <div className="font-medium text-slate-900">{new Date(selectedApp.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 ml-3"></div>
                  
                  {selectedApp.answers && Object.entries(selectedApp.answers).map(([question, answer]: [string, any], index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {index + 1}
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 mb-1.5">{question}</h4>
                      <div className="text-slate-600 bg-white border border-slate-100 rounded-lg p-3 text-sm">
                        {Array.isArray(answer) ? (
                          answer.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {answer.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          ) : (
                            <span className="text-slate-400 italic">No options selected</span>
                          )
                        ) : (
                          answer || <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
