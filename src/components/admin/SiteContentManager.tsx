import React, { useState } from 'react';
import { SiteSettings } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Save, Globe, Sparkles, Layers, Search, CheckCircle2 } from 'lucide-react';

interface SiteContentManagerProps {
  settings: SiteSettings;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SiteContentManager: React.FC<SiteContentManagerProps> = ({
  settings,
  onRefresh,
  showToast,
}) => {
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save site settings.');

      showToast('Website content and SEO settings updated.');
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Website Content & Bilingual SEO Manager</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Edit hero copy, CTA buttons, work process workflow, footer copyright, and search engine metadata in both English and Bengali.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Hero Section Content */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Hero Headline, Subtitle & CTAs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Hero Headline (English)
              </label>
              <textarea
                rows={2}
                value={formData.heroHeadline.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroHeadline: { ...prev.heroHeadline, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                হিরো হেডলাইন (Bengali)
              </label>
              <textarea
                rows={2}
                value={formData.heroHeadline.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroHeadline: { ...prev.heroHeadline, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Hero Subtitle (English)
              </label>
              <textarea
                rows={2}
                value={formData.heroSubtitle.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroSubtitle: { ...prev.heroSubtitle, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                সাবটাইটেল (Bengali)
              </label>
              <textarea
                rows={2}
                value={formData.heroSubtitle.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroSubtitle: { ...prev.heroSubtitle, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary CTA Button (English & Bengali)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.heroCtaPrimary.en}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroCtaPrimary: { ...prev.heroCtaPrimary, en: e.target.value },
                    }))
                  }
                  placeholder="Start a Project"
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={formData.heroCtaPrimary.bn}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroCtaPrimary: { ...prev.heroCtaPrimary, bn: e.target.value },
                    }))
                  }
                  placeholder="প্রজেক্ট শুরু করুন"
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Secondary CTA Button (English & Bengali)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.heroCtaSecondary.en}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroCtaSecondary: { ...prev.heroCtaSecondary, en: e.target.value },
                    }))
                  }
                  placeholder="Explore Portfolio"
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={formData.heroCtaSecondary.bn}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroCtaSecondary: { ...prev.heroCtaSecondary, bn: e.target.value },
                    }))
                  }
                  placeholder="কাজের নমুনা দেখুন"
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Work Process Steps */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Work Process Steps (1 to 4)</span>
          </div>

          <div className="space-y-4">
            {formData.processSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <span className="text-xs font-extrabold text-emerald-400">Step {step.step || idx + 1}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={step.title.en}
                    onChange={(e) => {
                      const updated = [...formData.processSteps];
                      updated[idx].title.en = e.target.value;
                      setFormData((prev) => ({ ...prev, processSteps: updated }));
                    }}
                    placeholder="Step Title (EN)"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={step.title.bn}
                    onChange={(e) => {
                      const updated = [...formData.processSteps];
                      updated[idx].title.bn = e.target.value;
                      setFormData((prev) => ({ ...prev, processSteps: updated }));
                    }}
                    placeholder="ধাপের নাম (বাংলা)"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    value={step.description.en}
                    onChange={(e) => {
                      const updated = [...formData.processSteps];
                      updated[idx].description.en = e.target.value;
                      setFormData((prev) => ({ ...prev, processSteps: updated }));
                    }}
                    placeholder="Step Description (EN)"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={2}
                    value={step.description.bn}
                    onChange={(e) => {
                      const updated = [...formData.processSteps];
                      updated[idx].description.bn = e.target.value;
                      setFormData((prev) => ({ ...prev, processSteps: updated }));
                    }}
                    placeholder="ধাপের বিবরণ (বাংলা)"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SEO Meta & Footer Text */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Search className="w-4 h-4" />
            <span>SEO Meta Tags & Footer Copyright</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                SEO Title (English)
              </label>
              <input
                type="text"
                value={formData.seoTitle.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seoTitle: { ...prev.seoTitle, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                এসইও শিরোনাম (Bengali)
              </label>
              <input
                type="text"
                value={formData.seoTitle.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seoTitle: { ...prev.seoTitle, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                SEO Meta Description (English)
              </label>
              <textarea
                rows={2}
                value={formData.seoDescription.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seoDescription: { ...prev.seoDescription, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                মেটা ডিসক্রিপশন (Bengali)
              </label>
              <textarea
                rows={2}
                value={formData.seoDescription.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seoDescription: { ...prev.seoDescription, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Footer Copyright Text (English)
              </label>
              <input
                type="text"
                value={formData.footerText.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    footerText: { ...prev.footerText, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                ফুটার টেক্সট (Bengali)
              </label>
              <input
                type="text"
                value={formData.footerText.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    footerText: { ...prev.footerText, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Content...' : 'Save Website Content'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
