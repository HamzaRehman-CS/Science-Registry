import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
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

  const selectedTeam = formData['21. Which team are you registering for?'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('applications')
        .insert([
          {
            applicant_name: formData['1. Your full name'],
            registration_number: formData['4. Registration Number'],
            department: formData['6. Department + Program'],
            semester: formData['5. Semester'],
            applied_position: selectedTeam,
            answers: formData
          }
        ]);

      if (dbError) throw dbError;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
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
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Application Received!</h2>
          <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
            Thank you for applying to the PAF-IAST Science Society Cabinet 2026–27. 
            Shortlisted applicants will be contacted for an interview.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 rounded-xl bg-[#0056A8] text-white font-medium hover:bg-[#0056A8]/90 transition-colors shadow-sm"
          >
            Submit another application
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
            {/* University Logo */}
            <div className="flex items-center">
              <img 
                src="/paf_iast_logo.png" 
                alt="PAF-IAST University Logo" 
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm" 
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-14 w-px bg-slate-200"></div>

            {/* Science Society Logo */}
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
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#0056A8] shrink-0"></span>
              <span className="font-medium">Fill out the form carefully. Shortlisted applicants will be contacted for an interview.</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 shadow-sm border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Section title="Section 1: Personal Details">
            <TextInput name="1. Your full name" value={formData} onChange={handleChange} required />
            <TextInput name="2. Email address" type="email" value={formData} onChange={handleChange} required />
            <TextInput name="3. Phone number" type="tel" value={formData} onChange={handleChange} required />
            <TextInput name="4. Registration Number" value={formData} onChange={handleChange} required />
            <TextInput name="5. Semester" value={formData} onChange={handleChange} required />
            <TextInput name="6. Department + Program" value={formData} onChange={handleChange} required />
            <RadioGroup name="7. What gender do you identify as?" options={["Female", "Male"]} value={formData} onChange={handleChange} required />
            <TextInput name="8. Date of birth" type="date" value={formData} onChange={handleChange} required />
          </Section>

          <Section title="Section 2: Application">
            <TextInput name="9. Why do you want to join the PAF-IAST Science Society?" value={formData} onChange={handleChange} required />
            <TextInput name="10. What is your biggest motivation to join the society?" value={formData} onChange={handleChange} required />
            <RadioGroup name="11. Would you be able to participate competitions/tournaments?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
            <RadioGroup name="12. Would you be able to travel for group events?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
            <RadioGroup name="13. Are you willing to attend meetings, participate in events, and complete assigned tasks within the given deadlines?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
            <RadioGroup name="14. Are you currently a member of any other university society/organization?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
            <TextInput name="15. If yes: Which society/organization and what is your role?" value={formData} onChange={handleChange} />
            <TextInput name="16. Is there anything else you'd like us to know about you?" value={formData} onChange={handleChange} required />
          </Section>

          <Section title="Section 3: Teams">
            <TextInput name="17. Do you have any previous experience related to the position/team you're applying for?" value={formData} onChange={handleChange} required />
            <TextInput name="18. Please share details if you've received any awards or certificates for this." value={formData} onChange={handleChange} />
            <RadioGroup name="19. What is your skill level of it?" options={["Beginner", "Intermediate", "Expert", "Advanced", "Novice"]} value={formData} onChange={handleChange} required />
            <TextInput name="20. What is your second-choice team?" value={formData} onChange={handleChange} required />
            <RadioGroup name="21. Which team are you registering for?" options={TEAMS} value={formData} onChange={handleChange} required />
          </Section>

          <AnimatePresence mode="popLayout">
            {selectedTeam === "Event Management" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Section 4: Event Management Team">
                    <CheckboxGroup name="22. Which aspects of event management interest you?" options={["Planning", "Logistics", "Coordination", "Crowd/participant management", "Stage/program management", "Event execution", "Team coordination"]} value={formData} onChange={handleCheckboxChange} required />
                    <RadioGroup name="23. Have you helped organize an event before?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Decor & Arts" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Section 5: Decor & Arts Team">
                    <CheckboxGroup name="24. What skills are you do you have?" options={["Arts & crafts", "Handmade decorations", "Stall decoration", "Props", "Backdrops", "Banners/sign boards physically", "Event venue setup", "Themed displays", "Tables/booths", "Creative installations", "Other"]} value={formData} onChange={handleCheckboxChange} required />
                    <TextInput name="25. Please share a link to your previous work/portfolio, if available." value={formData} onChange={handleChange} />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Media & Content" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Section 6: Media Team">
                    <CheckboxGroup name="26. What tools/software are you comfortable using?" options={["Canva", "Photoshop", "Illustrator", "CapCut", "Figma", "Photography", "Videography", "Graphic design", "Reels", "Social media", "Digital posters/carousels", "Event coverage", "Other"]} value={formData} onChange={handleCheckboxChange} required />
                    <TextInput name="27. Portfolio/social media link:" value={formData} onChange={handleChange} />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Public Relations (PR)" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Section 7: Public Relations Team">
                    <CheckboxGroup name="28. Which areas are you comfortable with?" options={["Communication", "Public speaking", "Outreach", "Contacting organizations/societies", "Social media communication", "Networking", "Other"]} value={formData} onChange={handleCheckboxChange} required />
                  </Section>
                </div>
              </motion.div>
            )}

            {selectedTeam === "Content & Editorial" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Section 8: Content & Editorial Team">
                    <CheckboxGroup name="29. Which areas of editorial work interest you?" options={["Science & research news", "University/local news & updates", "Articles & write-ups", "Newsletters", "Research summaries", "Event reports", "Other"]} value={formData} onChange={handleCheckboxChange} required />
                    <RadioGroup name="30. Have you written articles, reports, newsletters, or similar content before?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
                    <RadioGroup name="31. What type of writing are you most comfortable with?" options={["Informative", "Formal/academic", "Creative", "Social media", "Willing to learn", "Other"]} value={formData} onChange={handleChange} required />
                  </Section>
                </div>
              </motion.div>
            )}

            {(selectedTeam === "General Secretary" || selectedTeam === "Vice President ( male )") && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="py-2">
                  <Section title="Section 9: Executive VP / General Secretary">
                    <RadioGroup name="32. Which position are you applying for?" options={["Vice President", "General Secretary"]} value={formData} onChange={handleChange} required />
                    <TextArea name="33. Why are you interested in taking an executive role in the Science Society?" value={formData} onChange={handleChange} required />
                    <TextArea name="34. What do you think you can contribute to the society in this role?" value={formData} onChange={handleChange} required />
                    <RadioGroup name="35. Have you previously held a leadership/management position?" options={["Yes", "No"]} value={formData} onChange={handleChange} required />
                  </Section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Section title="Section 10: Submission">
            <RadioGroup 
              name="36. By submitting this application, I understand that selection into the Science Society Cabinet is based on the recruitment process and that selected members are expected to actively participate in society activities and fulfill their assigned responsibilities." 
              options={["yes", "no"]} 
              value={formData} 
              onChange={handleChange} 
              required 
            />
          </Section>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white rounded-xl font-semibold shadow-lg shadow-brand-blue/30 hover:bg-brand-blue/90 hover:shadow-brand-blue/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 text-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
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
      className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm"
    >
      <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{title}</h3>
      <div className="space-y-8">
        {children}
      </div>
    </motion.div>
  );
}

