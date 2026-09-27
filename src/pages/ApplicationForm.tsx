import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

const BASE_TEAMS = [
  "Event Management",
  "Media & Content",
  "Decor & Arts",
  "Public Relations (PR)",
  "Content & Editorial"
];

const PROVINCES = [
  "Khyber Pakhtunkhwa (KPK)",
  "Punjab",
  "Sindh",
  "Balochistan",
  "Islamabad Capital Territory (ICT)",
  "Azad Jammu & Kashmir (AJK)",
  "Gilgit-Baltistan (GB)"
];

export default function ApplicationForm() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('paf_ss_form_draft');
      if (draft) {
        setFormData(JSON.parse(draft));
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
  }, []);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Gender-based role restriction:
      // Female applicants can apply for General Secretary (not Vice President)
      // Male applicants can apply for Vice President (not General Secretary)
      if (name === 'What gender do you identify as?') {
        const currentTeam = updated['Which team are you registering for?'];
        if (value === 'Female' && currentTeam === 'Vice President ( male )') {
          delete updated['Which team are you registering for?'];
        } else if (value === 'Male' && currentTeam === 'General Secretary') {
          delete updated['Which team are you registering for?'];
        }
      }

      try {
        localStorage.setItem('paf_ss_form_draft', JSON.stringify(updated));
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
        localStorage.setItem('paf_ss_form_draft', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const selectedGender = formData['What gender do you identify as?'];
  const availableTeams = selectedGender === 'Female'
    ? [...BASE_TEAMS, "General Secretary"]
    : selectedGender === 'Male'
    ? [...BASE_TEAMS, "Vice President ( male )"]
    : [...BASE_TEAMS, "General Secretary", "Vice President ( male )"];

  const selectedTeam = formData['Which team are you registering for?'];
  const isMemberOfOtherSociety = formData['Are you currently a member of any other university society/organization?'] === 'Yes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate Character Limits on textareas (min 15 chars, max 5000 chars)
    const charLimitFields: string[] = [
      'Why do you want to join the PAF-IAST Science Society?',
      'What is your biggest motivation to join the society?',
      'Detailed prior experience related to the position/team:'
    ];

    if (selectedTeam === "Event Management") {
      charLimitFields.push('Event Management Prior Experience:');
    } else if (selectedTeam === "Decor & Arts") {
      charLimitFields.push('Decor & Arts Prior Experience:');
    } else if (selectedTeam === "Media & Content") {
      charLimitFields.push('Media & Content Prior Experience:');
    } else if (selectedTeam === "Public Relations (PR)") {
      charLimitFields.push('Public Relations Prior Experience:');
    } else if (selectedTeam === "Content & Editorial") {
      charLimitFields.push('Writing & Editorial Prior Experience / Sample:');
    } else if (selectedTeam === "General Secretary" || selectedTeam === "Vice President ( male )") {
      charLimitFields.push(
        'Why are you interested in taking an executive role in the Science Society?',
        'How do you think you can contribute to the society in this role?',
        'Leadership & Management Prior Experience:'
      );
    }

    for (const field of charLimitFields) {
      const answer = (formData[field] || '').trim();
      if (answer.length < 15) {
        setError(`"${field}" requires at least 15 characters. Currently: ${answer.length} characters.`);
        setSubmitting(false);
        window.scrollTo({ top: 350, behavior: 'smooth' });
        return;
      }
      if (answer.length > 5000) {
        setError(`"${field}" exceeds the maximum limit of 5,000 characters. Currently: ${answer.length} characters.`);
        setSubmitting(false);
        window.scrollTo({ top: 350, behavior: 'smooth' });
        return;
      }
    }

    try {
      const applicantName = formData['Your full name'];
      const cnic = formData['CNIC / B-Form Number'];
      const regNo = formData['Registration Number'];
      const department = formData['Department'];
      const program = formData['Degree / Program'];
      const semester = formData['Semester'];
      const province = formData['Province / Region'];
      const city = formData['City'];
      const streetAddress = formData['Street / Hostel Address'];
      const rawPhone = (formData['Phone Number / WhatsApp'] || '').trim().replace(/^\+?92\s*/, '');
      const fullPhone = rawPhone ? `+92 ${rawPhone}` : '';
      const email = formData['Personal Email Address'] || formData['Email address'] || '';
      const combinedDept = program ? `${department} - ${program}` : department;

      const { error: dbError } = await supabase
        .from('applications')
        .insert([
          {
            applicant_name: applicantName,
            registration_number: regNo,
            department: combinedDept,
            semester: semester,
            applied_position: selectedTeam,
            answers: {
              ...formData,
              'Personal Email Address': email,
              'Phone Number / WhatsApp': fullPhone,
              _cnic: cnic,
              _department: department,
              _program: program,
              _province: province,
              _city: city,
              _streetAddress: streetAddress,
              _phone: fullPhone,
              _email: email
            }
          }
        ]);


      if (dbError) throw dbError;

      // Clear draft on successful submission
      try {
        localStorage.removeItem('paf_ss_form_draft');
      } catch (e) {}

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || "Failed to submit application. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 text-center shadow-xl"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/paf_iast_logo.png" alt="PAF-IAST" className="h-14 w-auto object-contain" />
            <div className="h-10 w-px bg-slate-200"></div>
            <img src="/science_society_logo.png" alt="Science Society" className="h-12 w-auto object-contain" />
          </div>
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Application Received!</h2>
          <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
            Thank you for applying to the PAF-IAST Science Society Cabinet 2026–27. 
            Your registration has been securely recorded. Shortlisted candidates will be contacted for an interview.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 rounded-xl bg-[#0056A8] text-white font-semibold hover:bg-[#0056A8]/90 transition-colors shadow-sm"
          >
            Submit Another Application
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header without the blue box */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden"
        >
          {/* Top Banner with Logos */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 sm:px-10 py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <img 
                src="/paf_iast_logo.png" 
                alt="PAF-IAST University Logo" 
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm" 
              />
            </div>
            <div className="hidden sm:block h-14 w-px bg-slate-200"></div>
            <div className="flex items-center">
              <img 
                src="/science_society_logo.png" 
                alt="PAF-IAST Science Society Logo" 
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm" 
              />
            </div>
          </div>

          {/* Title & Info */}
          <div className="px-6 sm:px-10 py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0056A8] text-xs font-semibold uppercase tracking-wider mb-3">
              Official Cabinet Recruitment 2026–27
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              PAF-IAST Science Society
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3">
              Ready to be part of something bigger? Applications are now open for the PAF-IAST Science Society Cabinet 2026–27. Choose the team or position that best matches your interests, skills, and strengths, and tell us what you can bring to the society.
            </p>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 flex items-start gap-3 shadow-sm border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Details */}
          <Section title="Personal Details">
            <TextInput 
              name="Your full name" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. Muhammad Ali" 
              required 
            />

            <TextInput 
              name="CNIC / B-Form Number" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. 13101-1234567-1 (13 digits)" 
              required 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput 
                name="Personal Email Address" 
                type="email" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. yourname@gmail.com (Personal email, not university email)" 
                required 
              />

              {/* Phone with fixed +92 prefix */}
              <div>
                <label className="block text-[15px] font-medium text-slate-800 mb-2">
                  Phone Number / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 bg-white/70 overflow-hidden focus-within:ring-2 focus-within:ring-[#0056A8]/20 focus-within:border-[#0056A8] transition-all">
                  <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-bold text-sm border-r border-slate-200 select-none">
                    +92
                  </span>
                  <input
                    type="tel"
                    value={formData['Phone Number / WhatsApp'] || ''}
                    onChange={(e) => handleChange('Phone Number / WhatsApp', e.target.value)}
                    required
                    placeholder="300 1234567"
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <TextInput 
              name="Registration Number" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. B-22-F-1042" 
              required 
            />

            {/* Department and Degree/Program as Separate Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput 
                name="Department" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. Computer Science / Electrical / Allied Health" 
                required 
              />
              <TextInput 
                name="Degree / Program" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. BS AI, BS SE, DPT, BBA" 
                required 
              />
            </div>

            {/* Semester Selector up to 10 */}
            <SemesterSelector 
              name="Semester" 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            {/* Residential Location & Province / Special Areas */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-5">
              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <span>Residential Location & Address</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Province / Administrative Territory */}
                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
                    Province / Special Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData['Province / Region'] || ''}
                    onChange={(e) => handleChange('Province / Region', e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0056A8]/20 focus:border-[#0056A8] outline-none cursor-pointer"
                  >
                    <option value="">-- Select Province / Area --</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* City directly typed by user */}
                <div>
                  <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['City'] || ''}
                    onChange={(e) => handleChange('City', e.target.value)}
                    required
                    placeholder="e.g. Haripur, Abbottabad, Peshawar, Lahore"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#0056A8]/20 focus:border-[#0056A8] outline-none"
                  />
                </div>
              </div>

              {/* Complete Street Address */}
              <div>
                <label className="block text-[14px] font-medium text-slate-700 mb-1.5">
                  Complete Street / Hostel Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData['Street / Hostel Address'] || ''}
                  onChange={(e) => handleChange('Street / Hostel Address', e.target.value)}
                  required
                  placeholder="e.g. House No. 42, Street 3, Sector B, or PAF-IAST Boys/Girls Hostel Room 12"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#0056A8]/20 focus:border-[#0056A8] outline-none"
                />
              </div>
            </div>

            <RadioGroup 
              name="What gender do you identify as?" 
              options={["Female", "Male"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <TextInput 
              name="Date of birth" 
              type="date" 
              value={formData} 
              onChange={handleChange} 
              required 
            />
          </Section>

          {/* Motivation & Commitment */}
          <Section title="Application Motivation">
            <TextAreaWithCharCount 
              name="Why do you want to join the PAF-IAST Science Society?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="Explain why you want to become part of the Science Society Cabinet..."
              required 
            />

            <TextAreaWithCharCount 
              name="What is your biggest motivation to join the society?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="What inspires or drives you to contribute here..."
              required 
            />

            <RadioGroup 
              name="Would you be able to participate in competitions/tournaments?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <RadioGroup 
              name="Would you be able to travel for group events?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <RadioGroup 
              name="Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            {/* Conditional Question: Only show society details if 'Yes' */}
            <RadioGroup 
              name="Are you currently a member of any other university society/organization?" 
              options={["No", "Yes"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <AnimatePresence>
              {isMemberOfOtherSociety && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pl-4 border-l-2 border-[#0056A8]/40">
                    <TextInput 
                      name="Which society/organization and what is your role?" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="e.g. Media Society (Member), GDSC (Lead)"
                      required={isMemberOfOtherSociety}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <TextInput 
              name="Is there anything else you'd like us to know about you?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="Any additional passions, hobbies, or achievements..."
              required 
            />
          </Section>

          {/* Teams & Prior Experience */}
          <Section title="Team Selection & Experience">
            <div>
              <RadioGroup 
                name="Which team are you registering for?" 
                options={availableTeams} 
                value={formData} 
                onChange={handleChange} 
                required 
              />
              {selectedGender === 'Female' ? (
                <p className="text-xs text-blue-700 bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 mt-2.5">
                  Showing eligible teams for female applicants (General Secretary is exclusive to female candidates).
                </p>
              ) : selectedGender === 'Male' ? (
                <p className="text-xs text-blue-700 bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 mt-2.5">
                  Showing eligible teams for male applicants (Vice President is exclusive to male candidates).
                </p>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 mt-2.5">
                  💡 Note: Select your gender in Personal Details to see gender-specific executive roles (Vice President for male candidates, General Secretary for female candidates).
                </p>
              )}
            </div>

            <TextInput 
              name="What is your second-choice team?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. Media & Content or Decor & Arts"
              required 
            />

            <RadioGroup 
              name="What is your skill level in this domain?" 
              options={["Beginner", "Intermediate", "Advanced", "Expert"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <TextAreaWithCharCount 
              name="Detailed prior experience related to the position/team:" 
              value={formData} 
              onChange={handleChange} 
              placeholder="Detail your prior background, projects, or tasks handled in this field..."
              required 
            />

            <TextInput 
              name="Please share details if you've received any awards or certificates for this:" 
              value={formData} 
              onChange={handleChange} 
              placeholder="Mention competitions won, certifications, or recognitions"
            />
          </Section>

          {/* Dynamic Team-Specific Subdomain Questions */}
          <AnimatePresence mode="popLayout">
            {selectedTeam === "Event Management" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Event Management Subdomain">
                    <CheckboxGroup 
                      name="Which aspects of event management interest you?" 
                      options={["Planning", "Logistics", "Coordination", "Crowd/participant management", "Stage/program management", "Event execution", "Team coordination"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="Event Management Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="Detail previous events, school/college/university festivals, or projects you have organized or volunteered for..."
                      required 
                    />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Decor & Arts" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Decor & Arts Subdomain">
                    <CheckboxGroup 
                      name="What skills do you have?" 
                      options={["Arts & crafts", "Handmade decorations", "Stall decoration", "Props", "Backdrops", "Banners/sign boards physically", "Event venue setup", "Themed displays", "Creative installations", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="Decor & Arts Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="Describe your craft, setup, or decorative work in detail..."
                      required 
                    />
                    <TextInput 
                      name="Link to your previous work / portfolio (Drive/Instagram):" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="https://drive.google.com/..."
                    />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Media & Content" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Media & Content Subdomain">
                    <CheckboxGroup 
                      name="What tools/software are you comfortable using?" 
                      options={["Canva", "Photoshop", "Illustrator", "CapCut", "Premiere Pro / After Effects", "Figma", "Photography", "Videography", "Graphic design", "Reels/Shorts", "Social media management", "Digital posters/carousels", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="Media & Content Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="Describe your media experience, tools you work with daily, and videos/graphics you created..."
                      required 
                    />
                    <TextInput 
                      name="Portfolio / Social Media link (Behance/Drive/Insta):" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="https://..."
                    />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Public Relations (PR)" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Public Relations Subdomain">
                    <CheckboxGroup 
                      name="Which areas are you comfortable with?" 
                      options={["Communication", "Public speaking", "Outreach", "Contacting organizations/societies", "Sponsorship & corporate liaisons", "Social media communication", "Networking", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="Public Relations Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="Describe how you handle public communication, negotiations, sponsors, or inter-university liaisons..."
                      required 
                    />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Content & Editorial" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Content & Editorial Subdomain">
                    <CheckboxGroup 
                      name="Which areas of editorial work interest you?" 
                      options={["Science & research news", "University/local news & updates", "Articles & write-ups", "Newsletters", "Research summaries", "Event reports", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <RadioGroup 
                      name="What type of writing are you most comfortable with?" 
                      options={["Informative", "Formal/academic", "Creative", "Social media copy", "Willing to learn", "Other"]} 
                      value={formData} 
                      onChange={handleChange} 
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="Writing & Editorial Prior Experience / Sample:" 
                      value={formData} 
                      onChange={handleChange} 
                      placeholder="Describe articles, blogs, newsletters, or reports you've written, or provide a brief writing sample..."
                      required 
                    />
                  </Section>
                </div>
              </motion.div>
            )}

            {(selectedTeam === "General Secretary" || selectedTeam === "Vice President ( male )") && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Executive Leadership Role">
                    <div className="p-4 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Executive Role:</div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">{selectedTeam}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0056A8] text-white shadow-2xs">
                        Cabinet 2026–27
                      </span>
                    </div>

                    <TextAreaWithCharCount 
                      name="Why are you interested in taking an executive role in the Science Society?" 
                      value={formData} 
                      onChange={handleChange} 
                      minChars={20} 
                      placeholder="Explain your vision, motivation, and reasons for stepping up to executive leadership..."
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="How do you think you can contribute to the society in this role?" 
                      value={formData} 
                      onChange={handleChange} 
                      minChars={20} 
                      placeholder="Describe the tangible value, structure, or innovations you will bring..."
                      required 
                    />
                    <TextAreaWithCharCount 
                      name="Leadership & Management Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      minChars={20} 
                      placeholder="Describe previous leadership posts, society positions, or team management roles you have held..."
                      required 
                    />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terms, Privacy & Declaration */}
          <Section title="Terms, Privacy & Consent">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-600 space-y-2.5 leading-relaxed">
              <div className="font-semibold text-slate-800 text-sm">Data Privacy & Recruitment Consent</div>
              <p>
                By submitting this application, I confirm that all provided information is accurate and authentic. 
                I hereby grant consent to the PAF-IAST Science Society Executive & Recruitment Committee to securely review, manage, and process my personal data, contact details, and application answers strictly for cabinet recruitment and interview evaluation purposes. 
                The Society upholds strict privacy standards and will not disclose your personal details to any unauthorized third party.
              </p>
            </div>

            <RadioGroup 
              name="Consent Declaration: I agree to the terms, recruitment evaluation, and consent to my data being processed." 
              options={["I Agree & Consent", "I Do Not Agree"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />
          </Section>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-4 bg-[#0056A8] text-white rounded-2xl font-bold shadow-lg shadow-[#0056A8]/25 hover:bg-[#0056A8]/90 hover:shadow-xl hover:shadow-[#0056A8]/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#0056A8]/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-lg"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
              {!submitting && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/70"
    >
      <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#0056A8]" />
        {title}
      </h3>
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
}

function TextInput({ name, type = "text", value, onChange, placeholder, required }: any) {
  return (
    <div>
      <label className="block text-[15px] font-medium text-slate-800 mb-2">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-[#0056A8]/20 focus:border-[#0056A8] outline-none transition-all text-sm"
        placeholder={placeholder || "Your answer"}
      />
    </div>
  );
}

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
        <label className="block text-[15px] font-medium text-slate-800">
          {name} {required && <span className="text-red-500">*</span>}
        </label>
        {current && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#0056A8] border border-blue-100">
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
                "py-3 px-1 rounded-xl text-center font-semibold text-sm transition-all border",
                isSelected
                  ? "bg-[#0056A8] text-white border-[#0056A8] shadow-md shadow-[#0056A8]/20 scale-105"
                  : "bg-white/80 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="text-[11px] opacity-75">{s.label}</div>
              <div className="text-base font-bold">{s.num}</div>
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
  const isValid = charCount >= minChars && charCount <= maxChars;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <label className="block text-[15px] font-medium text-slate-800">
          {name} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-xs font-medium">
          {text.trim().length === 0 ? (
            <span className="text-slate-400 font-medium">15–5,000 characters</span>
          ) : isTooShort ? (
            <span className="text-amber-600 font-semibold">{charCount} / {minChars} min ({minChars - charCount} more characters needed)</span>
          ) : isTooLong ? (
            <span className="text-red-600 font-semibold">{charCount} / {maxChars} max (Exceeded by {charCount - maxChars})</span>
          ) : (
            <span className="text-emerald-600 font-semibold">✓ {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters</span>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        rows={4}
        maxLength={maxChars + 50}
        className={clsx(
          "w-full px-4 py-3 rounded-xl border bg-white/70 focus:bg-white outline-none transition-all resize-y text-sm",
          isTooLong 
            ? "border-red-400 focus:ring-2 focus:ring-red-200" 
            : isValid 
            ? "border-emerald-300 focus:ring-2 focus:ring-emerald-100" 
            : "border-slate-200 focus:ring-2 focus:ring-[#0056A8]/20 focus:border-[#0056A8]"
        )}
        placeholder={placeholder || `Write your response here (minimum 15 characters, maximum 5,000 characters)...`}
      />
      <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
        <span>Minimum: {minChars} characters</span>
        <span>Maximum: {maxChars.toLocaleString()} characters</span>
      </div>
    </div>
  );
}

function RadioGroup({ name, options, value, onChange, required }: any) {
  return (
    <div>
      <label className="block text-[15px] font-medium text-slate-800 mb-3">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2.5">
        {options.map((opt: string) => (
          <label key={opt} className={clsx(
            "flex items-center p-3.5 border rounded-xl cursor-pointer transition-all",
            value[name] === opt ? "border-[#0056A8] bg-[#0056A8]/5 shadow-xs" : "border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300"
          )}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value[name] === opt}
              onChange={() => onChange(name, opt)}
              required={required}
              className="w-4 h-4 text-[#0056A8] border-slate-300 focus:ring-[#0056A8]"
            />
            <span className="ml-3 text-sm font-medium text-slate-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ name, options, value, onChange, required }: any) {
  const selected = value[name] || [];
  return (
    <div>
      <label className="block text-[15px] font-medium text-slate-800 mb-3">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt: string) => {
          const isChecked = selected.includes(opt);
          return (
            <label key={opt} className={clsx(
              "flex items-center p-3 border rounded-xl cursor-pointer transition-all",
              isChecked ? "border-[#0056A8] bg-[#0056A8]/5 shadow-xs" : "border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300"
            )}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onChange(name, opt, e.target.checked)}
                className="w-4 h-4 text-[#0056A8] border-slate-300 rounded focus:ring-[#0056A8]"
              />
              <span className="ml-3 text-xs sm:text-sm font-medium text-slate-700">{opt}</span>
            </label>
          );
        })}
      </div>
      {required && selected.length === 0 && (
        <input type="text" className="opacity-0 w-0 h-0 p-0 m-0 absolute" required />
      )}
    </div>
  );
}
