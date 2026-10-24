import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle, 
  User, 
  Award, 
  Check, 
  Crown, 
  Briefcase, 
  Video, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Globe,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import { submitApplication, syncLocalApplicationsToCloud } from '../lib/applications';



interface ExecutivePosition {
  id: string;
  title: string;
  desc: string;
  femaleOnly?: boolean;
}

const EXECUTIVE_POSITIONS: ExecutivePosition[] = [
  { 
    id: "Vice President Female", 
    title: "Vice President (Female)", 
    desc: "Executive co-head of community governance, representing female students and guiding overall vision.",
    femaleOnly: true
  }
];

const DIRECTOR_POSITIONS = [
  {
    id: "Director Event Management",
    title: "Director of Event Management",
    desc: "Leading hackathons, workshops, bootcamps, and logistical operations across campus."
  },
  {
    id: "Director Marketing & Communications",
    title: "Director of Marketing & Communications",
    desc: "Leading branding, social media, promotion campaigns, graphic design, and video content."
  },
  {
    id: "Director Learning & Projects",
    title: "Director of Learning & Projects",
    desc: "Leading technical study circles, project mentorship, coding sprints, and hands-on bootcamps."
  },
  {
    id: "Director Technology & Platform",
    title: "Director of Technology & Platform",
    desc: "Managing web portals, technical infrastructure, internal tools, and developer platforms."
  }
];

const COMMUNITY_TEAM_POSITIONS = [
  {
    id: "Event Management - Team Member",
    title: "Event Management - Team Member",
    desc: "Coordinate hall setups, registrations, speaker reception, and event flow."
  },
  {
    id: "Marketing & Communications - Team Member",
    title: "Marketing & Communications - Team Member",
    desc: "Create graphic posters, reels, video recaps, tech copy, and digital campaigns."
  },
  {
    id: "Community & Public Relations - Team Member",
    title: "Community & Public Relations - Team Member",
    desc: "Engage student bodies, communicate with sponsors, and manage campus liaisons."
  },
  {
    id: "Learning & Projects - Team Member",
    title: "Learning & Projects - Team Member",
    desc: "Help run coding bootcamps, curate datasets, facilitate study groups, and track project milestones."
  },
  {
    id: "Technology & Platform - Team Member",
    title: "Technology & Platform - Team Member",
    desc: "Contribute to web applications, portals, automation bots, and platform support."
  }
];


