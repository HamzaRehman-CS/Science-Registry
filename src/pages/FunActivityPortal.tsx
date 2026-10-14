import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices, 
  Send, 
  AlertCircle
} from 'lucide-react';
import { submitAnonymousComment } from '../lib/comments';
import { 
  TeaCatSticker, 
  PopcornDramaSticker 
} from '../components/CoolMascots';

// Relatable university & society situations (genuine student life, no stereotypes)
const RELATABLE_PROMPTS = [
  "Who says 'slides tayyar hain' but actually starts making them 10 minutes before the event?",
  "Who takes 5 business days to reply in the society WhatsApp group but is active on Instagram 24/7?",
  "Who joins the meeting for 2 minutes just to mark attendance and immediately disappears?",
  "Who volunteers for every single task in the meeting and then does absolutely nothing?",
  "Who gives strict orders during event setup like a general while doing zero physical work?",
  "Who takes full credit on LinkedIn for an event they only showed up to for pictures?",
  "Who threatens to resign from the cabinet every semester but never actually leaves?",
  "Who writes 500-word paragraphs in the WhatsApp group that everyone leaves on read?",
  "Who is always 'busy on an urgent call' whenever it's time to manage the registration desk?",
  "Who is the silent worker actually carrying the whole team while others pose for photos?",
  "Who argues for 45 minutes over the font style of the event banner?",
  "Who demands an executive certificate after attending just one orientation meeting?"
];

