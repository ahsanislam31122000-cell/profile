import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Profile } from '../../types/index.ts';
import { Mail, MessageCircle, Github, Linkedin, Twitter, Dribbble } from 'lucide-react';
import { formatWhatsAppUrl } from '../../utils/validation.ts';

interface AboutSectionProps {
  profile: Profile;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const { l, t } = useLanguage();

  return (
    <section id="about" className="py-24 bg-zinc-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Profile Photo / Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-sm sm:max-w-md">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 p-2 shadow-2xl">
                <img
                  src={profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                  alt={profile.displayName}
                  className="w-full aspect-[4/5] object-cover rounded-xl"
                  loading="lazy"
                />

                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold text-white">{profile.displayName}</h3>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    {l(profile.headline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Biography & Skills */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-4">
              {t('About Me', 'আমার সম্পর্কে')}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
              {l(profile.headline)}
            </h2>

            <p className="text-base text-zinc-300 leading-relaxed mb-8">
              {l(profile.biography)}
            </p>

            {/* Core Competencies / Skills */}
            <div className="mb-10">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                {t('Core Capabilities & Stack', 'দক্ষতা ও টেকনোলজি')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-200 border border-zinc-800 hover:border-emerald-500/40 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social / Direct Contacts */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-zinc-800">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{profile.email}</span>
                </a>
              )}

              {profile.whatsapp && (
                <a
                  href={formatWhatsAppUrl(profile.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t('WhatsApp Chat', 'হোয়াটসঅ্যাপ চ্যাট')}</span>
                </a>
              )}

              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}

              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