const FORM_STEPS = [
  { num: 1, title: "Personal Details", subtitle: "Identity & Academic Profile" },
  { num: 2, title: "Position & Experience", subtitle: "Role Choice & Background" },
  { num: 3, title: "Motivation & Availability", subtitle: "Commitment & Societies" },
  { num: 4, title: "Role Specialization", subtitle: "Domain Qs & Consent" }
];

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved draft on mount & auto-sync unsynced applications to cloud
  useEffect(() => {
    try {
      const draft = localStorage.getItem('dsc_form_draft_v3');
      if (draft) {
        setFormData(JSON.parse(draft));
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
    // Background auto-sync of any previous submission on this device
    syncLocalApplicationsToCloud().catch(() => {});
  }, []);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Gender-based role restriction:
      // If gender is set to Male, and VP Female was selected, reset position
      if (name === 'What gender do you identify as?') {
        const currentPos = updated['Which position are you registering for?'];
        if (value === 'Male' && currentPos === 'Vice President Female') {
          delete updated['Which position are you registering for?'];
        }
      }

      try {
        localStorage.setItem('dsc_form_draft_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const current = prev[name] || [];
      const updatedList = checked 
        ? [...current, value] 
        : current.filter((v: string) => v !== value);
      const updated = { ...prev, [name]: updatedList };
      try {
        localStorage.setItem('dsc_form_draft_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const selectedGender = formData['What gender do you identify as?'];
  const selectedPosition = formData['Which position are you registering for?'];
  const isMemberOfOtherSociety = formData['Are you currently a member of any other university society/organization?'] === 'Yes';

  // Determine Category of selected position
  const getPositionCategory = (pos: string) => {
    if (pos === 'Vice President Female' || pos === 'General Secretary') return 'Executive Leadership';
    if (pos && pos.startsWith('Director')) return 'Directorate Lead';
    return 'Department Team Member';
  };

  // Step 1 Validation
  const validateStep1 = () => {
    setError(null);
    if (!formData['Your full name']?.trim()) return "Please enter your full name.";
    if (!formData['Personal Email Address']?.trim()) return "Please enter your personal email address.";
    if (!formData['Phone Number / WhatsApp']?.trim()) return "Please enter your WhatsApp / phone number.";
    if (!formData['Registration Number']?.trim()) return "Please enter your university Registration Number.";
    if (!formData['Department']?.trim()) return "Please enter your academic department.";
    if (!formData['Degree / Program']?.trim()) return "Please enter your degree / program (e.g. BS Data Science, BS CS).";
    if (!formData['Semester']) return "Please select your current semester.";
    if (!formData['What gender do you identify as?']) return "Please specify your gender.";
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    setError(null);
    if (!selectedPosition) return "Please choose the position you are registering for.";
    if (selectedPosition === 'Vice President Female' && selectedGender === 'Male') {
      return "Vice President (Female) is open exclusively to female candidates.";
    }
    if (!formData['What is your second-choice position?']?.trim()) {
      return "Please indicate your second-choice position preference.";
    }
    return null;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    setError(null);
    const motJoin = (formData['Why do you want to join the PAF-IAST Data Science Community?'] || '').trim();
    if (motJoin.length < 10) {
      return "Please tell us briefly why you want to join the Data Science Community.";
    }
    if (!formData['Would you be able to participate in competitions/hackathons?']) {
      return "Please indicate your hackathon / competition participation availability.";
    }
    if (!formData['Are you willing to attend meetings and complete tasks within deadlines?']) {
      return "Please confirm your commitment to attend meetings and meet deadlines.";
    }
    if (!formData['Are you currently a member of any other university society/organization?']) {
      return "Please indicate if you are currently part of any other university society.";
    }
    return null;
  };

  const handleNextStep = () => {
    let err: string | null = null;
    if (currentStep === 1) err = validateStep1();
    else if (currentStep === 2) err = validateStep2();
    else if (currentStep === 3) err = validateStep3();

    if (err) {
      setError(err);
      window.scrollTo({ top: 220, behavior: 'smooth' });
      return;
    }

    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 240, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 240, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Final step validations
    if (!formData['Consent Declaration: I agree to the recruitment terms and consent to evaluation.'] ||
        formData['Consent Declaration: I agree to the recruitment terms and consent to evaluation.'] !== 'I Agree & Consent') {
      setError("Please agree to the recruitment terms and evaluation consent to proceed.");
      setSubmitting(false);
      window.scrollTo({ top: 240, behavior: 'smooth' });
      return;
    }

    const regNo = (formData['Registration Number'] || '').trim();
    const rawPhone = (formData['Phone Number / WhatsApp'] || '').trim().replace(/^\+?92\s*/, '');
    const fullPhone = rawPhone ? `+92 ${rawPhone}` : '';

    const payload = {
      applicant_name: formData['Your full name'],
      registration_number: regNo,
      personal_email: formData['Personal Email Address'],
      phone_number: fullPhone,
      department: formData['Department'],
      degree_program: formData['Degree / Program'],
      semester: formData['Semester'],
      gender: selectedGender,
      date_of_birth: formData['Date of birth'] || '',
      applied_category: getPositionCategory(selectedPosition),
      applied_position: selectedPosition,
      second_choice_position: formData['What is your second-choice position?'] || '',
      skill_level: formData['What is your current skill level in this domain?'] || 'Community Member',
      motivation_join: formData['Why do you want to join the PAF-IAST Data Science Community?'] || '',
      motivation_drive: formData['What is your biggest personal motivation to contribute?'] || formData['Why do you want to join the PAF-IAST Data Science Community?'] || '',
      can_participate_competitions: formData['Would you be able to participate in competitions/hackathons?'] || 'Yes',
      can_travel: formData['Would you be able to travel for conferences/events?'] || 'Yes',
      willing_commit_deadlines: formData['Are you willing to attend meetings and complete tasks within deadlines?'] || 'Yes',
      is_member_other_society: formData['Are you currently a member of any other university society/organization?'] || 'No',
      other_society_details: formData['Which society/organization and what is your role?'] || '',
      detailed_prior_experience: formData['Detailed prior experience related to this position/team:'] || '',
      certifications: formData['Certifications & specialized training (if any):'] || '',
      awards_competitions: formData['Awards, honors & competition wins (if any):'] || '',
      previous_achievements: formData['Notable projects & extracurricular achievements:'] || '',
      linkedin_url: formData['LinkedIn Profile URL:'] || '',
      portfolio_url: formData['Portfolio / Website / Work Showcase Link:'] || '',
      github_url: '',
      portfolio_link: formData['Portfolio / Website / Work Showcase Link:'] || formData['LinkedIn Profile URL:'] || '',
      additional_info: formData['Is there anything else you\'d like us to know about you?'] || '',
      role_specific_answers: {
        ...formData
      },
      answers: formData
    };

    const res = await submitApplication(payload);

    if (res.success) {
      try {
        localStorage.removeItem('dsc_form_draft_v3');
      } catch (e) {}
      setSubmittedData(payload);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(res.error || "Failed to submit application. Please try again.");
      window.scrollTo({ top: 240, behavior: 'smooth' });
    }
    setSubmitting(false);
  };

  // Submitted Screen
  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Top Logo Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-700">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center w-14 h-14 shrink-0">
              <img 
                src="/dsc_logo.png" 
                alt="The Data Science Community" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center w-14 h-14 shrink-0">
              <img 
                src="/paf_iast_logo.png" 
                alt="PAF-IAST" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Registration Recorded
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Application Lodged!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2.5 leading-relaxed">
              Thank you, <span className="font-semibold text-white">{submittedData.applicant_name}</span>. Your application for <span className="font-semibold text-blue-400">{submittedData.applied_position}</span> has been securely lodged into The Data Science Community registry.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs sm:text-sm text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Registration No:</span>
              <span className="font-mono font-semibold text-white">{submittedData.registration_number}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Department & Program:</span>
              <span className="font-semibold text-white">{submittedData.department} ({submittedData.degree_program})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Semester:</span>
              <span className="font-semibold text-white">{submittedData.semester}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Applied Role:</span>
              <span className="font-semibold text-blue-400">{submittedData.applied_position}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({});
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer text-center"
            >
              Submit Another Application
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Bespoke Header with Identical Logos and Full Institute Title */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* Dual Logo Top Bar with Identical White Badges and Full Institute Title */}
          <div className="bg-slate-900 px-6 sm:px-10 py-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 relative">
            
            {/* Left: The Data Science Community Logo & Title */}
            <div className="flex items-center gap-3.5 relative z-10 w-full sm:w-auto justify-start">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                <img 
                  src="/dsc_logo.png" 
                  alt="The Data Science Community Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="text-left">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight block leading-snug">
                  The Data Science Community
                </span>
                <span className="text-xs text-blue-300 font-medium tracking-wide block mt-0.5">
                  PAF-IAST Student Community
                </span>
              </div>
            </div>

            {/* Right: Pak-Austria Fachhochschule Logo & University Name (Equal in size, color, and boldness) */}
            <div className="flex items-center gap-3.5 relative z-10 w-full sm:w-auto justify-start sm:justify-end">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                <img 
                  src="/paf_iast_logo.png" 
                  alt="PAF-IAST University Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="text-left">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight block leading-snug">
                  Pak-Austria Fachhochschule
                </span>
                <span className="text-xs text-slate-300 font-medium tracking-wide block mt-0.5">
                  Institute of Applied Sciences & Technology
                </span>
              </div>
            </div>
          </div>

          {/* Clean Description (No Recruitment 2026 title badge, no exclusive notice) */}
          <div className="px-6 sm:px-10 py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Registration Portal
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
              Welcome to the official recruitment registration for <b>The Data Science Community</b> at PAF-IAST. Open to all students passionate about machine learning, artificial intelligence, software engineering, event coordination, media, and creative design.
            </p>
          </div>
        </motion.div>

        {/* Multi-Step Stepper Navigation */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs">
          <div className="grid grid-cols-4 gap-2">
            {FORM_STEPS.map((s) => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    // Only allow clicking to earlier steps directly
                    if (s.num < currentStep) {
                      setCurrentStep(s.num);
                      window.scrollTo({ top: 240, behavior: 'smooth' });
                    }
                  }}
                  disabled={s.num > currentStep}
                  className={clsx(
                    "text-left p-2 sm:p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between",
                    isActive 
                      ? "bg-blue-50/80 border border-blue-200 ring-1 ring-blue-500/20" 
                      : isPassed 
                      ? "bg-slate-50 border border-slate-200/60 hover:bg-slate-100/60" 
                      : "opacity-40 cursor-not-allowed bg-transparent border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : isPassed 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-200 text-slate-600"
                    )}>
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                      Step {s.num}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 text-red-800 flex items-start gap-3 shadow-sm border border-red-200"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <p className="text-xs sm:text-sm font-semibold">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* STEP 1: Personal Details (Residential location completely removed!) */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section title="Personal Information" icon={User} subtitle="Your identity and academic credentials at PAF-IAST">
                <TextInput 
                  name="Your full name" 
                  value={formData} 
                  onChange={handleChange} 
                  placeholder="e.g. Ayesha Khan / Muhammad Bilal" 
                  required 
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <TextInput 
                    name="Personal Email Address" 
                    type="email" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="e.g. name@gmail.com" 
                    required 
                  />

                  {/* WhatsApp / Phone with fixed +92 prefix */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                      WhatsApp / Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition-all shadow-xs">
                      <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border-r border-slate-200 select-none">
                        +92
                      </span>
                      <input
                        type="tel"
                        value={formData['Phone Number / WhatsApp'] || ''}
                        onChange={(e) => handleChange('Phone Number / WhatsApp', e.target.value)}
                        required
                        placeholder="300 1234567"
                        className="flex-1 px-4 py-2.5 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <TextInput 
                  name="Registration Number" 
                  value={formData} 
                  onChange={handleChange} 
                  placeholder="e.g. B-23-F-0142 or FA23-BDS-012" 
                  required 
                />

                {/* Academic Department and Degree */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <TextInput 
                    name="Department" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="e.g. Computer Science / AI / SE" 
                    required 
                  />
                  <TextInput 
                    name="Degree / Program" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="e.g. BS Data Science, BS AI, BS CS" 
                    required 
                  />
                </div>

                {/* Interactive Semester Selector */}
                <SemesterSelector 
                  name="Semester" 
                  value={formData} 
                  onChange={handleChange} 
                  required 
                />

                {/* Gender Identification */}
                <div className="pt-1">
                  <RadioGroup 
                    name="What gender do you identify as?" 
                    options={["Female", "Male"]} 
                    value={formData} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </Section>

              {/* Navigation Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>Continue to Position Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Position Selection & Experience ("What they want to be", No Data Science Interest / Scope questions!) */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section 
                title="Position Selection & Experience" 
                icon={Award} 
                subtitle="Select the role you wish to apply for and share your experience"
              >
                
                {/* Executive Roles (With dynamic gender restriction: Female VP ONLY visible if Female!) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                      Executive Leadership
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXECUTIVE_POSITIONS
                      // If Male, filter out Vice President Female completely!
                      .filter(pos => !(pos.femaleOnly && selectedGender === 'Male'))
                      .map(pos => {
                        const isSelected = selectedPosition === pos.id;
                        return (
                          <div
                            key={pos.id}
                            onClick={() => handleChange('Which position are you registering for?', pos.id)}
                            className={clsx(
                              "p-4 rounded-2xl border transition-all text-left relative cursor-pointer",
                              isSelected
                                ? "bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm">{pos.title}</span>
                              {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pos.desc}</p>
                          </div>
                        );
                    })}
                  </div>
                </div>

                {/* Directorate Leads */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Directorates
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DIRECTOR_POSITIONS.map(pos => {
                      const isSelected = selectedPosition === pos.id;
                      return (
                        <div
                          key={pos.id}
                          onClick={() => handleChange('Which position are you registering for?', pos.id)}
                          className={clsx(
                            "p-4 rounded-2xl border transition-all text-left relative cursor-pointer",
                            isSelected
                              ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 text-sm">{pos.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pos.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Directorate Team Members */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Directorate Team Members
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMMUNITY_TEAM_POSITIONS.map(pos => {
                      const isSelected = selectedPosition === pos.id;
                      return (
                        <div
                          key={pos.id}
                          onClick={() => handleChange('Which position are you registering for?', pos.id)}
                          className={clsx(
                            "p-4 rounded-2xl border transition-all text-left relative cursor-pointer",
                            isSelected
                              ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 text-sm">{pos.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pos.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Second-choice position */}
                <div className="pt-3">
                  <TextInput 
                    name="What is your second-choice position?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="e.g. Marketing & Communications Team Member or Director of Event Management or Learning & Projects"
                    required 
                  />
                </div>

                {/* Prior Experience or Interests */}
                <div className="pt-2">
                  <TextAreaWithCharCount 
                    name="Detailed prior experience related to this position/team:" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us about any relevant coursework, tools, projects, club activities, or your enthusiasm to learn and contribute..."
                    minChars={0}
                  />
                </div>
              </Section>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>Continue to Motivation & Availability</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Motivation & Availability (Properly spaced out, NOT combusted!) */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Section 
                title="Motivation & Availability" 
                icon={Briefcase} 
                subtitle="Your dedication, availability, and alignment with community goals"
              >
                <TextAreaWithCharCount 
                  name="Why do you want to join the PAF-IAST Data Science Community?" 
                  value={formData} 
                  onChange={handleChange} 
                  placeholder="Explain what excites you about joining the Data Science Community and what you hope to achieve..."
                  required 
                />

                {/* Commitment & Availability Check */}
                <div className="space-y-4 pt-2">
                  <div className="font-bold text-slate-800 text-sm">
                    Commitment & Availability Check
                  </div>

                  {/* 1. Hackathons & Events on Campus */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">Hackathons & Events on Campus</div>
                      <p className="text-xs text-slate-500">Can you participate in hackathons and events on campus?</p>
                    </div>
                    <RadioGroupInline 
                      name="Would you be able to participate in competitions/hackathons?" 
                      options={["Yes", "No"]} 
                      value={formData} 
                      onChange={handleChange} 
                    />
                  </div>

                  {/* 2. Deadlines & Meetings */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">Meetings & Deadlines</div>
                      <p className="text-xs text-slate-500">Are you willing to attend meetings and complete assigned tasks on time?</p>
                    </div>
                    <RadioGroupInline 
                      name="Are you willing to attend meetings and complete tasks within deadlines?" 
                      options={["Yes", "No"]} 
                      value={formData} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                {/* Other Societies */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 pt-4">
                  <div className="font-semibold text-slate-900 text-sm">
                    Are you currently a member of any other university society/organization?
                  </div>
                  <RadioGroupInline 
                    name="Are you currently a member of any other university society/organization?" 
                    options={["No", "Yes"]} 
                    value={formData} 
                    onChange={handleChange} 
                  />

                  <AnimatePresence>
                    {isMemberOfOtherSociety && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <TextInput 
                          name="Which society/organization and what is your role?" 
                          value={formData} 
                          onChange={handleChange} 
                          placeholder="e.g. ACM PAF-IAST (Member), GDSC, Debating Club"
                          required={isMemberOfOtherSociety}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>Continue to Role Specialization</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Role-Specific Questions & Professional Links & Declaration */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >

              {/* Dynamic Role-Specific Questions (Clean & concise: 2 to 3 questions max per role) */}
              
              {/* 1. Vice President Female Questions (3 questions) */}
              {selectedPosition === 'Vice President Female' && (
                <Section title="Executive Leadership: Vice President (Female)" icon={Crown}>
                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-semibold mb-2">
                    Executive Governance Track • Please answer these leadership questions:
                  </div>

                  <TextAreaWithCharCount 
                    name="Why do you want to step into the Vice President (Female) leadership role?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us what motivates you to step into executive leadership and represent female students in tech..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="How will you represent and encourage female participation in data science and tech competitions?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Share tangible ideas (e.g. beginner-friendly study circles, women in data mentorship, hackathon teams)..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="Share your previous leadership experience or how you plan to guide the community:" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us where you have previously demonstrated leadership, coordination, or initiative..."
                    required 
                  />
                </Section>
              )}

              {/* 3. Director Event Management (3 questions) */}
              {selectedPosition === 'Director Event Management' && (
                <Section title="Directorate Lead: Event Management" icon={Briefcase}>
                  <CheckboxGroup 
                    name="Which aspects of event management interest you most?" 
                    options={[
                      "Event Concept & Planning", 
                      "Hall Logistics & AV Setup", 
                      "Guest Speaker & VIP Hospitality", 
                      "Hackathon Rules & Logistics", 
                      "Stage Hosting & Emceeing", 
                      "Crowd Control & Flow", 
                      "Volunteer Coordination"
                    ]} 
                    value={formData} 
                    onChange={handleCheckboxChange} 
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="Past events, school/college galas, or workshops organized or volunteered at:" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us about events you have helped run in the past and what role you played..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="What is 1 concrete event or workshop idea you would execute for the community?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Describe an exciting idea (e.g. 24-hr data hackathon, Kaggle sprint, Python bootcamp)..."
                    required 
                  />
                </Section>
              )}

              {/* 4. Director Marketing & Communications (1 checklist + 2 questions) */}
              {selectedPosition === 'Director Marketing & Communications' && (
                <Section title="Directorate Lead: Marketing & Communications" icon={Video}>
                  <CheckboxGroup 
                    name="Which creative & marketing areas are you comfortable with?" 
                    options={[
                      "Canva & Graphic Design", 
                      "Social Media Strategy (Instagram / LinkedIn)", 
                      "Video Editing & Reels (CapCut / Premiere)", 
                      "Tech Copywriting & Event Content", 
                      "Photography & Event Coverage",
                      "Marketing Campaigns & Promotions"
                    ]} 
                    value={formData} 
                    onChange={handleCheckboxChange} 
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="Describe your design, video, or content background and past work:" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us what kind of graphics, reels, or campaigns you enjoy creating..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="What is your strategy to build strong brand presence for the Data Science Community across campus?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Share how you'll make our posts, reels, and announcements engaging and viral among students..."
                    required 
                  />
                </Section>
              )}

              {/* 5. Director Learning & Projects (1 checklist + 2 questions) */}
              {selectedPosition === 'Director Learning & Projects' && (
                <Section title="Directorate Lead: Learning & Projects" icon={Briefcase}>
                  <CheckboxGroup 
                    name="Which technical learning tracks would you like to lead?" 
                    options={[
                      "Python & Data Science Study Circles", 
                      "Machine Learning & AI Workshops", 
                      "Kaggle Competitions & Coding Sprints", 
                      "Hands-on Student Project Mentorship", 
                      "Beginner-Friendly Tech Bootcamps"
                    ]} 
                    value={formData} 
                    onChange={handleCheckboxChange} 
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="What technical areas, languages, or tools are you familiar with (e.g., Python, Pandas, SQL, ML)?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Share your technical experience and projects you've explored or built..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="What is 1 project or workshop idea you would lead for community members?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Describe a hands-on learning activity or project that would benefit students..."
                    required 
                  />
                </Section>
              )}

              {/* 7. Director Technology & Platform (1 checklist + 2 questions) */}
              {selectedPosition === 'Director Technology & Platform' && (
                <Section title="Directorate Lead: Technology & Platform" icon={Globe}>
                  <CheckboxGroup 
                    name="Which technical stack / platform skills do you have?" 
                    options={[
                      "Frontend (React / Next.js / Tailwind / HTML/CSS)", 
                      "Backend & APIs (Node.js / Python / Express)", 
                      "Databases & Cloud (PostgreSQL / Supabase / Firebase)", 
                      "Discord Bots & Community Automations", 
                      "Git & GitHub Version Control"
                    ]} 
                    value={formData} 
                    onChange={handleCheckboxChange} 
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="Describe any web applications, platforms, or tools you have built or worked on:" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us about your coding projects, technical problem-solving, or system tools..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="What digital platform or tool would you create to make community operations faster?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Share an idea (e.g. member portal, event check-in scanner, automated certificate generator)..."
                    required 
                  />
                </Section>
              )}

              {/* 8. All Team Members (2 questions) */}
              {selectedPosition && selectedPosition.includes('Team Member') && (
                <Section title={`Team Member Specialization: ${selectedPosition}`} icon={Users}>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold mb-2">
                    Team Member Track • We warmly welcome all students eager to contribute, learn, and grow!
                  </div>

                  <TextAreaWithCharCount 
                    name="Which specific tasks or skills are you most excited to contribute and learn in this team?" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us what you are eager to work on, learn, and assist with..."
                    required 
                  />

                  <TextAreaWithCharCount 
                    name="Have you worked in a team or club before? Briefly describe what you learned:" 
                    value={formData} 
                    onChange={handleChange} 
                    placeholder="Tell us about any past group work, school team, or volunteer activity (or your eagerness if this is your first community experience!)..."
                    required 
                  />
                </Section>
              )}

              {/* Declaration & Recruitment Consent */}
              <Section title="Declaration & Recruitment Consent" icon={ShieldCheck}>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                  <div className="font-bold text-slate-800 text-sm">Official Consent & Privacy Assurance</div>
                  <p>
                    By submitting this application, I verify that the provided academic and personal information is accurate. I grant consent to The Data Science Community Committee to evaluate my profile for recruitment.
                  </p>
                </div>

                <RadioGroup 
                  name="Consent Declaration: I agree to the recruitment terms and consent to evaluation." 
                  options={["I Agree & Consent", "I Do Not Agree"]} 
                  value={formData} 
                  onChange={handleChange} 
                  required 
                />
              </Section>

              {/* Navigation & Submit Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application to Data Science Community'}
                  {!submitting && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

            </motion.div>
          )}

        </form>
      </div>
    </div>
  );
}

// Reusable Card Section
function Section({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90"
    >
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
            {Icon && <Icon className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{title}</span>
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </motion.div>
  );
}

// Reusable Text Input
function TextInput({ name, type = "text", value, onChange, placeholder, required }: any) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-medium placeholder:text-slate-400 shadow-xs"
        placeholder={placeholder || "Your answer"}
      />
    </div>
  );
}

// Interactive Semester Selector
function SemesterSelector({ name, value, onChange, required }: any) {
  const semesters = [
    { num: 1, label: "1st" },
    { num: 2, label: "2nd" },
    { num: 3, label: "3rd" },
    { num: 4, label: "4th" },
    { num: 5, label: "5th" },
    { num: 6, label: "6th" },
    { num: 7, label: "7th" },
    { num: 8, label: "8th" },
    { num: 9, label: "9th" },
    { num: 10, label: "10th" },
  ];
  const current = value[name];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[13px] font-semibold text-slate-800">
          {name} {required && <span className="text-red-500">*</span>}
        </label>
        {current && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Selected: {current}
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {semesters.map(s => {
          const valStr = `Semester ${s.num} (${s.label})`;
          const isSelected = current === valStr;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => onChange(name, valStr)}
              className={clsx(
                "py-2.5 px-1 rounded-xl text-center font-semibold text-xs sm:text-sm transition-all border cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-105"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              )}
            >
              <div className="text-[10px] opacity-75">{s.label}</div>
              <div className="text-sm font-bold">{s.num}</div>
            </button>
          );
        })}
      </div>
      {required && !current && (
        <input type="text" className="opacity-0 w-0 h-0 p-0 m-0 absolute" required value="" onChange={() => {}} />
      )}
    </div>
  );
}

// Textarea with Character Counter
function TextAreaWithCharCount({ 
  name, 
  value, 
  onChange, 
  required, 
  minChars = 15, 
  maxChars = 5000, 
  placeholder 
}: any) {
  const text = value[name] || '';
  const charCount = text.length;
  const isTooShort = text.trim().length > 0 && charCount < minChars;
  const isTooLong = charCount > maxChars;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
        <label className="block text-[13px] font-semibold text-slate-800">
          {name} {required && <span className="text-red-500">*</span>}
        </label>
        <span className={clsx(
          "text-[10px] font-mono px-2 py-0.5 rounded-full self-start sm:self-auto",
          isTooShort 
            ? "text-amber-700 bg-amber-50 border border-amber-200" 
            : isTooLong 
            ? "text-red-700 bg-red-50 border border-red-200" 
            : "text-slate-500 bg-slate-100"
        )}>
          {charCount} / {maxChars} chars (min {minChars})
        </span>
      </div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        placeholder={placeholder}
        className={clsx(
          "w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 outline-none transition-all text-xs sm:text-sm leading-relaxed placeholder:text-slate-400 shadow-xs",
          isTooShort 
            ? "border-amber-300 focus:ring-2 focus:ring-amber-500/20" 
            : isTooLong 
            ? "border-red-400 focus:ring-2 focus:ring-red-500/20" 
            : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
        )}
      />
    </div>
  );
}

// Radio Group
function RadioGroup({ name, options, value, onChange, required }: any) {
  const current = value[name];
  return (
    <div>
      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt: string) => {
          const isSelected = current === opt;
          return (
            <label
              key={opt}
              className={clsx(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all",
                isSelected
                  ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-1 ring-blue-600/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={isSelected}
                onChange={() => onChange(name, opt)}
                required={required}
                className="w-4 h-4 text-blue-600 accent-blue-600"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Inline Radio Toggle (Pill style for commitment questions)
function RadioGroupInline({ name, options, value, onChange }: any) {
  const current = value[name];
  return (
    <div className="inline-flex rounded-xl bg-slate-200/60 p-1 border border-slate-200">
      {options.map((opt: string) => {
        const isSelected = current === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(name, opt)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              isSelected
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// Checkbox Group
function CheckboxGroup({ name, options, value, onChange, required }: any) {
  const current: string[] = value[name] || [];
  return (
    <div>
      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt: string) => {
          const isChecked = current.includes(opt);
          return (
            <label
              key={opt}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all",
                isChecked
                  ? "bg-blue-50 border-blue-600 text-blue-800 font-semibold shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onChange(name, opt, e.target.checked)}
                className="w-4 h-4 text-blue-600 accent-blue-600 rounded-sm"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
      {required && current.length === 0 && (
        <span className="text-[11px] text-slate-400 mt-1 block">Please select at least one option</span>
      )}
    </div>
  );
}
