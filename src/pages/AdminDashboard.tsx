import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  LogOut, 
  FileText, 
  ChevronRight, 
  X, 
  User, 
  Trash2, 
  AlertTriangle, 
  Download, 
  Filter,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles,
  Mail,
  Clock,
  HelpCircle
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
  "Vice President"
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
      // Deduplicate applications by registration_number (keep most recent)
      const seenReg = new Set();
      const uniqueApps: any[] = [];
      for (const app of data) {
        const key = (app.registration_number || '').trim().toLowerCase() || app.id;
        if (!seenReg.has(key)) {
          seenReg.add(key);
          uniqueApps.push(app);
        }
      }
      setApplications(uniqueApps);
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
      'Registration Number', 
      'Department', 
      'Program', 
      'Semester', 
      'Gender',
      'Date of Birth',
      'Applied Position', 
      'Second Choice Team',
      'Skill Level',
      'Phone Number', 
      'Personal Email Address',
      'Province / Area',
      'City',
      'Why Join Science Society',
      'Biggest Motivation',
      'Competitions Participation',
      'Travel Availability',
      'Meetings & Deadlines Commitment',
      'Member of Other Society',
      'Other Society Details',
      'Detailed Prior Experience',
      'Awards / Certificates',
      'Subdomain Experience / Sample',
      'Executive Role Contribution',
      'Portfolio Link',
      'Consent Declaration',
      'Submission Date'
    ];

    const sanitize = (val: any) => {
      if (val === null || val === undefined) return '""';
      let str = Array.isArray(val) ? val.join('; ') : String(val);
      const clean = str.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, ' ').trim();
      return `"${clean}"`;
    };

    const rows = applications.map(app => {
      const answers = app.answers || {};
      const email = answers['Personal Email Address'] || answers['Email address'] || answers['3. Email address'] || answers._email || '';
      const phone = answers['Phone Number / WhatsApp'] || answers['4. Phone number / WhatsApp'] || answers._phone || '';
      const dept = answers['Department'] || answers['6. Department'] || answers._department || app.department || '';
      const prog = answers['Degree / Program'] || answers['7. Degree / Program'] || answers._program || '';
      const gender = answers['What gender do you identify as?'] || answers['Gender'] || '';
      const dob = answers['Date of birth'] || '';
      const province = answers['Province / Region'] || answers._province || '';
      const city = answers['City'] || answers._city || '';
      const secondTeam = answers['What is your second-choice team?'] || '';
      const skillLevel = answers['What is your skill level in this domain?'] || '';
      const whyJoin = answers['Why do you want to join the PAF-IAST Science Society?'] || '';
      const motivation = answers['What is your biggest motivation to join the society?'] || '';
      const comp = answers['Would you be able to participate in competitions/tournaments?'] || '';
      const travel = answers['Would you be able to travel for group events?'] || '';
      const attend = answers['Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?'] || '';
      const isOtherSociety = answers['Are you currently a member of any other university society/organization?'] || '';
      const otherSocietyRole = answers['Which society/organization and what is your role?'] || '';
      const priorExp = answers['Detailed prior experience related to the position/team:'] || '';
      const awards = answers["Please share details if you've received any awards or certificates for this:"] || '';
      
      const subdomainExp = 
        answers['Event Management Prior Experience:'] ||
        answers['Decor & Arts Prior Experience:'] ||
        answers['Media & Content Prior Experience:'] ||
        answers['Public Relations Prior Experience:'] ||
        answers['Writing & Editorial Prior Experience / Sample:'] ||
        answers['Leadership & Management Prior Experience:'] || '';

      const execContribution = 
        answers['How do you think you can contribute to the society in this role?'] ||
        answers['What do you think you can contribute to the society in this role?'] || '';

      const portfolio = 
        answers['Link to your previous work / portfolio (Drive/Instagram):'] ||
        answers['Portfolio / Social Media link (Behance/Drive/Insta):'] || '';

      const consent = answers['Consent Declaration: I agree to the terms, recruitment evaluation, and consent to my data being processed.'] || 
        answers['Declaration: I confirm that all the information provided is accurate and true.'] || 'Agreed';

      return [
        sanitize(app.applicant_name),
        sanitize(app.registration_number),
        sanitize(dept),
        sanitize(prog),
        sanitize(app.semester),
        sanitize(gender),
        sanitize(dob),
        sanitize(app.applied_position),
        sanitize(secondTeam),
        sanitize(skillLevel),
        sanitize(phone),
        sanitize(email),
        sanitize(province),
        sanitize(city),
        sanitize(whyJoin),
        sanitize(motivation),
        sanitize(comp),
        sanitize(travel),
        sanitize(attend),
        sanitize(isOtherSociety),
        sanitize(otherSocietyRole),
        sanitize(priorExp),
        sanitize(awards),
        sanitize(subdomainExp),
        sanitize(execContribution),
        sanitize(portfolio),
        sanitize(consent),
        sanitize(new Date(app.created_at).toLocaleString())
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

    const matchesTeam = selectedTeam === 'All Teams' 
      || app.applied_position === selectedTeam
      || (selectedTeam === 'Vice President' && app.applied_position === 'Vice President ( male )');

    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/science_society_logo.png" alt="Science Society" className="h-8 w-auto object-contain" />
              <div className="h-6 w-px bg-slate-200"></div>
              <img src="/paf_iast_logo.png" alt="PAF-IAST" className="h-9 w-auto object-contain hidden sm:block" />
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
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(() => {
                  const answers = selectedApp.answers || {};
                  const email = answers['Personal Email Address'] || answers['Email address'] || answers['3. Email address'] || answers._email || 'N/A';
                  const phone = answers['Phone Number / WhatsApp'] || answers['4. Phone number / WhatsApp'] || answers._phone || 'N/A';
                  const dept = answers['Department'] || answers['6. Department'] || answers._department || selectedApp.department || 'N/A';
                  const prog = answers['Degree / Program'] || answers['7. Degree / Program'] || answers._program || 'N/A';
                  const gender = answers['What gender do you identify as?'] || answers['Gender'] || 'N/A';
                  const dob = answers['Date of birth'] || 'N/A';
                  const province = answers['Province / Region'] || answers._province || 'N/A';
                  const city = answers['City'] || answers._city || 'N/A';
                  const secondChoiceTeam = answers['What is your second-choice team?'] || 'N/A';
                  const skillLevel = answers['What is your skill level in this domain?'] || 'N/A';

                  const knownKeys = new Set([
                    'Your full name', 'Full Name',
                    'Registration Number',
                    'Department', '6. Department',
                    'Degree / Program', '7. Degree / Program',
                    'Semester',
                    'What gender do you identify as?', 'Gender',
                    'Date of birth',
                    'Personal Email Address', 'Email address', '3. Email address',
                    'Phone Number / WhatsApp', '4. Phone number / WhatsApp',
                    'Province / Region', 'Province',
                    'City',
                    'Why do you want to join the PAF-IAST Science Society?',
                    'What is your biggest motivation to join the society?',
                    'Would you be able to participate in competitions/tournaments?',
                    'Would you be able to travel for group events?',
                    'Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?',
                    'Are you currently a member of any other university society/organization?',
                    'Which society/organization and what is your role?',
                    "Is there anything else you'd like us to know about you?",
                    'Which team are you registering for?',
                    'What is your second-choice team?',
                    'What is your skill level in this domain?',
                    'Detailed prior experience related to the position/team:',
                    "Please share details if you've received any awards or certificates for this:",
                    'Which aspects of event management interest you?',
                    'Event Management Prior Experience:',
                    'What skills do you have?',
                    'Decor & Arts Prior Experience:',
                    'Link to your previous work / portfolio (Drive/Instagram):',
                    'What tools/software are you comfortable using?',
                    'Media & Content Prior Experience:',
                    'Portfolio / Social Media link (Behance/Drive/Insta):',
                    'Which areas are you comfortable with?',
                    'Public Relations Prior Experience:',
                    'Which areas of editorial work interest you?',
                    'What type of writing are you most comfortable with?',
                    'Writing & Editorial Prior Experience / Sample:',
                    'Confirm your target executive position:',
                    'Why are you interested in taking an executive role in the Science Society?',
                    'What do you think you can contribute to the society in this role?',
                    'How do you think you can contribute to the society in this role?',
                    'Leadership & Management Prior Experience:',
                    'Consent Declaration: I agree to the terms, recruitment evaluation, and consent to my data being processed.',
                    'Declaration: I confirm that all the information provided is accurate and true.'
                  ]);

                  const extraAnswers = Object.entries(answers).filter(
                    ([key]) => !key.startsWith('_') && !knownKeys.has(key)
                  );

                  const hasSubdomainAnswers = Boolean(
                    answers['Which aspects of event management interest you?'] ||
                    answers['Event Management Prior Experience:'] ||
                    answers['What skills do you have?'] ||
                    answers['Decor & Arts Prior Experience:'] ||
                    answers['Link to your previous work / portfolio (Drive/Instagram):'] ||
                    answers['What tools/software are you comfortable using?'] ||
                    answers['Media & Content Prior Experience:'] ||
                    answers['Portfolio / Social Media link (Behance/Drive/Insta):'] ||
                    answers['Which areas are you comfortable with?'] ||
                    answers['Public Relations Prior Experience:'] ||
                    answers['Which areas of editorial work interest you?'] ||
                    answers['What type of writing are you most comfortable with?'] ||
                    answers['Writing & Editorial Prior Experience / Sample:'] ||
                    answers['Confirm your target executive position:'] ||
                    answers['Why are you interested in taking an executive role in the Science Society?'] ||
                    answers['What do you think you can contribute to the society in this role?'] ||
                    answers['How do you think you can contribute to the society in this role?'] ||
                    answers['Leadership & Management Prior Experience:']
                  );

                  return (
                    <>
                      {/* Hero Header */}
                      <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-14 w-14 rounded-2xl bg-[#0056A8] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-[#0056A8]/20">
                            {selectedApp.applicant_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{selectedApp.applicant_name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0056A8] text-white">
                                {selectedApp.applied_position}
                              </span>
                              <span className="text-xs text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                {selectedApp.registration_number}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right text-xs text-slate-500">
                          <div className="flex items-center sm:justify-end gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Submitted:</span>
                          </div>
                          <div className="font-semibold text-slate-700 mt-0.5">
                            {new Date(selectedApp.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Section: Personal Details */}
                      <AdminSectionCard icon={User} title="Personal Details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <DetailTile label="Full Name" value={selectedApp.applicant_name || answers['Your full name']} />
                          <DetailTile label="Registration Number" value={selectedApp.registration_number || answers['Registration Number']} />
                          <DetailTile label="Department" value={dept} />
                          <DetailTile label="Degree / Program" value={prog} />
                          <DetailTile label="Semester" value={selectedApp.semester || answers['Semester']} />
                          <DetailTile label="Gender" value={gender} />
                          <DetailTile label="Date of Birth" value={dob} />
                          <DetailTile label="Personal Email" value={email} isEmail={true} />
                          <DetailTile label="Phone / WhatsApp" value={phone} isPhone={true} />
                          <DetailTile label="Province / Territory" value={province} />
                          <DetailTile label="City" value={city} />
                        </div>
                      </AdminSectionCard>

                      {/* Section: Application Motivation */}
                      <AdminSectionCard icon={Sparkles} title="Application Motivation">
                        <QuestionAnswerBlock 
                          question="Why do you want to join the PAF-IAST Science Society?" 
                          answer={answers['Why do you want to join the PAF-IAST Science Society?']} 
                        />
                        <QuestionAnswerBlock 
                          question="What is your biggest motivation to join the society?" 
                          answer={answers['What is your biggest motivation to join the society?']} 
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Competitions</div>
                            <div className="text-xs text-slate-700">Tournaments participation:</div>
                            <div className="mt-1.5">
                              {answers['Would you be able to participate in competitions/tournaments?'] === 'Yes' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ Yes</span>
                              ) : answers['Would you be able to participate in competitions/tournaments?'] === 'No' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">✗ No</span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Not answered</span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Travel</div>
                            <div className="text-xs text-slate-700">Travel for group events:</div>
                            <div className="mt-1.5">
                              {answers['Would you be able to travel for group events?'] === 'Yes' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ Yes</span>
                              ) : answers['Would you be able to travel for group events?'] === 'No' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">✗ No</span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Not answered</span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Commitment</div>
                            <div className="text-xs text-slate-700">Meetings & Deadlines:</div>
                            <div className="mt-1.5">
                              {answers['Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?'] === 'Yes' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ Yes</span>
                              ) : answers['Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?'] === 'No' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">✗ No</span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Not answered</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-1">
                          <div className="text-xs font-semibold text-slate-700 mb-1.5">Member of another university society/organization:</div>
                          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">
                              {answers['Are you currently a member of any other university society/organization?'] || 'No'}
                            </span>
                            {answers['Are you currently a member of any other university society/organization?'] === 'Yes' && (
                              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Active Elsewhere
                              </span>
                            )}
                          </div>
                          {answers['Which society/organization and what is your role?'] && (
                            <div className="mt-2.5 pl-3 border-l-2 border-[#0056A8]">
                              <QuestionAnswerBlock 
                                question="Society/Organization & Role Details:" 
                                answer={answers['Which society/organization and what is your role?']} 
                              />
                            </div>
                          )}
                        </div>

                        {answers["Is there anything else you'd like us to know about you?"] && (
                          <QuestionAnswerBlock 
                            question="Is there anything else you'd like us to know about you?" 
                            answer={answers["Is there anything else you'd like us to know about you?"]} 
                          />
                        )}
                      </AdminSectionCard>

                      {/* Section: Team Selection & Experience */}
                      <AdminSectionCard icon={Briefcase} title="Team Selection & Experience">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <DetailTile label="Applied Team" value={selectedApp.applied_position || answers['Which team are you registering for?']} />
                          <DetailTile label="Second-Choice Team" value={secondChoiceTeam} />
                          <DetailTile label="Skill Level" value={skillLevel} />
                        </div>

                        <QuestionAnswerBlock 
                          question="Detailed prior experience related to the position/team:" 
                          answer={answers['Detailed prior experience related to the position/team:']} 
                        />

                        {answers["Please share details if you've received any awards or certificates for this:"] && (
                          <QuestionAnswerBlock 
                            question="Awards or Certificates Details:" 
                            answer={answers["Please share details if you've received any awards or certificates for this:"]} 
                          />
                        )}
                      </AdminSectionCard>

                      {/* Section: Subdomain Experience */}
                      {hasSubdomainAnswers && (
                        <AdminSectionCard icon={Layers} title={`${selectedApp.applied_position || 'Subdomain'} Experience`} badge={selectedApp.applied_position}>
                          {/* Event Management */}
                          {answers['Which aspects of event management interest you?'] && (
                            <QuestionAnswerBlock 
                              question="Aspects of Event Management of interest:" 
                              answer={answers['Which aspects of event management interest you?']} 
                            />
                          )}
                          {answers['Event Management Prior Experience:'] && (
                            <QuestionAnswerBlock 
                              question="Event Management Prior Experience:" 
                              answer={answers['Event Management Prior Experience:']} 
                            />
                          )}

                          {/* Decor & Arts */}
                          {answers['What skills do you have?'] && (
                            <QuestionAnswerBlock 
                              question="Skills & Craft Proficiencies:" 
                              answer={answers['What skills do you have?']} 
                            />
                          )}
                          {answers['Decor & Arts Prior Experience:'] && (
                            <QuestionAnswerBlock 
                              question="Decor & Arts Prior Experience:" 
                              answer={answers['Decor & Arts Prior Experience:']} 
                            />
                          )}
                          {answers['Link to your previous work / portfolio (Drive/Instagram):'] && (
                            <QuestionAnswerBlock 
                              question="Work / Portfolio Link:" 
                              answer={answers['Link to your previous work / portfolio (Drive/Instagram):']} 
                            />
                          )}

                          {/* Media & Content */}
                          {answers['What tools/software are you comfortable using?'] && (
                            <QuestionAnswerBlock 
                              question="Tools & Software Proficiencies:" 
                              answer={answers['What tools/software are you comfortable using?']} 
                            />
                          )}
                          {answers['Media & Content Prior Experience:'] && (
                            <QuestionAnswerBlock 
                              question="Media & Content Prior Experience:" 
                              answer={answers['Media & Content Prior Experience:']} 
                            />
                          )}
                          {answers['Portfolio / Social Media link (Behance/Drive/Insta):'] && (
                            <QuestionAnswerBlock 
                              question="Portfolio / Social Media Link:" 
                              answer={answers['Portfolio / Social Media link (Behance/Drive/Insta):']} 
                            />
                          )}

                          {/* Public Relations */}
                          {answers['Which areas are you comfortable with?'] && (
                            <QuestionAnswerBlock 
                              question="Public Relations Focus Areas:" 
                              answer={answers['Which areas are you comfortable with?']} 
                            />
                          )}
                          {answers['Public Relations Prior Experience:'] && (
                            <QuestionAnswerBlock 
                              question="Public Relations Prior Experience:" 
                              answer={answers['Public Relations Prior Experience:']} 
                            />
                          )}

                          {/* Content & Editorial */}
                          {answers['Which areas of editorial work interest you?'] && (
                            <QuestionAnswerBlock 
                              question="Editorial Work Areas:" 
                              answer={answers['Which areas of editorial work interest you?']} 
                            />
                          )}
                          {answers['What type of writing are you most comfortable with?'] && (
                            <QuestionAnswerBlock 
                              question="Writing Style Comfortable With:" 
                              answer={answers['What type of writing are you most comfortable with?']} 
                            />
                          )}
                          {answers['Writing & Editorial Prior Experience / Sample:'] && (
                            <QuestionAnswerBlock 
                              question="Writing & Editorial Experience / Sample:" 
                              answer={answers['Writing & Editorial Prior Experience / Sample:']} 
                            />
                          )}

                          {/* Executive Leadership */}
                          {(selectedApp.applied_position === "General Secretary" || selectedApp.applied_position === "Vice President" || selectedApp.applied_position === "Vice President ( male )" || answers['Confirm your target executive position:']) && (
                            <DetailTile 
                              label="Confirmed Executive Position" 
                              value={selectedApp.applied_position === 'Vice President ( male )' ? 'Vice President' : (selectedApp.applied_position || answers['Confirm your target executive position:'])} 
                            />
                          )}
                          {answers['Why are you interested in taking an executive role in the Science Society?'] && (
                            <QuestionAnswerBlock 
                              question="Why are you interested in taking an executive role in the Science Society?" 
                              answer={answers['Why are you interested in taking an executive role in the Science Society?']} 
                            />
                          )}
                          {(answers['How do you think you can contribute to the society in this role?'] || answers['What do you think you can contribute to the society in this role?']) && (
                            <QuestionAnswerBlock 
                              question="How do you think you can contribute to the society in this role?" 
                              answer={answers['How do you think you can contribute to the society in this role?'] || answers['What do you think you can contribute to the society in this role?']} 
                            />
                          )}
                          {answers['Leadership & Management Prior Experience:'] && (
                            <QuestionAnswerBlock 
                              question="Leadership & Management Prior Experience:" 
                              answer={answers['Leadership & Management Prior Experience:']} 
                            />
                          )}
                        </AdminSectionCard>
                      )}

                      {/* Section: Terms, Privacy & Consent */}
                      <AdminSectionCard icon={ShieldCheck} title="Terms, Privacy & Consent">
                        <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-emerald-900 mb-0.5">Applicant Consent Status</div>
                            <div className="text-xs text-emerald-700">Verified agreement to data processing & recruitment evaluation</div>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            {answers['Consent Declaration: I agree to the terms, recruitment evaluation, and consent to my data being processed.'] || 
                             answers['Declaration: I confirm that all the information provided is accurate and true.'] || 'Agreed & Consented'}
                          </span>
                        </div>
                      </AdminSectionCard>

                      {/* Section: Additional Responses (Fallback) */}
                      {extraAnswers.length > 0 && (
                        <AdminSectionCard icon={HelpCircle} title="Additional Responses">
                          <div className="space-y-4">
                            {extraAnswers.map(([q, a], idx) => (
                              <QuestionAnswerBlock key={idx} question={q} answer={a} />
                            ))}
                          </div>
                        </AdminSectionCard>
                      )}
                    </>
                  );
                })()}

                {/* Bottom Delete Button inside drawer */}
                <div className="pt-4 border-t border-slate-200">
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

function AdminSectionCard({ 
  icon: Icon, 
  title, 
  badge,
  children 
}: { 
  icon: any; 
  title: string; 
  badge?: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0056A8] flex items-center justify-center border border-blue-100">
            <Icon className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h4>
        </div>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0056A8] border border-blue-200/60">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function DetailTile({ 
  label, 
  value, 
  icon: Icon, 
  colSpan = 1,
  isEmail = false,
  isPhone = false 
}: { 
  label: string; 
  value: any; 
  icon?: any; 
  colSpan?: number;
  isEmail?: boolean;
  isPhone?: boolean;
}) {
  const isLink = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
  
  return (
    <div className={`p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between ${colSpan === 2 ? 'col-span-1 sm:col-span-2' : ''}`}>
      <div className="flex items-center text-slate-500 mb-1.5 text-[11px] font-medium tracking-wide uppercase">
        {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />}
        {label}
      </div>
      {isEmail && value && value !== 'N/A' ? (
        <a 
          href={`mailto:${value}`} 
          className="text-xs sm:text-sm font-semibold text-[#0056A8] hover:underline flex items-center gap-1 truncate"
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{value}</span>
        </a>
      ) : isPhone && value && value !== 'N/A' ? (
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-900 font-mono">{value}</span>
          {value.includes('+92') && (
            <a
              href={`https://wa.me/${value.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
              title="Open in WhatsApp"
            >
              WA
            </a>
          )}
        </div>
      ) : isLink ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs sm:text-sm font-semibold text-[#0056A8] hover:underline flex items-center gap-1 break-all"
        >
          <span>{value}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <div className="font-semibold text-slate-900 text-xs sm:text-sm break-words">
          {value || <span className="text-slate-400 font-normal italic">Not provided</span>}
        </div>
      )}
    </div>
  );
}

function QuestionAnswerBlock({ 
  question, 
  answer 
}: { 
  question: string; 
  answer: any; 
}) {
  const isLink = typeof answer === 'string' && (answer.startsWith('http://') || answer.startsWith('https://'));
  const isArray = Array.isArray(answer);
  
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-slate-700 leading-snug">
        {question}
      </div>
      <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs">
        {isArray ? (
          answer.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {answer.map((item: string, i: number) => (
                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0056A8] text-xs font-semibold border border-blue-100">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 italic">None selected</span>
          )
        ) : isLink ? (
          <a 
            href={answer} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0056A8] hover:underline break-all bg-white px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <span>{answer}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        ) : (
          <div className="whitespace-pre-wrap">{answer || <span className="text-slate-400 italic">Not provided</span>}</div>
        )}
      </div>
    </div>
  );
}