export default function FunActivityPortal() {
  const [targetName, setTargetName] = useState('');
  const [comment, setComment] = useState('');
  const [unfitNominee, setUnfitNominee] = useState('');
  const [ideaIndex, setIdeaIndex] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedName, setLastSubmittedName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // When clicked, old suggestion is replaced with a new suggestion
  const handleRandomPrompt = () => {
    const nextIndex = (ideaIndex + 1) % RELATABLE_PROMPTS.length;
    setIdeaIndex(nextIndex);
    setComment(RELATABLE_PROMPTS[nextIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) {
      setError("Please specify the person or position this comment is about!");
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError("Please write at least a few words (minimum 5 characters)!");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await submitAnonymousComment({
      target_name: targetName,
      comment: comment,
      unfit_nominee: unfitNominee,
    });

    setSubmitting(false);

    if (result.success) {
      setLastSubmittedName(targetName.trim());
      setSubmitted(true);
      setTargetName('');
      setComment('');
      setUnfitNominee('');
    } else {
      setError(result.error || "Failed to submit comment. Please check your connection!");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-comic-dots text-slate-900 flex flex-col justify-between selection:bg-[#0056A8] selection:text-white relative overflow-x-hidden">
      
      {/* Top Header: University Logo (Left) | Fun Activity Center | Society Logo (Right) */}
      <header className="w-full bg-white border-b-3 border-slate-900 sticky top-0 z-40 py-2.5 sm:py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: University Logo */}
          <div className="flex items-center">
            <img 
              src="/paf_iast_logo.png" 
              alt="PAF-IAST University Logo" 
              className="h-10 sm:h-13 w-auto object-contain hover:rotate-[-2deg] transition-transform" 
            />
          </div>

          {/* Center: Fun Activity (Clean - No star icon, No science tube bottle) */}
          <div className="text-center px-2">
            <div className="inline-flex items-center px-3.5 py-0.5 bg-amber-300 text-slate-900 border-2 border-slate-900 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wider comic-shadow-sm mb-1">
              <span>Fun Activity 2026</span>
            </div>
            <h2 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 tracking-tight block">
              Science Society Roast & Confession Vault
            </h2>
          </div>

          {/* Right: Society Logo */}
          <div className="flex items-center justify-end">
            <img 
              src="/science_society_logo.png" 
              alt="Science Society Logo" 
              className="h-10 sm:h-13 w-auto object-contain hover:rotate-[2deg] transition-transform" 
            />
          </div>
        </div>
      </header>

      {/* Main Content Area with balanced side characters */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-10 flex-grow relative z-20 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 xl:gap-10">
        
        {/* Left Sidekick Mascot (Desktop) - Fills the space nicely */}
        <aside className="hidden lg:flex flex-col items-center w-52 shrink-0 pt-16 sticky top-28">
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-3 bg-white p-3 rounded-2xl border-2 border-slate-900 comic-shadow-sm text-xs font-bold text-slate-800 leading-snug max-w-[190px]">
              "Drop your honest take... nobody will ever know it was you!"
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-900 rotate-45"></div>
            </div>
            <TeaCatSticker className="w-32 h-32 drop-shadow-md hover:scale-105 transition-transform" />
            <div className="mt-3 px-3 py-1 bg-amber-200 border-2 border-slate-900 rounded-xl text-[11px] font-black text-slate-900 uppercase comic-shadow-sm">
              100% Anonymous
            </div>
          </motion.div>
        </aside>

        {/* Center Main Form Container */}
        <div className="w-full max-w-xl">
          {/* Streamlined Clean Heading (No excess badges, No extra paragraphs) */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The Roast & Toast Desk
            </h1>
          </div>

          {/* Success Modal / State */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="bg-white rounded-3xl border-3 border-slate-900 comic-shadow-lg p-7 sm:p-10 text-center relative overflow-hidden"
              >
                <div className="flex justify-center mb-4">
                  <PopcornDramaSticker className="w-28 h-28 drop-shadow-sm" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                  Whisper Slipped into the Vault!
                </h2>

                <p className="text-slate-700 text-sm sm:text-base font-medium max-w-md mx-auto mb-6 leading-relaxed">
                  Your anonymous message about <span className="font-extrabold text-[#0056A8] bg-sky-100 px-2 py-0.5 rounded-md border border-sky-300">"{lastSubmittedName}"</span> has been recorded.
                </p>

                <div className="p-3.5 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl mb-7 max-w-md mx-auto text-xs text-amber-900 font-bold">
                  The admin is reviewing all submissions with great interest.
                </div>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0056A8] hover:bg-[#004282] text-white font-black text-sm sm:text-base rounded-2xl comic-btn flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Another Comment</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border-3 border-slate-900 comic-shadow-lg p-5 sm:p-8 space-y-5 sm:space-y-6 relative"
              >
                {error && (
                  <div className="p-3.5 rounded-2xl bg-red-100 border-2 border-red-500 text-red-900 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}

                {/* Field 1: Target Person / Position (NO specific names like Hamza, Ali, Ayesha) */}
                <div className="space-y-1.5">
                  <label className="block text-sm sm:text-base font-black text-slate-900">
                    1. Who is this comment about? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 font-medium">
                    Name any person / position
                  </p>
                  <input
                    type="text"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    required
                    placeholder="Name any person / position"
                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl comic-input text-slate-900 font-semibold text-sm sm:text-base placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                {/* Field 2: The Comment / Roast / Confession */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm sm:text-base font-black text-slate-900">
                      2. Drop your comment, roast, or confession <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRandomPrompt}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-amber-300 hover:bg-amber-400 px-3 py-1.5 rounded-xl border-2 border-slate-900 comic-shadow-sm transition-all cursor-pointer"
                      title="Click to get an idea or cycle to a new one"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Get Idea</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Write your thoughts, honest feedback, or fun observations
                  </p>

                  <div className="relative">
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      placeholder="Write your comment here..."
                      className="w-full p-4 bg-slate-50 rounded-2xl comic-input text-slate-900 font-medium text-sm sm:text-base leading-relaxed resize-none placeholder:text-slate-400"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-1 px-1">
                      <span>Click 'Get Idea' to cycle fresh suggestions</span>
                      <span>{comment.length} / 1000</span>
                    </div>
                  </div>
                </div>

                {/* Field 3: Who do you think is unfit for their position? */}
                <div className="space-y-1.5 p-4 sm:p-5 bg-rose-50/70 border-2 border-rose-300 rounded-2xl relative">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                      Hot Take
                    </span>
                    <span className="text-xs font-extrabold text-rose-900">Society Feedback</span>
                  </div>

                  <label className="block text-sm sm:text-base font-black text-slate-900">
                    3. Who do you think is unfit for their position?
                  </label>
                  
                  <p className="text-xs text-slate-600 font-medium">
                    Tell us who and why in a constructive or funny way
                  </p>

                  <textarea
                    rows={2}
                    value={unfitNominee}
                    onChange={(e) => setUnfitNominee(e.target.value)}
                    placeholder="Specify the person / position and your reason..."
                    className="w-full p-3 bg-white rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-medium text-xs sm:text-sm placeholder:text-slate-400 resize-none shadow-xs"
                    maxLength={500}
                  />
                </div>

                {/* Submit Button (Clean - No shh or random emojis) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#0056A8] hover:bg-[#004282] text-white font-black text-base sm:text-lg comic-btn flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Anonymously</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simple Anonymity Guarantee */}
                <div className="pt-1 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>100% Anonymous • No account or personal data collected</span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidekick Mascot (Desktop) - Fills the right space lively */}
        <aside className="hidden lg:flex flex-col items-center w-52 shrink-0 pt-20 sticky top-28">
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-3 bg-white p-3 rounded-2xl border-2 border-slate-900 comic-shadow-sm text-xs font-bold text-slate-800 leading-snug max-w-[190px]">
              "Admin has front row seats for this submission."
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-900 rotate-45"></div>
            </div>
            <PopcornDramaSticker className="w-32 h-32 drop-shadow-md hover:scale-105 transition-transform" />
            <div className="mt-3 px-3 py-1 bg-rose-200 border-2 border-slate-900 rounded-xl text-[11px] font-black text-slate-900 uppercase comic-shadow-sm">
              Unfiltered Takes
            </div>
          </motion.div>
        </aside>

      </main>

      {/* Clean Footer (No Admin Button) */}
      <footer className="w-full border-t-2 border-slate-900 bg-white py-4 text-center text-xs text-slate-600 font-semibold">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 PAF-IAST Science Society • All Rights Reserved</p>
          <p className="text-slate-500 text-[11px]">Fun Society Activity Portal</p>
        </div>
      </footer>
    </div>
  );
}
