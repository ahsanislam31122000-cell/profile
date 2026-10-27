import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Profile } from '../../types/index.ts';
import { Mail, MessageCircle, Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { validateInquiryInput, formatWhatsAppUrl } from '../../utils/validation.ts';

interface ContactSectionProps {
  profile: Profile;
  preselectedService?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile,
  preselectedService = '',
}) => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'UI/UX Design',
    subject: '',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, service: preselectedService }));
    }
  }, [preselectedService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const validation = validateInquiryInput(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit inquiry.');
      }

      setSuccessMessage(
        data.message ||
          t(
            'Thank you for reaching out! Your message has been sent directly to Ahsan.',
            'আপনার বার্তার জন্য ধন্যবাদ! আহসান খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
          )
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        service: 'UI/UX Design',
        subject: '',
        message: '',
      });
      setFieldErrors({});
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t('Failed to deliver message. Please try again or reach out on WhatsApp.', 'বার্তা পাঠানো যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-4">
                {t("Let's Collaborate", 'যোগাযোগ করুন')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                {t('Have a Project in Mind?', 'একটি নতুন প্রজেক্ট শুরু করতে চান?')}
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed mb-8">
                {t(
                  'Whether you need a full redesign, a production-grade web application, automated AI workflows, or high-converting copy—send a note and let’s talk possibilities.',
                  'ওয়েবসাইট রিডিজাইন, ওয়েব অ্যাপ্লিকেশন, এআই অটোমেশন কিংবা কনভার্টিং কপি—আপনার প্রয়োজন জানান।'
                )}
              </p>

              {/* Direct Reach Out Cards */}
              <div className="space-y-4 mb-8">
                {profile.email && (
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">{t('Email Address', 'ইমেইল অ্যাড্রেস')}</span>
                      <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-white hover:text-emerald-400">
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile.whatsapp && (
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">{t('Direct WhatsApp', 'সরাসরি হোয়াটসঅ্যাপ')}</span>
                      <a
                        href={formatWhatsAppUrl(profile.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        {profile.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-3 text-xs text-zinc-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {t(
                  'Strict Privacy Guarantee: Your message is stored securely on the private backend and will never be published or shared.',
                  'গোপনীয়তার নিশ্চয়তা: আপনার তথ্য সুরক্ষিত থাকবে এবং কখনই পাবলিকলি প্রদর্শিত হবে না।'
                )}
              </span>
            </div>
          </div>

          {/* Form Right Column */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">
                {t('Send an Inquiry', 'মেসেজ পাঠান')}
              </h3>

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{successMessage}</p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      {t('Your Name *', 'আপনার নাম *')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('e.g. Alex Morgan', 'যেমন: তানভীর আহমেদ')}
                      className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                        fieldErrors.name
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-zinc-800 focus:border-emerald-500'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-rose-400 mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      {t('Your Email *', 'আপনার ইমেইল *')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@company.com"
                      className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-zinc-800 focus:border-emerald-500'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-rose-400 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Service */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      {t('Service of Interest', 'আগ্রহী সার্ভিস')}
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="UI/UX Design">{t('UI/UX Design', 'ইউআই/ইউএক্স ডিজাইন')}</option>
                      <option value="Website Design">{t('Website Design', 'ওয়েবসাইট ডিজাইন')}</option>
                      <option value="Website Development">{t('Website Development', 'ওয়েবসাইট ডেভেলপমেন্ট')}</option>
                      <option value="Email Copywriting">{t('Email Copywriting', 'ইমেইল কপিরাইটিং')}</option>
                      <option value="AI Automation">{t('AI Automation', 'এআই অটোমেশন')}</option>
                      <option value="Consulting / General">{t('Consulting / Other', 'পরামর্শ / অন্যান্য')}</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      {t('Subject / Timeline', 'বিষয় / সময়সীমা')}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t('e.g. SaaS Redesign Q4', 'যেমন: নতুন ই-কমার্স প্রজেক্ট')}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    {t('Project Details & Goals *', 'প্রজেক্ট বিবরণ ও লক্ষ্য *')}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t(
                      'Tell me about your product, your goals, and when you would like to kick off...',
                      'আপনার প্রজেক্টের লক্ষ্য এবং প্রত্যাশা বিস্তারিত লিখুন...'
                    )}
                    className={`w-full px-4 py-3 rounded-xl bg-zinc-950 border text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                      fieldErrors.message
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-zinc-800 focus:border-emerald-500'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{t('Sending Message...', 'পাঠানো হচ্ছে...')}</span>
                  ) : (
                    <>
                      <span>{t('Send Project Inquiry', 'বার্তা পাঠান')}</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
