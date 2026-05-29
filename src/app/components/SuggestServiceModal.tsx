import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { saveSuggestion, checkRecentDuplicate } from '../data/suggestions';

const SUGGESTION_TAGS = [
  { value: 'strength.grammar_explanation',  label: 'Grammar'            },
  { value: 'strength.pronunciation',        label: 'Pronunciation'      },
  { value: 'strength.vocabulary_volume',    label: 'Vocabulary'         },
  { value: 'strength.kpop_kdrama_context',  label: 'K-Pop / K-Drama'   },
  { value: 'strength.exam_focused',         label: 'TOPIK Prep'         },
  { value: 'social.live_class_option',      label: 'Live Classes'       },
  { value: 'ux.offline_available',          label: 'Offline Access'     },
  { value: 'format.flashcard',              label: 'Flashcards'         },
  { value: 'strength.real_life_phrases',    label: 'Real Phrases'       },
  { value: 'ux.gamification',               label: 'Gamification'       },
  { value: 'mechanism.scenario_based',      label: 'Real-life Scenarios'},
  { value: 'social.community_forum',        label: 'Community'          },
];

const CHIP_OFF = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]';
const CHIP_ON  = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent';
const CHIP_WARN = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#f59e0b] text-white border-transparent';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SuggestServiceModal({ open, onClose }: Props) {
  const [serviceName, setServiceName]           = useState('');
  const [serviceUrl, setServiceUrl]             = useState('');
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [customReason, setCustomReason]         = useState('');
  const [reporterEmail, setReporterEmail]       = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [nameError, setNameError]               = useState('');
  const [urlError, setUrlError]                 = useState('');
  const [emailError, setEmailError]             = useState('');

  if (!open) return null;

  const toggleStrength = (tag: string) => {
    if (selectedStrengths.includes(tag)) {
      setSelectedStrengths(prev => prev.filter(t => t !== tag));
    } else {
      if (selectedStrengths.length >= 3) {
        toast.info('Up to 3 strengths can be selected.');
        return;
      }
      setSelectedStrengths(prev => [...prev, tag]);
    }
  };

  const validate = () => {
    let valid = true;
    if (!serviceName.trim()) {
      setNameError('Please enter the service name.');
      valid = false;
    } else {
      setNameError('');
    }
    if (serviceUrl.trim() && !/^(https?:\/\/|www\.)/i.test(serviceUrl.trim())) {
      setUrlError('Please enter a valid URL (https:// or www.)');
      valid = false;
    } else {
      setUrlError('');
    }
    if (reporterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }
    return valid;
  };

  const resetForm = () => {
    setServiceName('');
    setServiceUrl('');
    setSelectedStrengths([]);
    setShowCustomReason(false);
    setCustomReason('');
    setReporterEmail('');
    setNameError('');
    setUrlError('');
    setEmailError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (checkRecentDuplicate(serviceName)) {
      toast.info("You just suggested this! Please wait 5 minutes before resubmitting.");
      return;
    }
    setSubmitting(true);
    try {
      await saveSuggestion({
        serviceName,
        serviceUrl: serviceUrl.trim() || undefined,
        recommendedStrengths: selectedStrengths,
        customReason: showCustomReason ? customReason : undefined,
        reporterEmail: reporterEmail.trim() || undefined,
      });
      toast.success("Thanks for the suggestion! We'll review it soon.");
      handleClose();
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full sm:max-w-[480px] bg-[#ffffff] dark:bg-[#151c27] sm:rounded-[20px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e2e8f0] dark:border-[#232a36] shrink-0">
          <div>
            <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3]">
              Suggest a Service
            </h2>
            <p className="text-[13px] text-[#64748b] dark:text-[#8a94a6] mt-0.5">
              Know a great resource that's not on NARSHA?
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors ml-4 mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Service name */}
            <div>
              <label className="block text-[13px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                Service Name <span className="text-[#0ea5e9]">*</span>
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={e => { setServiceName(e.target.value); if (nameError) setNameError(''); }}
                placeholder="e.g. Korean with Vinnie"
                className={`w-full bg-[#f8fafc] dark:bg-[#0c141f] border rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] ${nameError ? 'border-[#ef4444]' : 'border-[#e2e8f0] dark:border-[#232a36]'}`}
              />
              {nameError && <p className="mt-1 text-[12px] text-[#ef4444]">{nameError}</p>}
            </div>

            {/* URL */}
            <div>
              <label className="block text-[13px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                Website URL <span className="text-[#94a3b8] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={serviceUrl}
                onChange={e => { setServiceUrl(e.target.value); if (urlError) setUrlError(''); }}
                placeholder="https://..."
                className={`w-full bg-[#f8fafc] dark:bg-[#0c141f] border rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] ${urlError ? 'border-[#ef4444]' : 'border-[#e2e8f0] dark:border-[#232a36]'}`}
              />
              {urlError && <p className="mt-1 text-[12px] text-[#ef4444]">{urlError}</p>}
            </div>

            {/* Strength tags */}
            <div>
              <label className="block text-[13px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1">
                Why recommend it?{' '}
                <span className="text-[#94a3b8] font-normal">
                  (up to 3{selectedStrengths.length > 0 ? ` · ${selectedStrengths.length} selected` : ''})
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTION_TAGS.map(tag => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => { setShowCustomReason(false); toggleStrength(tag.value); }}
                    className={selectedStrengths.includes(tag.value) ? CHIP_ON : CHIP_OFF}
                  >
                    {tag.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setShowCustomReason(p => !p); setSelectedStrengths([]); }}
                  className={showCustomReason ? CHIP_WARN : CHIP_OFF}
                >
                  None of the above
                </button>
              </div>
              {showCustomReason && (
                <textarea
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  placeholder="Tell us why you'd recommend it..."
                  rows={2}
                  className="mt-2.5 w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] resize-none"
                />
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                Your Email{' '}
                <span className="text-[#94a3b8] font-normal">(optional — we'll reply if we add it)</span>
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={e => { setReporterEmail(e.target.value); if (emailError) setEmailError(''); }}
                placeholder="you@example.com"
                className={`w-full bg-[#f8fafc] dark:bg-[#0c141f] border rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] ${emailError ? 'border-[#ef4444]' : 'border-[#e2e8f0] dark:border-[#232a36]'}`}
              />
              {emailError && <p className="mt-1 text-[12px] text-[#ef4444]">{emailError}</p>}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e2e8f0] dark:border-[#232a36] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="text-[13px] text-[#64748b] dark:text-[#8a94a6] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[14px] px-5 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Suggestion'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
