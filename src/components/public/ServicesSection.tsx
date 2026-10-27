import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Service } from '../../types/index.ts';
import {
  Palette,
  Layout,
  Code,
  Mail,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
  onSelectService: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
}) => {
  const { l, t, language } = useLanguage();

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'palette':
        return <Palette className="w-6 h-6 text-emerald-400" />;
      case 'layout':
        return <Layout className="w-6 h-6 text-teal-400" />;
      case 'code':
        return <Code className="w-6 h-6 text-indigo-400" />;
      case 'mail':
        return <Mail className="w-6 h-6 text-amber-400" />;
      case 'bot':
        return <Bot className="w-6 h-6 text-purple-400" />;
      default:
        return <Layers className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-zinc-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('What I Offer', 'আমার সেবাসমূহ')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            {t('Specialized Digital Services', 'বিশেষজ্ঞ ডিজিটাল সেবা')}
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            {t(
              'End-to-end expertise spanning user interface design, modern web engineering, revenue-driven copy, and intelligent AI workflows.',
              'ইউআই/ইউএক্স ডিজাইন, আধুনিক ওয়েব ইঞ্জিনিয়ারিং, কনভার্সন কপিরাইটিং এবং বুদ্ধিমান এআই ওয়ার্কফ্লোতে পূর্ণাঙ্গ সেবা।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => {
            const titleEn = service.title?.en || '';
            const titleCurrent = l(service.title, 'Digital Service');
            const descCurrent = l(service.description);
            const features = (language === 'bn' && service.features?.bn?.length)
              ? service.features.bn
              : (service.features?.en || []);

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10"
              >
                <div>
                  {/* Service Icon */}
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(service.icon)}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {titleCurrent}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {descCurrent}
                  </p>

                  {/* Features List */}
                  {features.length > 0 && (
                    <ul className="space-y-2.5 mb-8">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Inquiry Trigger */}
                <button
                  onClick={() => onSelectService(titleEn)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 text-xs font-semibold transition-all duration-200 group-hover:bg-emerald-500 group-hover:text-zinc-950 cursor-pointer"
                >
                  <span>{t('Inquire About This Service', 'এই সেবা সম্পর্কে জানুন')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
