import React, { useState } from 'react';
import { Profile } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { isValidPhoneNumber } from '../../utils/validation.ts';
import { db } from '../../firebase.ts';
import { doc, setDoc } from 'firebase/firestore';
import {
  User,
  Upload,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Camera,
  Sparkles,
} from 'lucide-react';

interface ProfileEditorProps {
  profile: Profile;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onRefresh,
  showToast,
}) => {
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [skillInput, setSkillInput] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  ];

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Immediate Save Photo to Backend Database & Firestore
  const persistPhotoUrl = async (photoUrl: string) => {
    try {
      const res = await authFetch('/api/admin/profile/photo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl }),
      });
      if (res.ok) {
        showToast('Profile picture saved and updated permanently!');
        onRefresh();
      }

      // Also sync photo to Firestore profile document
      try {
        await setDoc(
          doc(db, 'profiles', 'main'),
          {
            profilePhoto: photoUrl,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fErr) {
        console.warn('Firestore photo sync note:', fErr);
      }
    } catch (err) {
      console.warn('Direct photo persistence note:', err);
    }
  };

  // Bulletproof Photo Upload: supports direct base64 FileReader + backend upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Photo must be less than 8MB.', 'error');
      return;
    }

    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, profilePhoto: dataUrl }));

        try {
          const form = new FormData();
          form.append('image', file);
          const uploadRes = await authFetch('/api/upload', {
            method: 'POST',
            body: form,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData.url) {
              setFormData((prev) => ({ ...prev, profilePhoto: uploadData.url }));
              await persistPhotoUrl(uploadData.url);
              setIsUploadingPhoto(false);
              return;
            }
          }
        } catch (uploadErr) {
          console.warn('Server upload fallback to base64 data URL:', uploadErr);
        }

        await persistPhotoUrl(dataUrl);
      }
      setIsUploadingPhoto(false);
    };

    reader.onerror = () => {
      showToast('Could not read image file. Please try another image.', 'error');
      setIsUploadingPhoto(false);
    };

    reader.readAsDataURL(file);
  };

  // Save Full Profile Form with Mobile Phone Number Validation
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    // Validate phone number specifically for Bangladeshi or international format (never require URL!)
    if (formData.whatsapp && formData.whatsapp.trim()) {
      if (!isValidPhoneNumber(formData.whatsapp, false)) {
        setPhoneError('Please enter a valid mobile number (e.g. 01712345678 or +8801712345678).');
        showToast('Please check the mobile number format.', 'error');
        return;
      }
    }

    setIsSaving(true);

    try {
      // 1. Save to Backend Database API
      const res = await authFetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          whatsapp: String(formData.whatsapp || '').trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');

      // 2. Save directly to Firestore profile document
      try {
        await setDoc(
          doc(db, 'profiles', 'main'),
          {
            displayName: formData.displayName,
            headline: formData.headline,
            biography: formData.biography,
            profilePhoto: formData.profilePhoto,
            skills: formData.skills,
            email: formData.email,
            whatsapp: String(formData.whatsapp || '').trim(),
            socialLinks: formData.socialLinks,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fErr) {
        console.warn('Firestore profile sync note:', fErr);
      }

      showToast('Profile and mobile number updated successfully.');
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed.');

      showToast('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to change password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Administrator Profile & Security</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure personal bio, headline, profile photo, skills tags, mobile number, and social profiles.
        </p>
      </div>

      {/* Form with noValidate to prevent accidental browser native tooltip blocks */}
      <form onSubmit={handleSaveProfile} noValidate className="space-y-6">
        {/* Profile Photo & Identity */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Profile Photo & Avatar</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-zinc-950 border-2 border-emerald-500/40 shadow-xl">
                <img
                  src={
                    formData.profilePhoto ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold rounded-2xl cursor-pointer transition-opacity"
                title="Click to replace photo"
              >
                <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Upload Photo from Computer / Phone
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-500/20">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingPhoto ? 'Processing Picture...' : 'Choose Picture File'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={formData.profilePhoto}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, profilePhoto: e.target.value }))
                      }
                      placeholder="Or paste any image URL..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => persistPhotoUrl(formData.profilePhoto)}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample avatar quick picks */}
              <div>
                <span className="text-[11px] text-zinc-500 block mb-1.5 font-medium">Or pick a professional placeholder:</span>
                <div className="flex items-center gap-2">
                  {sampleAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, profilePhoto: url }));
                        persistPhotoUrl(url);
                      }}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                        formData.profilePhoto === url ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-zinc-800'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Contact Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Bilingual Headline & Biography */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-5">
          <h3 className="text-sm font-bold text-white">
            Bilingual Headline & Biography
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Professional Headline (English)
              </label>
              <input
                type="text"
                value={formData.headline.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    headline: { ...prev.headline, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                হেডলাইন (Bengali)
              </label>
              <input
                type="text"
                value={formData.headline.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    headline: { ...prev.headline, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                About Biography (English)
              </label>
              <textarea
                rows={4}
                value={formData.biography.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    biography: { ...prev.biography, en: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                বায়োগ্রাফি (Bengali)
              </label>
              <textarea
                rows={4}
                value={formData.biography.bn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    biography: { ...prev.biography, bn: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Skills Tags Manager */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Skills & Competencies</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. Next.js, Figma, AI Workflows"
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-zinc-800 text-zinc-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-zinc-500 hover:text-rose-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Number & Social Links */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Mobile Contact & Social Profile Links</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile Number Field - Uses type="tel", validates BD and intl numbers without URL constraint */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Mobile / WhatsApp Number (মোবাইল নম্বর)
                </label>
                <span className="text-[10px] text-zinc-400">e.g. 01712345678 or +8801712345678</span>
              </div>
              <input
                type="tel"
                inputMode="tel"
                value={formData.whatsapp}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, whatsapp: e.target.value }));
                  if (phoneError) setPhoneError(null);
                }}
                placeholder="+8801712345678 or 01712345678"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-xs text-white focus:outline-none transition-colors ${
                  phoneError
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-zinc-800 focus:border-emerald-500'
                }`}
              />
              {phoneError && (
                <p className="text-[11px] text-rose-400 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                GitHub URL
              </label>
              <input
                type="text"
                value={formData.socialLinks?.github || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, github: e.target.value },
                  }))
                }
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                  }))
                }
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Twitter / X URL
              </label>
              <input
                type="text"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                  }))
                }
                placeholder="https://twitter.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Profile Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* SECURITY / PASSWORD UPDATE CARD */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Update Administrator Password</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Passwords are cryptographically salted with bcrypt and verified on the server.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              New Password (minimum 8 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isChangingPassword ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