function TextInput({ name, type = "text", value, onChange, required }: any) {
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
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
        placeholder="Your answer"
      />
    </div>
  );
}

function TextArea({ name, value, onChange, required }: any) {
  return (
    <div>
      <label className="block text-[15px] font-medium text-slate-800 mb-2">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all resize-y"
        placeholder="Your answer"
      />
    </div>
  );
}

function RadioGroup({ name, options, value, onChange, required }: any) {
  return (
    <div>
      <label className="block text-[15px] font-medium text-slate-800 mb-3">
        {name} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-3">
        {options.map((opt: string) => (
          <label key={opt} className={clsx(
            "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
            value[name] === opt ? "border-brand-blue bg-brand-blue/5" : "border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300"
          )}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value[name] === opt}
              onChange={() => onChange(name, opt)}
              required={required}
              className="w-5 h-5 text-brand-blue border-slate-300 focus:ring-brand-blue"
            />
            <span className="ml-3 text-slate-700">{opt}</span>
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
      <div className="space-y-3">
        {options.map((opt: string) => {
          const isChecked = selected.includes(opt);
          return (
            <label key={opt} className={clsx(
              "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
              isChecked ? "border-brand-blue bg-brand-blue/5" : "border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300"
            )}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onChange(name, opt, e.target.checked)}
                className="w-5 h-5 text-brand-blue border-slate-300 rounded focus:ring-brand-blue"
              />
              <span className="ml-3 text-slate-700">{opt}</span>
            </label>
          );
        })}
      </div>
      {/* Hidden input to handle required validation for checkbox group loosely */}
      {required && selected.length === 0 && (
        <input type="text" className="opacity-0 w-0 h-0 p-0 m-0 absolute" required />
      )}
    </div>
  );
}
