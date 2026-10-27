import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Project, ProjectCategory } from '../../types/index.ts';
import {
  ExternalLink,
  Github,
  Sparkles,
  X,
  Layers,
  CheckCircle,
  Eye,
  Calendar,
  Wrench,
} from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
  isAdminPreview?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  isAdminPreview = false,
}) => {
  const { l, t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  const categories: { key: string; labelEn: string; labelBn: string }[] = [
    { key: 'all', labelEn: 'All Projects', labelBn: 'সকল প্রজেক্ট' },
    { key: 'ui-ux', labelEn: 'UI/UX Design', labelBn: 'ইউআই/ইউএক্স' },
    { key: 'website-design', labelEn: 'Website Design', labelBn: 'ওয়েবসাইট ডিজাইন' },
    { key: 'web-dev', labelEn: 'Web Development', labelBn: 'ওয়েব ডেভেলপমেন্ট' },
    { key: 'email-copywriting', labelEn: 'Email Copywriting', labelBn: 'ইমেইল কপিরাইটিং' },
    { key: 'ai-automation', labelEn: 'AI Automation', labelBn: 'এআই অটোমেশন' },
  ];

  const filteredProjects = projects.filter((project) => {
    if (selectedCategory === 'all') return true;
    return project.category === selectedCategory;
  });

  const getCategoryLabel = (cat: string) => {
    const match = categories.find((c) => c.key === cat);
    if (!match) return cat;
    return language === 'bn' ? match.labelBn : match.labelEn;
  };

  return (
    <section id="work" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-4">
              {t('Selected Works', 'বাছাইকৃত কাজ')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('Featured Case Studies', 'ফিচার্ড কেস স্টাডি')}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-xl">
              {t(
                'Explore real-world client implementations, interactive web applications, and proven concept prototypes.',
                'বাস্তব ক্লায়েন্ট প্রজেক্ট, ইন্টারেক্টিভ ওয়েব অ্যাপ্লিকেশন ও কনসেপ্ট প্রোটোটাইপ দেখুন।'
              )}
            </p>
          </div>

          {/* Admin Preview Watermark if in preview mode */}
          {isAdminPreview && (
            <div className="mt-4 md:mt-0 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{t('Admin Preview Active: Drafts Included', 'অ্যাডমিন প্রিভিউ মোড চালু')}</span>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {language === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/60">
            <p className="text-zinc-400 text-sm">
              {t('No projects found in this category.', 'এই ক্যাটাগরিতে কোনো প্রজেক্ট পাওয়া যায়নি।')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => {
              const title = l(project.title, 'Untitled Project');
              const shortDesc = l(project.shortDescription);

              return (
                <div
                  key={project.id}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-xl"
                >
                  {/* Cover Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                    <img
                      src={project.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

                    {/* Badges Top Bar */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        {getCategoryLabel(project.category)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Concept Project Badge */}
                        {project.isConcept && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{t('Concept', 'কনসেপ্ট')}</span>
                          </span>
                        )}

                        {/* Draft Status Badge (in Admin preview) */}
                        {!project.isPublished && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md">
                            {t('Draft (Unpublished)', 'ড্রাফট')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {title}
                      </h3>

                      <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
                        {shortDesc}
                      </p>

                      {/* Tools Tag Pills */}
                      {project.tools && project.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {project.tools.slice(0, 5).map((tool, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                            >
                              {tool}
                            </span>
                          ))}
                          {project.tools.length > 5 && (
                            <span className="px-2 py-1 rounded-md text-[11px] text-zinc-400">
                              +{project.tools.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/70">
                      <button
                        onClick={() => setActiveProjectModal(project)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <span>{t('Read Full Case Study', 'পুরো কেস স্টাডি পড়ুন')}</span>
                        <Layers className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        {project.sourceUrl && (
                          <a
                            href={project.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="View Source Code"
                            aria-label="View Source Code"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}

                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-colors"
                          >
                            <span>{t('Live Demo', 'ডেমো')}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Case Study Modal */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setActiveProjectModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Close Case Study"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {getCategoryLabel(activeProjectModal.category)}
                </span>
                {activeProjectModal.isConcept && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {t('Concept Project', 'কনসেপ্ট প্রজেক্ট')}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {l(activeProjectModal.title)}
              </h2>
            </div>

            {/* Cover Image in Modal */}
            <div className="rounded-xl overflow-hidden mb-8 aspect-video max-h-[420px] bg-zinc-950">
              <img
                src={activeProjectModal.coverImage}
                alt={l(activeProjectModal.title)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Challenge & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-xl bg-zinc-950/50 border border-zinc-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>{t('The Challenge', 'সমস্যা বা চ্যালেঞ্জ')}</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {l(activeProjectModal.challenge, 'Documenting the core business and user obstacle.')}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950/50 border border-zinc-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{t('The Solution', 'সমাধান ও বাস্তবায়ন')}</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {l(activeProjectModal.solution, 'Architected human-centered designs and performant systems.')}
                </p>
              </div>
            </div>

            {/* Full Case Study Article */}
            <div className="mb-8">
              <h4 className="text-base font-bold text-white mb-3">
                {t('Project Overview & Impact', 'প্রজেক্ট বিবরণ ও ফলাফল')}
              </h4>
              <div className="prose prose-invert max-w-none text-sm sm:text-base text-zinc-300 leading-relaxed space-y-4">
                <p>{l(activeProjectModal.fullCaseStudy)}</p>
              </div>
            </div>

            {/* Gallery Images */}
            {activeProjectModal.galleryImages && activeProjectModal.galleryImages.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  {t('Interface Gallery', 'ইন্টারফেস গ্যালারি')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeProjectModal.galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-800">
                      <img src={img} alt={`Gallery view ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Used */}
            {activeProjectModal.tools && activeProjectModal.tools.length > 0 && (
              <div className="mb-8 pt-6 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span>{t('Technologies & Design Tools', 'ব্যবহৃত টুলস ও টেকনোলজি')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeProjectModal.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/60"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-zinc-800">
              {activeProjectModal.demoUrl && (
                <a
                  href={activeProjectModal.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
                >
                  <span>{t('Visit Live Experience', 'লাইভ ভিজিট করুন')}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {activeProjectModal.sourceUrl && (
                <a
                  href={activeProjectModal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700"
                >
                  <Github className="w-4 h-4" />
                  <span>{t('View Repository', 'গিটহাব রেপোজিটরি')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
