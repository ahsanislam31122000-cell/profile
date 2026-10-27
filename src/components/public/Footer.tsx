import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Profile, SiteSettings } from '../../types/index.ts';
import { Shield, Globe, ArrowUp } from 'lucide-react';

interface FooterProps {
  profile: Profile;
  settings: SiteSettings;
  onNavigateToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  settings,
  onNavigateToAdmin,
}) => {
  const { l, t, toggleLanguage, language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-900">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
              AI
            </div>
            <span className="font-bold text-white text-base">
              {profile.displayName || 'Ahsan Islam'}
            </span>
          </div>

          {/* Quick links & language */}
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Language: {language === 'en' ? 'English' : 'বাংলা'}</span>
            </button>

            <button
              onClick={onNavigateToAdmin}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-500 hover:text-emerald-400" />
              <span>{t('Admin Studio Portal', 'অ্যাডমিন স্টুডিও')}</span>
            </button>
          </div>

          {/* Scroll to top */}
          <button
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>{l(settings.footerText, `© 2026 ${profile.displayName}. All rights reserved.`)}</p>
          <div className="flex items-center gap-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('Built with React, Express & PostgreSQL Ready', 'রিঅ্যাক্ট ও এক্সপ্রেস ভিত্তিক সুরক্ষিত প্ল্যাটফর্ম')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
