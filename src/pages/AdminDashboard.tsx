import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  LogOut, 
  FileText, 
  ChevronRight, 
  X, 
  Calendar, 
  User, 
  BookOpen, 
  Trash2, 
  AlertTriangle, 
  Download, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAMS = [
  "All Teams",
  "Event Management",
  "Media & Content",
  "Decor & Arts",
  "Public Relations (PR)",
  "Content & Editorial",
  "General Secretary",
  "Vice President ( male )"
];

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  
  // Deletion state
  const [appToDelete, setAppToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
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

  const handleDeleteApplication = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setApplications(prev => prev.filter(app => app.id !== id));
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
      setAppToDelete(null);
      setActionSuccess('Application deleted successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setDeleteError(
        err.message || 
        'Failed to delete application. Please check your Supabase Row-Level Security policies.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      'Applicant Name', 
      'CNIC', 
      'Registration Number', 
      'Department', 
      'Program', 
      'Semester', 
      'Applied Position', 
      'Email', 
      'Phone', 
      'Submission Date'
    ];
    const rows = applications.map(app => {
      const answers = app.answers || {};
      const cnic = answers['2. CNIC / B-Form Number'] || answers._cnic || '';
      const email = answers['3. Email address'] || answers['2. Email address'] || '';
      const phone = answers['4. Phone number / WhatsApp'] || answers['3. Phone number'] || '';
      const dept = answers['6. Department'] || answers._department || app.department || '';
      const prog = answers['7. Degree / Program'] || answers._program || '';

      return [
        `"${(app.applicant_name || '').replace(/"/g, '""')}"`,
        `"${cnic.replace(/"/g, '""')}"`,
        `"${(app.registration_number || '').replace(/"/g, '""')}"`,
        `"${dept.replace(/"/g, '""')}"`,
        `"${prog.replace(/"/g, '""')}"`,
        `"${(app.semester || '').replace(/"/g, '""')}"`,
        `"${(app.applied_position || '').replace(/"/g, '""')}"`,
        `"${email.replace(/"/g, '""')}"`,
        `"${phone.replace(/"/g, '""')}"`,
        `"${new Date(app.created_at).toLocaleString()}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Science_Society_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredApps = applications.filter(app => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (app.applicant_name && app.applicant_name.toLowerCase().includes(term)) ||
      (app.registration_number && app.registration_number.toLowerCase().includes(term)) ||
      (app.applied_position && app.applied_position.toLowerCase().includes(term)) ||
      (app.department && app.department.toLowerCase().includes(term));

    const matchesTeam = selectedTeam === 'All Teams' || app.applied_position === selectedTeam;

    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
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
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success Alert */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Applications</h1>
            <p className="text-sm text-slate-500 mt-1">
              Showing <span className="font-semibold text-slate-800">{filteredApps.length}</span> of <span className="font-semibold text-slate-800">{applications.length}</span> total applicant records.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Team Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="block w-full sm:w-48 pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0056A8] focus:border-[#0056A8] bg-white text-sm font-medium text-slate-700 cursor-pointer"
              >
                {TEAMS.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, reg no, dept..."
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0056A8] focus:border-[#0056A8] bg-white text-sm"
              />
            </div>

            {/* CSV Export Button */}
            <button
              onClick={exportToCSV}
              disabled={applications.length === 0}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
              title="Download all applications as an Excel/CSV spreadsheet"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Position</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#0056A8] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      {search || selectedTeam !== 'All Teams' 
                        ? "No matching applications found with the current filters." 
                        : "No student applications have been submitted yet."}
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
                          <div className="h-9 w-9 rounded-full bg-blue-50 text-[#0056A8] flex items-center justify-center font-bold text-sm border border-blue-100">
                            {app.applicant_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-[#0056A8] transition-colors">
                              {app.applicant_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {app.registration_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {app.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#0056A8] border border-blue-100">
                          {app.applied_position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 text-slate-500 hover:text-[#0056A8] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Application Details"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setAppToDelete(app)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete / Reject Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Deletion / Rejection */}
      <AnimatePresence>
        {appToDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setAppToDelete(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Delete / Reject Application?
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Are you sure you want to permanently delete the application record for <strong className="text-slate-900">{appToDelete.applicant_name}</strong> (<span className="text-slate-700">{appToDelete.registration_number}</span>)?
                </p>

                {deleteError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => {
                      setAppToDelete(null);
                      setDeleteError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => handleDeleteApplication(appToDelete.id)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Yes, Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-out details drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#0056A8]" />
                  Application Details
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAppToDelete(selectedApp)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                    title="Delete Application"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </button>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6">
                
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 text-[#0056A8] flex items-center justify-center font-bold text-2xl border border-blue-100 shadow-xs">
                      {selectedApp.applicant_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{selectedApp.applicant_name}</h3>
                      <div className="inline-flex items-center mt-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-[#0056A8] border border-blue-100">
                        {selectedApp.applied_position}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-xs font-medium"><User className="w-3.5 h-3.5 mr-1.5" /> Registration No</div>
                      <div className="font-semibold text-slate-900 text-sm">{selectedApp.registration_number}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-xs font-medium"><User className="w-3.5 h-3.5 mr-1.5" /> CNIC / B-Form</div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {selectedApp.answers?.['2. CNIC / B-Form Number'] || selectedApp.answers?._cnic || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-xs font-medium"><BookOpen className="w-3.5 h-3.5 mr-1.5" /> Department / Program</div>
                      <div className="font-semibold text-slate-900 text-sm">{selectedApp.department}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-xs font-medium"><Calendar className="w-3.5 h-3.5 mr-1.5" /> Semester</div>
                      <div className="font-semibold text-slate-900 text-sm">{selectedApp.semester}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-xs font-medium">Email Address</div>
                      <div className="font-semibold text-slate-900 text-xs truncate">
                        {selectedApp.answers?.['3. Email address'] || selectedApp.answers?.['2. Email address'] || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center text-slate-500 mb-1 text-xs font-medium">Phone / WhatsApp</div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {selectedApp.answers?.['4. Phone number / WhatsApp'] || selectedApp.answers?.['3. Phone number'] || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 relative">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Form Questions & Answers</h4>
                  <div className="absolute left-0 top-7 bottom-0 w-px bg-slate-200 ml-3"></div>
                  
                  {selectedApp.answers && Object.entries(selectedApp.answers)
                    .filter(([key]) => !key.startsWith('_'))
                    .map(([question, answer]: [string, any], index) => (
                    <div key={index} className="relative pl-9">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-xs">
                        {index + 1}
                      </div>
                      <h5 className="text-xs font-semibold text-slate-800 mb-1">{question}</h5>
                      <div className="text-slate-600 bg-white border border-slate-100 rounded-xl p-3 text-sm shadow-2xs">
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


                {/* Bottom Delete Button inside drawer */}
                <div className="mt-10 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setAppToDelete(selectedApp)}
                    className="w-full py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete / Reject This Application
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
