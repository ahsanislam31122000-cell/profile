import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ProcessStep } from '../../types/index.ts';

interface ProcessSectionProps {
  steps: ProcessStep[];
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ steps }) => {
  const { l, t } = useLanguage();

  return (
    <section id="process" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('How I Work', 'কাজের ধারাবাহিক প্রক্রিয়া')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            {t('A Proven, Collaborative Process', 'পরিকল্পিত ও সফল কর্মপদ্ধতি')}
          </h2>
          <p className="text-base text-zinc-400">
            {t(
              'From first conversation to deployment and continuous growth, every milestone is designed for transparency and speed.',
              'শুরুর আলোচনা থেকে বাস্তবায়ন পর্যন্ত প্রতিটি ধাপ স্বচ্ছতা ও দ্রুততার সাথে পরিচালিত হয়।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((stepItem, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 text-emerald-400 font-extrabold flex items-center justify-center text-base">
                    0{stepItem.step || index + 1}
                  </span>
                  <div className="w-8 h-[1px] bg-zinc-800" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {l(stepItem.title)}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {l(stepItem.description)}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider">
                <span>{t('Milestone Complete', 'পর্যায় সম্পন্ন')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
