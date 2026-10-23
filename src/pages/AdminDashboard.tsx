import { useState, useEffect } from 'react';
import { 
  fetchAllApplications, 
  deleteApplication, 
  clearAdminSession,
  getLocalApplications,
  type ApplicationData 
} from '../lib/applications';
import { 
  exportApplicationsToFormattedExcel, 
  exportApplicationsToXLSX 
} from '../lib/excelExport';
import { 
  Search, 
  LogOut, 
  Trash2, 
  Download, 
  RefreshCw, 
  X, 
  Crown, 
  FileSpreadsheet, 
  Eye, 
  Phone, 
  Mail, 
  Globe,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6h2.79v-7.6H6.46M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5Z" />
    </svg>
  );
}


export default function AdminDashboard() {
  // DSA Instant Cache-first initialization: 0ms UI blocking
  const [applications, setApplications] = useState<ApplicationData[]>(() => getLocalApplications());
  const [loading, setLoading] = useState<boolean>(() => getLocalApplications().length === 0);
  const [search, setSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('ALL');

  // Detail Modal & Delete Modal states
  const [viewingApp, setViewingApp] = useState<ApplicationData | null>(null);
  const [appToDelete, setAppToDelete] = useState<ApplicationData | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetchAllApplications();
    if (res.applications && res.applications.length > 0) {
      setApplications(res.applications);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearAdminSession();
    window.location.reload();
  };

  const handleSaveNotes = async () => {
    if (!viewingApp) return;
    setIsSavingNotes(true);
    // Persist note locally
    const updated = applications.map(a => a.id === viewingApp.id ? { ...a, admin_notes: notesInput } : a);
    setApplications(updated);
    setViewingApp(prev => prev ? { ...prev, admin_notes: notesInput } : null);
    try {
      localStorage.setItem('dsc_applications_vault_v1', JSON.stringify(updated));
    } catch (e) {}
    setIsSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    const res = await deleteApplication(appToDelete.id);
    if (res.success) {
      setApplications(prev => prev.filter(a => a.id !== appToDelete.id));
      if (viewingApp && viewingApp.id === appToDelete.id) {
        setViewingApp(null);
      }
      setAppToDelete(null);
    }
  };

  const openDossier = (app: ApplicationData) => {
    setViewingApp(app);
    setNotesInput(app.admin_notes || '');
  };

  const handlePrint = () => {
    window.print();
  };

  // Highly responsive DSA filtering with quick category tabs
  const filteredApps = applications.filter(app => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (app.applicant_name || '').toLowerCase().includes(q) ||
      (app.registration_number || '').toLowerCase().includes(q) ||
      (app.personal_email || '').toLowerCase().includes(q) ||
      (app.phone_number || '').toLowerCase().includes(q) ||
      (app.department || '').toLowerCase().includes(q) ||
      (app.degree_program || '').toLowerCase().includes(q) ||
      (app.applied_position || '').toLowerCase().includes(q)
    );

    let matchesCategory = true;
    if (selectedCategoryTab === 'EXECUTIVE') {
      matchesCategory = app.applied_category === 'Executive Leadership' || 
        app.applied_position === 'Vice President Female' || 
        app.applied_position === 'General Secretary';
    } else if (selectedCategoryTab === 'DIRECTORS') {
      matchesCategory = (app.applied_position || '').startsWith('Director');
    } else if (selectedCategoryTab === 'EVENT') {
      matchesCategory = (app.applied_position || '').includes('Event');
    } else if (selectedCategoryTab === 'MARKETING') {
      matchesCategory = (app.applied_position || '').includes('Marketing') || (app.applied_position || '').includes('Media');
    } else if (selectedCategoryTab === 'PR') {
      matchesCategory = (app.applied_position || '').includes('Public Relations') || (app.applied_position || '').includes('PR') || (app.applied_position || '').includes('Community &');
    } else if (selectedCategoryTab === 'LEARNING') {
      matchesCategory = (app.applied_position || '').includes('Learning') || (app.applied_position || '').includes('Projects');
    } else if (selectedCategoryTab === 'TECH') {
      matchesCategory = (app.applied_position || '').includes('Technology') || (app.applied_position || '').includes('Platform');
    } else if (selectedCategoryTab === 'TEAM') {
      matchesCategory = (app.applied_position || '').includes('Team Member');
    }

    const matchesSemester = selectedSemesterFilter === 'ALL' || (app.semester || '').includes(selectedSemesterFilter);

    return matchesSearch && matchesCategory && matchesSemester;
  });

  // Analytics Metrics
  const totalCount = applications.length;
  const execCount = applications.filter(a => 
    a.applied_category === 'Executive Leadership' || 
    a.applied_position === 'Vice President Female' || 
    a.applied_position === 'General Secretary'
  ).length;
  const directorCount = applications.filter(a => 
    a.applied_category === 'Directorate Lead' || 
    (a.applied_position || '').startsWith('Director')
  ).length;
  const teamCount = applications.filter(a => 
    a.applied_category === 'Department Team Member' || 
    (a.applied_position || '').includes('Team Member')
  ).length;
  const deptCount = new Set(applications.map(a => (a.department || '').trim()).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top App-bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 py-3 px-4 sm:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Dual Logos & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0">
                <img 
                  src="/dsc_logo.png" 
                  alt="Data Science Community Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="h-6 w-px bg-slate-700"></div>
              <div className="bg-white p-1.5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0">
                <img 
                  src="/paf_iast_logo.png" 
                  alt="PAF-IAST" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  The Data Science Community
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Registry Central
                </span>
              </div>
              <p className="text-xs text-slate-400">Recruitment Registry & Candidate Evaluation Vault</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* View Form Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-all cursor-pointer"
            >
              <span>Application Form</span>
            </Link>

            {/* Formatted Excel Export */}
            <button
              onClick={() => exportApplicationsToFormattedExcel(filteredApps)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Download formatted Excel sheet for physical evaluation"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            {/* Standard XLSX */}
            <button
              onClick={() => exportApplicationsToXLSX(filteredApps)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Download standard .xlsx"
            >
              <Download className="w-4 h-4" />
              <span>.XLSX</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh applications list"
            >
              <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            </button>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total registered</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-xs">
            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Executive Roles</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1">{execCount}</div>
            <div className="text-[11px] text-purple-600 mt-1">Vice President (Female)</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-xs">
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Directorates</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">{directorCount}</div>
            <div className="text-[11px] text-blue-600 mt-1">4 Lead Directorates</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Team Members</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{teamCount}</div>
            <div className="text-[11px] text-emerald-600 mt-1">All Functional Wings</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-xs col-span-2 sm:col-span-1">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Departments</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900 mt-1">{deptCount}</div>
            <div className="text-[11px] text-indigo-600 mt-1">Diverse University Fields</div>
          </div>
        </div>

        {/* Search, Semester & Direct Category Tabs (Dedicated quick filters) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          
          {/* Quick Domain Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Candidates' },
              { id: 'EXECUTIVE', label: 'Executive Cabinet' },
              { id: 'DIRECTORS', label: 'Directorates' },
              { id: 'EVENT', label: 'Event Management' },
              { id: 'MARKETING', label: 'Marketing & Comms' },
              { id: 'PR', label: 'Community & PR' },
              { id: 'LEARNING', label: 'Learning & Projects' },
              { id: 'TECH', label: 'Technology & Platform' },
              { id: 'TEAM', label: 'Team Members' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-bold",
                  selectedCategoryTab === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Semester Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates by name, reg #, email, phone, or department..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            {/* Semester Filter */}
            <div className="sm:col-span-4">
              <select
                value={selectedSemesterFilter}
                onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer font-medium"
              >
                <option value="ALL">All Semesters</option>
                <option value="1">Semester 1 (Freshmen)</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8 (Seniors)</option>
              </select>
            </div>

          </div>

          {/* Info Line */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Showing <b>{filteredApps.length}</b> candidates</span>
            {(search || selectedCategoryTab !== 'ALL' || selectedSemesterFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategoryTab('ALL');
                  setSelectedSemesterFilter('ALL');
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Applications List / Table (Status column removed!) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading registrations from database...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No applications matched your filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try switching the category tab above or clearing search keywords.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Reg Number</th>
                    <th className="py-3 px-4">Position Applied</th>
                    <th className="py-3 px-4">Department & Sem</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Profiles</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredApps.map((app, idx) => {
                    const isExec = app.applied_category === 'Executive Leadership' || app.applied_position.includes('President') || app.applied_position.includes('Secretary');
                    const isDir = app.applied_category === 'Directorate Lead' || app.applied_position.startsWith('Director');

                    const linkedin = app.linkedin_url || (app.portfolio_link && app.portfolio_link.includes('linkedin') ? app.portfolio_link : null);
                    const portfolio = app.portfolio_url || (app.portfolio_link && !linkedin ? app.portfolio_link : null);

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                        
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{app.applicant_name}</div>
                          <div className="text-[11px] text-slate-500">{app.gender}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                            {app.registration_number}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={clsx(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                            isExec 
                              ? "bg-purple-50 text-purple-700 border border-purple-200" 
                              : isDir 
                              ? "bg-blue-50 text-blue-700 border border-blue-200" 
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {isExec && <Crown className="w-3 h-3" />}
                            {app.applied_position}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold text-xs">{app.department}</div>
                          <div className="text-slate-500 text-[11px]">{app.degree_program} • {app.semester}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs font-medium text-slate-700 truncate max-w-[160px]">{app.personal_email}</div>
                          <div className="text-[11px] font-mono text-slate-500">{app.phone_number}</div>
                        </td>

                        {/* Profiles / Links */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {linkedin && (
                              <a
                                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="LinkedIn Profile"
                                className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <LinkedinIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {portfolio && (
                              <a
                                href={portfolio.startsWith('http') ? portfolio : `https://${portfolio}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Portfolio / Showcase"
                                className="p-1 rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
                              >
                                <Globe className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {!linkedin && !portfolio && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openDossier(app)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Open complete candidate evaluation dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Dossier</span>
                            </button>
                            <button
                              onClick={() => setAppToDelete(app)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Candidate Dossier Modal (NO status dropdown/shortlisted button) */}
      <AnimatePresence>
        {viewingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-extrabold text-lg">
                    {viewingApp.applicant_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{viewingApp.applicant_name}</h3>
                    <p className="text-xs text-slate-400">
                      Reg: <span className="font-mono text-blue-400 font-semibold">{viewingApp.registration_number}</span> • Candidate for <span className="text-white font-semibold">{viewingApp.applied_position}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Print Evaluation Sheet"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewingApp(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Scrollable */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
                
                {/* Contact Quick Actions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Applicant:</span>
                    <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {viewingApp.applied_position}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${viewingApp.phone_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Chat</span>
                    </a>

                    <a
                      href={`mailto:${viewingApp.personal_email}?subject=PAF-IAST%20Data%20Science%20Community%20Recruitment`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Candidate</span>
                    </a>
                  </div>
                </div>

                {/* Academic & Personal Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block">Department:</span>
                    <span className="font-bold text-slate-800">{viewingApp.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Degree / Program:</span>
                    <span className="font-bold text-slate-800">{viewingApp.degree_program}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Semester:</span>
                    <span className="font-bold text-slate-800">{viewingApp.semester}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Gender & DOB:</span>
                    <span className="font-bold text-slate-800">{viewingApp.gender} ({viewingApp.date_of_birth || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Skill Level:</span>
                    <span className="font-bold text-slate-800">{viewingApp.skill_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">2nd Choice Position:</span>
                    <span className="font-bold text-slate-800">{viewingApp.second_choice_position || 'None'}</span>
                  </div>
                </div>

                {/* Prior Experience */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Prior Experience</h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                      {viewingApp.detailed_prior_experience || 'No previous experience detailed.'}
                    </p>
                  </div>
                </div>

                {/* Separated Certifications & Awards */}
                {(viewingApp.certifications || viewingApp.awards_competitions || viewingApp.previous_achievements || viewingApp.awards_certificates) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certifications & Achievements</h4>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-3">
                      {viewingApp.certifications && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Certifications & Courses:</span>
                          <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">{viewingApp.certifications}</p>
                        </div>
                      )}
                      {viewingApp.awards_competitions && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Awards & Competition Honors:</span>
                          <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">{viewingApp.awards_competitions}</p>
                        </div>
                      )}
                      {viewingApp.previous_achievements && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Notable Projects:</span>
                          <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">{viewingApp.previous_achievements}</p>
                        </div>
                      )}
                      {!viewingApp.certifications && !viewingApp.awards_competitions && viewingApp.awards_certificates && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Awards / Certifications:</span>
                          <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">{viewingApp.awards_certificates}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Motivation & Availability */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivation & Availability</h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-3 leading-relaxed">
                    <div>
                      <div className="font-semibold text-slate-700 mb-1">Why do you want to join the Data Science Community?</div>
                      <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">{viewingApp.motivation_join || '—'}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700 mb-1">Biggest Personal Motivation:</div>
                      <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800">{viewingApp.motivation_drive || '—'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Competitions:</span>
                        <span className="font-bold text-slate-800">{viewingApp.can_participate_competitions}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Travel for Events:</span>
                        <span className="font-bold text-slate-800">{viewingApp.can_travel}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">Task Deadlines:</span>
                        <span className="font-bold text-slate-800">{viewingApp.willing_commit_deadlines}</span>
                      </div>
                    </div>
                    {viewingApp.is_member_other_society === 'Yes' && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-xs">Other Society / Role:</span>
                        <span className="font-semibold text-slate-800">{viewingApp.other_society_details || 'Yes (No specific role listed)'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Links */}
                {(viewingApp.linkedin_url || viewingApp.portfolio_url || viewingApp.portfolio_link) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Profiles & Links</h4>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-2">
                      {viewingApp.linkedin_url && (
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <LinkedinIcon className="w-4 h-4 text-blue-600" /> LinkedIn:
                          </span>
                          <a href={viewingApp.linkedin_url.startsWith('http') ? viewingApp.linkedin_url : `https://${viewingApp.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs truncate max-w-[280px]">
                            {viewingApp.linkedin_url}
                          </a>
                        </div>
                      )}
                      {viewingApp.portfolio_url && (
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-purple-600" /> Portfolio / Showcase:
                          </span>
                          <a href={viewingApp.portfolio_url.startsWith('http') ? viewingApp.portfolio_url : `https://${viewingApp.portfolio_url}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-mono text-xs truncate max-w-[280px]">
                            {viewingApp.portfolio_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Role Specific Answers */}
                {viewingApp.role_specific_answers && Object.keys(viewingApp.role_specific_answers).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role-Specific Responses</h4>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-2.5">
                      {Object.entries(viewingApp.role_specific_answers).map(([key, val]) => {
                        if (
                          key === 'Your full name' || 
                          key === 'Registration Number' || 
                          key === 'Personal Email Address' || 
                          key === 'Phone Number / WhatsApp' ||
                          key === 'answers'
                        ) return null;
                        const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                        return (
                          <div key={key} className="bg-white p-3 rounded-xl border border-slate-200">
                            <span className="font-semibold text-slate-700 block text-xs mb-1">{key}:</span>
                            <span className="text-slate-900 leading-relaxed whitespace-pre-wrap">{displayVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Internal Evaluation Notes (Saved for physical review & panel scoring) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Physical Interview Evaluation Notes & Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Enter interview evaluation remarks, committee scores, panel notes..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingNotes ? 'Saving Notes...' : 'Save Evaluation Notes'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingApp(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {appToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Application?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-800">{appToDelete.applicant_name}</span> ({appToDelete.registration_number})? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setAppToDelete(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-sm shadow-red-600/20 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
