import React, { useState } from 'react';
import { Project, ProjectCategory } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { slugify, isValidUrl, validateProjectInput } from '../../utils/validation.ts';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileEdit,
  Trash2,
  ExternalLink,
  Github,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  X,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface ProjectsManagerProps {
  projects: Project[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  initialCreateOpen?: boolean;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onRefresh,
  showToast,
  initialCreateOpen = false,
}) => {
  const { authFetch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, published, draft

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(initialCreateOpen);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Delete Confirmation State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    title: { en: '', bn: '' },
    slug: '',
    category: 'web-dev',
    shortDescription: { en: '', bn: '' },
    fullCaseStudy: { en: '', bn: '' },
    challenge: { en: '', bn: '' },
    solution: { en: '', bn: '' },
    tools: ['React', 'TypeScript', 'Tailwind CSS'],
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    demoUrl: '',
    sourceUrl: '',
    isConcept: false,
    isPublished: true,
  });

  const [toolInput, setToolInput] = useState('');
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && p.isPublished) ||
      (filterStatus === 'draft' && !p.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: { en: '', bn: '' },
      slug: '',
      category: 'web-dev',
      shortDescription: { en: '', bn: '' },
      fullCaseStudy: { en: '', bn: '' },
      challenge: { en: '', bn: '' },
      solution: { en: '', bn: '' },
      tools: ['React', 'TypeScript', 'Tailwind CSS'],
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [],
      demoUrl: '',
      sourceUrl: '',
      isConcept: false,
      isPublished: true,
    });
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // Auto-slug when English title changes
  const handleEnglishTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: { ...prev.title!, en: val },
      slug: !editingProject ? slugify(val) : prev.slug || '',
    }));
  };

  // Add tool tag
  const handleAddTool = () => {
    if (!toolInput.trim()) return;
    const current = formData.tools || [];
    if (!current.includes(toolInput.trim())) {
      setFormData((prev) => ({ ...prev, tools: [...current, toolInput.trim()] }));
    }
    setToolInput('');
  };

  // Remove tool tag
  const handleRemoveTool = (toolToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: (prev.tools || []).filter((t) => t !== toolToRemove),
    }));
  };

  // Add gallery image
  const handleAddGalleryImage = () => {
    if (!galleryUrlInput.trim()) return;
    if (!isValidUrl(galleryUrlInput.trim(), true)) {
      showToast('Gallery image must be a valid URL', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), galleryUrlInput.trim()],
    }));
    setGalleryUrlInput('');
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== idx),
    }));
  };

  // Bulletproof Cover Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB limit.', 'error');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, coverImage: dataUrl }));

        try {
          const uploadForm = new FormData();
          uploadForm.append('image', file);
          const res = await authFetch('/api/upload', {
            method: 'POST',
            body: uploadForm,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              setFormData((prev) => ({ ...prev, coverImage: data.url }));
            }
          }
        } catch (uploadErr) {
          console.warn('Cover upload fallback to data URL:', uploadErr);
        }

        showToast('Cover image selected.');
      }
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Toggle Publish Status
  const handleTogglePublish = async (project: Project) => {
    try {
      const res = await authFetch(`/api/admin/projects/${project.id}/publish`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Project "${project.title.en}" is now ${data.isPublished ? 'Published' : 'Draft'}.`);
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle status.', 'error');
    }
  };

  // Save Project (Create or Update)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = validateProjectInput(formData as Project);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      showToast('Please fix the highlighted validation errors.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = Boolean(editingProject);
      const url = isEdit
        ? `/api/admin/projects/${editingProject!.id}`
        : '/api/admin/projects';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to save project.');
      }

      showToast(isEdit ? 'Project updated successfully.' : 'Project created successfully.');
      setIsEditorOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save error.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Project Confirmation
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const res = await authFetch(`/api/admin/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Project deleted successfully.');
      setProjectToDelete(null);
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Deletion failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Project Case Studies</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create, edit, preview, and toggle draft/published status.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="ui-ux">UI/UX Design</option>
            <option value="website-design">Website Design</option>
            <option value="web-dev">Web Development</option>
            <option value="email-copywriting">Email Copywriting</option>
            <option value="ai-automation">AI Automation</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">All States</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Projects Table / Cards */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <p className="text-zinc-400 text-xs">No projects found matching the selected criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((project) => (
                <tr key={project.id} className="hover:bg-zinc-800/30 transition-colors">
                  {/* Title & Cover */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.coverImage}
                        alt=""
                        className="w-12 h-8 object-cover rounded-md bg-zinc-950 border border-zinc-800 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{project.title.en}</div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">/{project.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                      {project.category}
                    </span>
                  </td>

                  {/* Concept flag */}
                  <td className="py-3 px-4">
                    {project.isConcept ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Concept</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">Client Work</span>
                    )}
                  </td>

                  {/* Published status toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublish(project)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        project.isPublished
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {project.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{project.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Last updated */}
                  <td className="py-3 px-4 text-zinc-400 text-[11px]">
                    {new Date(project.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="Edit Project"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL DRAWER */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              aria-label="Close Project Editor"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Fill in bilingual titles, case study challenges, solutions, and URLs.
              </p>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-6">
              {/* Titles Grid (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    English Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title?.en || ''}
                    onChange={(e) => handleEnglishTitleChange(e.target.value)}
                    placeholder="e.g. Apex Financial Dashboard"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors['title.en'] && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors['title.en']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Bengali Title (বাংলা শিরোনাম)
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
                    placeholder="যেমন: অ্যাপেক্স ফাইন্যান্সিয়াল ড্যাশবোর্ড"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Slug & Category & Concept Option */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                    }
                    placeholder="apex-financial-dashboard"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.slug && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as ProjectCategory,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ui-ux">UI/UX Design</option>
                    <option value="website-design">Website Design</option>
                    <option value="web-dev">Website Development</option>
                    <option value="email-copywriting">Email Copywriting</option>
                    <option value="ai-automation">AI Automation</option>
                  </select>
                </div>

                {/* Concept Project Option */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isConcept)}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isConcept: e.target.checked }))
                      }
                      className="rounded text-emerald-500 focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Concept Project</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Short Description (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Short Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortDescription: { ...prev.shortDescription!, en: e.target.value },
                      }))
                    }
                    placeholder="Brief 1-2 sentence overview of the project..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    সংক্ষিপ্ত বিবরণ (Bengali)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription?.bn || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortDescription: { ...prev.shortDescription!, bn: e.target.value },
                      }))
                    }
                    placeholder="প্রজেক্টের সংক্ষিপ্ত বাংলা সারাংশ..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Challenge & Solution (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    The Challenge (সমস্যা)
                  </h4>
                  <textarea
                    rows={2}
                    value={formData.challenge?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        challenge: { ...prev.challenge!, en: e.target.value },
                      }))
                    }
                    placeholder="What core obstacle did the user/client face? (EN)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={2}
                    value={formData.challenge?.bn || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        challenge: { ...prev.challenge!, bn: e.target.value },
                      }))
                    }
                    placeholder="চ্যালেঞ্জের বিবরণ (বাংলা)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    The Solution (সমাধান)
                  </h4>
                  <textarea
                    rows={2}
                    value={formData.solution?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        solution: { ...prev.solution!, en: e.target.value },
                      }))
                    }
                    placeholder="How was the problem solved? (EN)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    rows={2}
                    value={formData.solution?.bn || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        solution: { ...prev.solution!, bn: e.target.value },
                      }))
                    }
                    placeholder="সমাধানের বিবরণ (বাংলা)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Full Case Study Article */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Full Case Study Details (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.fullCaseStudy?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullCaseStudy: { ...prev.fullCaseStudy!, en: e.target.value },
                      }))
                    }
                    placeholder="Comprehensive case study text, metrics, methodology..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    পূর্ণাঙ্গ কেস স্টাডি (Bengali)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.fullCaseStudy?.bn || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullCaseStudy: { ...prev.fullCaseStudy!, bn: e.target.value },
                      }))
                    }
                    placeholder="কেস স্টাডির বিস্তারিত বিবরণ ও ফলাফল..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Cover Image & File Upload */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Cover Image (URL or Direct Upload)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="url"
                    value={formData.coverImage || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />

                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {formData.coverImage && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 mt-2">
                    <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Tools Tags Manager */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Technologies & Tools
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTool();
                      }
                    }}
                    placeholder="Type tool name (e.g. Next.js, Figma, Python) & press Add"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                  >
                    Add Tool
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.tools || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-200"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(t)}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* URLs: Demo & Source Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Live Demo URL
                  </label>
                  <input
                    type="text"
                    value={formData.demoUrl || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.demoUrl && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.demoUrl}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Source Code URL
                  </label>
                  <input
                    type="text"
                    value={formData.sourceUrl || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sourceUrl: e.target.value }))
                    }
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.sourceUrl && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.sourceUrl}</p>
                  )}
                </div>
              </div>

              {/* Published Toggle & Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPublished)}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))
                    }
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-white">
                    Publish immediately to live portfolio (Uncheck for Draft)
                  </span>
                </label>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESTRUCTION CONFIRMATION DIALOG */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Are you sure you want to permanently delete the project{' '}
              <strong className="text-white">"{projectToDelete.title.en}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
