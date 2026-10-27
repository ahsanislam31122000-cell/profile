import React, { useState } from 'react';
import { Service } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileEdit,
  CheckCircle2,
  Palette,
  Layout,
  Code,
  Mail,
  Bot,
  Layers,
  X,
  AlertTriangle,
} from 'lucide-react';

interface ServicesManagerProps {
  services: Service[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  services,
  onRefresh,
  showToast,
}) => {
  const { authFetch } = useAuth();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Service>>({
    title: { en: '', bn: '' },
    description: { en: '', bn: '' },
    features: { en: [], bn: [] },
    icon: 'Code',
    isPublished: true,
  });

  const [featureEnInput, setFeatureEnInput] = useState('');
  const [featureBnInput, setFeatureBnInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getIconPreview = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'palette':
        return <Palette className="w-5 h-5 text-emerald-400" />;
      case 'layout':
        return <Layout className="w-5 h-5 text-teal-400" />;
      case 'code':
        return <Code className="w-5 h-5 text-indigo-400" />;
      case 'mail':
        return <Mail className="w-5 h-5 text-amber-400" />;
      case 'bot':
        return <Bot className="w-5 h-5 text-purple-400" />;
      default:
        return <Layers className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      title: { en: '', bn: '' },
      description: { en: '', bn: '' },
      features: { en: [], bn: [] },
      icon: 'Code',
      isPublished: true,
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setFormData({ ...srv });
    setIsEditorOpen(true);
  };

  // Reordering: Move up / down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= services.length) return;

    const copy = [...services];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    try {
      const res = await authFetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: copy }),
      });
      if (!res.ok) throw new Error('Failed to update service order.');
      showToast('Service order updated.');
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error reordering.', 'error');
    }
  };

  // Add Feature
  const handleAddFeature = () => {
    if (!featureEnInput.trim() && !featureBnInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: {
        en: [...(prev.features?.en || []), featureEnInput.trim() || featureBnInput.trim()],
        bn: [...(prev.features?.bn || []), featureBnInput.trim() || featureEnInput.trim()],
      },
    }));
    setFeatureEnInput('');
    setFeatureBnInput('');
  };

  // Remove Feature
  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        en: (prev.features?.en || []).filter((_, i) => i !== idx),
        bn: (prev.features?.bn || []).filter((_, i) => i !== idx),
      },
    }));
  };

  // Save Service
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.en) {
      showToast('English title is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingService) {
        // Update within array
        const updatedList = services.map((s) =>
          s.id === editingService.id ? ({ ...s, ...formData } as Service) : s
        );
        const res = await authFetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services: updatedList }),
        });
        if (!res.ok) throw new Error('Failed to save service.');
        showToast('Service updated successfully.');
      } else {
        // Create new
        const res = await authFetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create service.');
        showToast('New service added successfully.');
      }
      setIsEditorOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save service.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Service
  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      const res = await authFetch(`/api/admin/services/${serviceToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove service.');
      showToast('Service removed.');
      setServiceToDelete(null);
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error removing service.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Digital Services Manager</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage titles, descriptions, and feature lists in English and Bengali. Reorder cards for the public portfolio.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((srv, idx) => (
          <div
            key={srv.id}
            className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === services.length - 1}
                  className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                {getIconPreview(srv.icon)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{srv.title.en}</h3>
                  <span className="text-xs text-zinc-400">({srv.title.bn})</span>
                  {srv.isPublished ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-xl">
                  {srv.description.en}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500">
                  <span>{(srv.features.en || []).length} features listed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleOpenEdit(srv)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setServiceToDelete(srv)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SERVICE EDIT / CREATE MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {editingService ? 'Edit Service Card' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Icon & Published status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Icon Selector
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Palette">Palette (UI/UX)</option>
                    <option value="Layout">Layout (Website Design)</option>
                    <option value="Code">Code (Web Development)</option>
                    <option value="Mail">Mail (Email Copywriting)</option>
                    <option value="Bot">Bot (AI Automation)</option>
                    <option value="Layers">Layers (General)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isPublished)}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))
                      }
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-white">Publish this service live</span>
                  </label>
                </div>
              </div>

              {/* Titles (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Service Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: { ...prev.title!, en: e.target.value },
                      }))
                    }
                    placeholder="e.g. Website Development"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    সার্ভিস শিরোনাম (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.title?.bn || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: { ...prev.title!, bn: e.target.value },
                      }))
                    }
                    placeholder="যেমন: ওয়েবসাইট ডেভেলপমেন্ট"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Descriptions (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description!, en: e.target.value },
                      }))
                    }
                    placeholder="Detailed description of what this service offers..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    বিবরণ (Bengali)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description?.bn || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description!, bn: e.target.value },
                      }))
                    }
                    placeholder="সার্ভিস সংক্রান্ত বিস্তারিত বাংলা বিবরণ..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Features List Manager */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Feature Bullet Points (Bilingual)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={featureEnInput}
                    onChange={(e) => setFeatureEnInput(e.target.value)}
                    placeholder="Feature in English (e.g. Next.js Architecture)"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={featureBnInput}
                    onChange={(e) => setFeatureBnInput(e.target.value)}
                    placeholder="বাংলা বৈশিষ্ট্য (যেমন: দ্রুতগতির আর্কিটেকচার)"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                >
                  Add Feature Point
                </button>

                <div className="space-y-1.5 mt-2">
                  {(formData.features?.en || []).map((featEn, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{featEn}</span>
                        {formData.features?.bn?.[idx] && (
                          <span className="text-zinc-500">({formData.features.bn[idx]})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-zinc-500 hover:text-rose-400 px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingService ? 'Save Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Remove Service</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Are you sure you want to delete the service{' '}
              <strong className="text-white">"{serviceToDelete.title.en}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
