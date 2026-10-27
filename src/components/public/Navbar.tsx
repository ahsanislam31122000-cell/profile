import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Globe, Shield, Menu, X, ArrowRight, MessageSquareCode } from 'lucide-react';

interface NavbarProps {
  onNavigateToAdmin: () => void;
  whatsappUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToAdmin, whatsappUrl }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('hero');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 text-lg">
                  AI
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-zinc-100 tracking-tight text-base sm:text-lg group-hover:text-emerald-400 transition-colors">
                Ahsan Islam
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400">
                {t('Design & Automation', 'ডিজাইন ও অটোমেশন')}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollTo('services')}
              className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-900/60"
            >
              {t('Services', 'সার্ভিসসমূহ')}
            </button>
            <button
              onClick={() => scrollTo('work')}
              className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-900/60"
            >
              {t('Work', 'প্রজেক্ট')}
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-900/60"
            >
              {t('About', 'পরিচিতি')}
            </button>
            <button
              onClick={() => scrollTo('process')}
              className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-900/60"
            >
              {t('Process', 'কাজের ধাপ')}
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors rounded-lg hover:bg-zinc-900/60"
            >
              {t('Contact', 'যোগাযোগ')}
            </button>
          </div>

          {/* Action Tools: Language, Admin entry, and Start Project CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all"
              title="Toggle language / ভাষা পরিবর্তন করুন"
              aria-label="Toggle language between English and Bengali"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Admin Entry Link */}
            <button
              onClick={onNavigateToAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isAuthenticated
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Enter Admin Studio"
              aria-label="Admin Studio Portal"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAuthenticated ? t('Admin Studio (Active)', 'অ্যাডমিন স্টুডিও') : t('Admin', 'অ্যাডমিন')}</span>
            </button>

            {/* Hire / Contact Button */}
            <button
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200"
            >
              <span>{t('Hire Me', 'হায়ার করুন')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-xs font-bold rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 pb-4 px-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl space-y-2 shadow-2xl">
            <button
              onClick={() => scrollTo('services')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/60 rounded-lg"
            >
              {t('Services', 'সার্ভিসসমূহ')}
            </button>
            <button
              onClick={() => scrollTo('work')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/60 rounded-lg"
            >
              {t('Work', 'প্রজেক্ট')}
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/60 rounded-lg"
            >
              {t('About', 'পরিচিতি')}
            </button>
            <button
              onClick={() => scrollTo('process')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/60 rounded-lg"
            >
              {t('Process', 'কাজের ধাপ')}
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/60 rounded-lg"
            >
              {t('Contact', 'যোগাযোগ')}
            </button>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToAdmin();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('Admin Studio', 'অ্যাডমিন স্টুডিও')}</span>
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-zinc-950"
              >
                <span>{t('Get in Touch', 'যোগাযোগ করুন')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
