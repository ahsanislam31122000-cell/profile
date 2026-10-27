import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { SiteSettings, Profile } from '../../types/index.ts';
import { ArrowRight, Sparkles, FolderKanban, CheckCircle2, MessageCircle } from 'lucide-react';
import { formatWhatsAppUrl } from '../../utils/validation.ts';

interface HeroProps {
  settings: SiteSettings;
  profile: Profile;
  onExploreWork: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  profile,
  onExploreWork,
  onContactClick,
}) => {
  const { l, t } = useLanguage();

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background radial glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Availability Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ring-4 ring-emerald-500/20" />
            <span>{t('Available for new freelance & contract projects', 'নতুন ফ্রিল্যান্স ও প্রজেক্ট কাজের জন্য প্রস্তুত')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              {l(settings.heroHeadline, 'Crafting High-Impact Digital Products & Scalable Systems')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 font-normal max-w-2xl leading-relaxed mb-10">
            {l(
              settings.heroSubtitle,
              'Specialized in UI/UX Design, Modern Web Development, Persuasive Email Copywriting, and Intelligent AI Automation.'
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
            <button
              onClick={onContactClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>{l(settings.heroCtaPrimary, 'Start a Project')}</span>
              <ArrowRight className="w-4 h-4 text-zinc-950" />
            </button>

            <button
              onClick={onExploreWork}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-sm sm:text-base border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-zinc-400" />
              <span>{l(settings.heroCtaSecondary, 'Explore Portfolio')}</span>
            </button>

            {profile.whatsapp && (
              <a
                href={formatWhatsAppUrl(profile.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-medium text-sm border border-emerald-500/30 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-zinc-800/80 w-full max-w-3xl">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">6+</span>
              <span className="text-xs text-zinc-400 font-medium mt-1">{t('Years Experience', 'বছরের অভিজ্ঞতা')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">40+</span>
              <span className="text-xs text-zinc-400 font-medium mt-1">{t('Projects Delivered', 'সফল প্রজেক্ট')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.8%</span>
              <span className="text-xs text-zinc-400 font-medium mt-1">{t('Client Satisfaction', 'সন্তুষ্ট ক্লায়েন্ট')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">5</span>
              <span className="text-xs text-zinc-400 font-medium mt-1">{t('Core Disciplines', 'মূল সেবাসমূহ')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
