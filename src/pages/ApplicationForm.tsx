import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle, FileText, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const TEAMS = [
  "Event Management",
  "Media & Content",
  "Decor & Arts",
  "Public Relations (PR)",
  "Content & Editorial",
  "General Secretary",
  "Vice President ( male )"
];

// Helper to count words in a string
function countWords(str: string): number {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export default function ApplicationForm() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const current = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...current, value] };
      } else {
        return { ...prev, [name]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const selectedTeam = formData['19. Which team are you registering for?'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate Word Limits on textareas
    const wordLimitFields: { field: string; min: number; max: number }[] = [
      { field: '11. Why do you want to join the PAF-IAST Science Society?', min: 15, max: 150 },
      { field: '12. What is your biggest motivation to join the society?', min: 15, max: 150 },
      { field: '22. Detailed prior experience related to the position/team:', min: 15, max: 200 }
    ];

    if (selectedTeam === "Event Management") {
      wordLimitFields.push({ field: '25. Event Management Prior Experience:', min: 15, max: 200 });
    } else if (selectedTeam === "Decor & Arts") {
      wordLimitFields.push({ field: '26. Decor & Arts Prior Experience:', min: 15, max: 200 });
    } else if (selectedTeam === "Media & Content") {
      wordLimitFields.push({ field: '27. Media & Content Prior Experience:', min: 15, max: 200 });
    } else if (selectedTeam === "Public Relations (PR)") {
      wordLimitFields.push({ field: '28. Public Relations Prior Experience:', min: 15, max: 200 });
    } else if (selectedTeam === "Content & Editorial") {
      wordLimitFields.push({ field: '31. Writing & Editorial Prior Experience / Sample:', min: 15, max: 200 });
    } else if (selectedTeam === "General Secretary" || selectedTeam === "Vice President ( male )") {
      wordLimitFields.push(
        { field: '33. Why are you interested in taking an executive role in the Science Society?', min: 20, max: 250 },
        { field: '34. What do you think you can contribute to the society in this role?', min: 20, max: 250 },
        { field: '36. Leadership & Management Prior Experience:', min: 20, max: 250 }
      );
    }

    for (const item of wordLimitFields) {
      const answer = formData[item.field] || '';
      const words = countWords(answer);
      if (words < item.min) {
        setError(`"${item.field}" requires at least ${item.min} words. Currently: ${words} words.`);
        setSubmitting(false);
        window.scrollTo({ top: 300, behavior: 'smooth' });
        return;
      }
      if (words > item.max) {
        setError(`"${item.field}" exceeds the maximum limit of ${item.max} words. Currently: ${words} words.`);
        setSubmitting(false);
        window.scrollTo({ top: 300, behavior: 'smooth' });
        return;
      }
    }

    try {
      const applicantName = formData['1. Your full name'];
      const cnic = formData['2. CNIC / B-Form Number'];
      const regNo = formData['5. Registration Number'];
      const department = formData['6. Department'];
      const program = formData['7. Degree / Program'];
      const semester = formData['8. Semester'];
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
              _cnic: cnic,
              _department: department,
              _program: program
            }
          }
        ]);

      if (dbError) throw dbError;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please check your connection and try again.");
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
            Your details have been securely recorded. Shortlisted applicants will be contacted for an interview.
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
        
        {/* Header */}
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
            <div className="mt-5 p-4 bg-blue-50/70 border border-blue-100/80 rounded-2xl flex items-center gap-3 text-sm text-[#0056A8]">
              <Sparkles className="w-5 h-5 shrink-0 text-[#0056A8]" />
              <span className="font-medium">Please review all answers carefully. Essay responses require concise, quality writing adhering to word limits.</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 flex items-start gap-3 shadow-sm border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Personal Details */}
          <Section title="Section 1: Personal Details">
            <TextInput 
              name="1. Your full name" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. Muhammad Ali" 
              required 
            />

            <TextInput 
              name="2. CNIC / B-Form Number" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. 13101-1234567-1 (13 digits)" 
              required 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput 
                name="3. Email address" 
                type="email" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. student@paf-iast.edu.pk" 
                required 
              />
              <TextInput 
                name="4. Phone number / WhatsApp" 
                type="tel" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. 0300-1234567" 
                required 
              />
            </div>

            <TextInput 
              name="5. Registration Number" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. B-22-F-1042" 
              required 
            />

            {/* Department and Degree/Program as Separate Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput 
                name="6. Department" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. Computer Science / Electrical / Allied Health" 
                required 
              />
              <TextInput 
                name="7. Degree / Program" 
                value={formData} 
                onChange={handleChange} 
                placeholder="e.g. BS AI, BS SE, DPT, BBA" 
                required 
              />
            </div>

            {/* Semester Selector up to 10 */}
            <SemesterSelector 
              name="8. Semester" 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <RadioGroup 
              name="9. What gender do you identify as?" 
              options={["Female", "Male"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <TextInput 
              name="10. Date of birth" 
              type="date" 
              value={formData} 
              onChange={handleChange} 
              required 
            />
          </Section>

          {/* Section 2: Motivation & Commitment */}
          <Section title="Section 2: Application Motivation">
            <TextAreaWithWordCount 
              name="11. Why do you want to join the PAF-IAST Science Society?" 
              value={formData} 
              onChange={handleChange} 
              minWords={15} 
              maxWords={150} 
              placeholder="Explain why you want to become part of the Science Society Cabinet..."
              required 
            />

            <TextAreaWithWordCount 
              name="12. What is your biggest motivation to join the society?" 
              value={formData} 
              onChange={handleChange} 
              minWords={15} 
              maxWords={150} 
              placeholder="What inspires or drives you to contribute here..."
              required 
            />

            <RadioGroup 
              name="13. Would you be able to participate in competitions/tournaments?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <RadioGroup 
              name="14. Would you be able to travel for group events?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <RadioGroup 
              name="15. Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <RadioGroup 
              name="16. Are you currently a member of any other university society/organization?" 
              options={["Yes", "No"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <TextInput 
              name="17. If yes: Which society/organization and what is your role?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="Leave blank if not applicable"
            />

            <TextInput 
              name="18. Is there anything else you'd like us to know about you?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="Any additional passions, hobbies, or traits..."
              required 
            />
          </Section>

          {/* Section 3: Teams & Prior Experience */}
          <Section title="Section 3: Team Selection & Experience">
            <RadioGroup 
              name="19. Which team are you registering for?" 
              options={TEAMS} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <TextInput 
              name="20. What is your second-choice team?" 
              value={formData} 
              onChange={handleChange} 
              placeholder="e.g. Media & Content or Decor & Arts"
              required 
            />

            <RadioGroup 
              name="21. What is your skill level in this domain?" 
              options={["Beginner", "Intermediate", "Advanced", "Expert"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />

            <TextAreaWithWordCount 
              name="22. Detailed prior experience related to the position/team:" 
              value={formData} 
              onChange={handleChange} 
              minWords={15} 
              maxWords={200} 
              placeholder="Detail your prior background, projects, or tasks handled in this field..."
              required 
            />

            <TextInput 
              name="23. Please share details if you've received any awards or certificates for this:" 
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
                  <Section title="Section 4: Event Management Subdomain">
                    <CheckboxGroup 
                      name="24. Which aspects of event management interest you?" 
                      options={["Planning", "Logistics", "Coordination", "Crowd/participant management", "Stage/program management", "Event execution", "Team coordination"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="25. Event Management Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={15} 
                      maxWords={200} 
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
                  <Section title="Section 5: Decor & Arts Subdomain">
                    <CheckboxGroup 
                      name="24. What skills do you have?" 
                      options={["Arts & crafts", "Handmade decorations", "Stall decoration", "Props", "Backdrops", "Banners/sign boards physically", "Event venue setup", "Themed displays", "Creative installations", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="26. Decor & Arts Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={15} 
                      maxWords={200} 
                      placeholder="Describe your craft, setup, or decorative work in detail..."
                      required 
                    />
                    <TextInput 
                      name="25. Link to your previous work / portfolio (Drive/Instagram):" 
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
                  <Section title="Section 6: Media & Content Subdomain">
                    <CheckboxGroup 
                      name="24. What tools/software are you comfortable using?" 
                      options={["Canva", "Photoshop", "Illustrator", "CapCut", "Premiere Pro / After Effects", "Figma", "Photography", "Videography", "Graphic design", "Reels/Shorts", "Social media management", "Digital posters/carousels", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="27. Media & Content Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={15} 
                      maxWords={200} 
                      placeholder="Describe your media experience, tools you work with daily, and videos/graphics you created..."
                      required 
                    />
                    <TextInput 
                      name="25. Portfolio / Social Media link (Behance/Drive/Insta):" 
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
                  <Section title="Section 7: Public Relations Subdomain">
                    <CheckboxGroup 
                      name="24. Which areas are you comfortable with?" 
                      options={["Communication", "Public speaking", "Outreach", "Contacting organizations/societies", "Sponsorship & corporate liaisons", "Social media communication", "Networking", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="28. Public Relations Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={15} 
                      maxWords={200} 
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
                  <Section title="Section 8: Content & Editorial Subdomain">
                    <CheckboxGroup 
                      name="29. Which areas of editorial work interest you?" 
                      options={["Science & research news", "University/local news & updates", "Articles & write-ups", "Newsletters", "Research summaries", "Event reports", "Other"]} 
                      value={formData} 
                      onChange={handleCheckboxChange} 
                      required 
                    />
                    <RadioGroup 
                      name="30. What type of writing are you most comfortable with?" 
                      options={["Informative", "Formal/academic", "Creative", "Social media copy", "Willing to learn", "Other"]} 
                      value={formData} 
                      onChange={handleChange} 
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="31. Writing & Editorial Prior Experience / Sample:" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={15} 
                      maxWords={200} 
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
                  <Section title="Section 9: Executive Leadership Role">
                    <RadioGroup 
                      name="32. Confirm your target executive position:" 
                      options={["Vice President", "General Secretary"]} 
                      value={formData} 
                      onChange={handleChange} 
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="33. Why are you interested in taking an executive role in the Science Society?" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={20} 
                      maxWords={250} 
                      placeholder="Explain your vision, motivation, and reasons for stepping up to executive leadership..."
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="34. What do you think you can contribute to the society in this role?" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={20} 
                      maxWords={250} 
                      placeholder="Describe the tangible value, structure, or innovations you will bring..."
                      required 
                    />
                    <TextAreaWithWordCount 
                      name="36. Leadership & Management Prior Experience:" 
                      value={formData} 
                      onChange={handleChange} 
                      minWords={20} 
                      maxWords={250} 
                      placeholder="Describe previous leadership posts, society positions, or team management roles you have held..."
                      required 
                    />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 10: Submission */}
          <Section title="Section 10: Declaration & Submission">
            <RadioGroup 
              name="37. By submitting this application, I understand that selection into the Science Society Cabinet is based on merit, interview evaluation, and commitment to active participation." 
              options={["I Agree & Confirm", "I Do Not Agree"]} 
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

function TextAreaWithWordCount({ 
  name, 
  value, 
  onChange, 
  required, 
  minWords = 15, 
  maxWords = 200, 
  placeholder 
}: any) {
  const text = value[name] || '';
  const wordCount = countWords(text);
  
  const isTooShort = text.trim().length > 0 && wordCount < minWords;
  const isTooLong = wordCount > maxWords;
  const isValid = wordCount >= minWords && wordCount <= maxWords;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <label className="block text-[15px] font-medium text-slate-800">
          {name} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-xs font-medium">
          {text.trim().length === 0 ? (
            <span className="text-slate-400 font-medium">Limit: {minWords}–{maxWords} words</span>
          ) : isTooShort ? (
            <span className="text-amber-600 font-semibold">{wordCount} / {minWords} min ({minWords - wordCount} more words needed)</span>
          ) : isTooLong ? (
            <span className="text-red-600 font-semibold">{wordCount} / {maxWords} max (Exceeded by {wordCount - maxWords})</span>
          ) : (
            <span className="text-emerald-600 font-semibold">✓ {wordCount} words (Valid length)</span>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        rows={4}
        className={clsx(
          "w-full px-4 py-3 rounded-xl border bg-white/70 focus:bg-white outline-none transition-all resize-y text-sm",
          isTooLong 
            ? "border-red-400 focus:ring-2 focus:ring-red-200" 
            : isValid 
            ? "border-emerald-300 focus:ring-2 focus:ring-emerald-100" 
            : "border-slate-200 focus:ring-2 focus:ring-[#0056A8]/20 focus:border-[#0056A8]"
        )}
        placeholder={placeholder || `Write your response here (between ${minWords} and ${maxWords} words)...`}
      />
      <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
        <span>Minimum: {minWords} words</span>
        <span>Maximum: {maxWords} words</span>
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
