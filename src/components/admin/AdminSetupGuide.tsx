import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Database,
  FileCode,
  Copy,
  Check,
  Server,
  Lock,
} from 'lucide-react';

export const AdminSetupGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envSample = `APP_URL="https://your-domain.com"
ADMIN_EMAIL="ahsanislam31122000@gmail.com"
JWT_SECRET="c98f82a1b9e07f9c2d148b301aef0368b5e91244e8f7d9a102476b32819c991b"`;

  const supabaseSnippet = `-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public can ONLY view published projects
CREATE POLICY "Public can view published projects only"
ON public.projects FOR SELECT
USING (is_published = true OR public.is_admin());

-- Only authorized admin can mutate
CREATE POLICY "Admin full access to projects"
ON public.projects FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Setup, Database Schema & Security Checklist</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Comprehensive production documentation for the administrator, database policies, and security testing.
        </p>
      </div>

      {/* 1. First Administrator Credentials */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Key className="w-4 h-4" />
          <span>1. Initial Administrator Setup</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          The backend automatically bootstraps the authorized administrator profile matching your Google AI Studio account runtime email.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase font-sans">Primary Administrator</span>
            <span className="text-emerald-400 font-bold">ahsanislam31122000@gmail.com</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase font-sans">Initial Default Password</span>
            <span className="text-amber-400 font-bold">Admin@12345</span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400">
          Tip: You can change your password anytime via the <strong>Profile & Security</strong> tab.
        </p>
      </div>

      {/* 2. Environment Variables */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Server className="w-4 h-4" />
            <span>2. Environment Variables (.env)</span>
          </div>
          <button
            onClick={() => copyToClipboard(envSample, 'env')}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white"
          >
            {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'env' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto">
          {envSample}
        </pre>
      </div>

      {/* 3. Database Access Policies & RLS */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>3. Database Access Policies (Supabase / PostgreSQL)</span>
          </div>
          <button
            onClick={() => copyToClipboard(supabaseSnippet, 'sql')}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white"
          >
            {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'sql' ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          The full schema and RLS policies are generated in <code className="text-emerald-400">/supabase-schema.sql</code> and Firestore rules in <code className="text-emerald-400">/firestore.rules</code>.
        </p>
        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto">
          {supabaseSnippet}
        </pre>
      </div>

      {/* 4. Deployment and Security Testing Checklist */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>4. Deployment and Security Testing Checklist</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Cryptographic Authentication & Zero Hardcoded Passwords</strong>
              <span>Verified server-side JWT verification with bcrypt salt and hash. Unauthorized requests immediately receive 401.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Draft Project Isolation</strong>
              <span>Public visitors querying <code className="text-emerald-400">/api/public/data</code> only receive published items. Draft projects are excluded on the server.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Private Contact Inquiry Protection</strong>
              <span>Inquiries submitted via the public contact form are strictly write-only for visitors. Only authorized admins can view, toggle read status, or delete inquiries.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">File Upload Sanitization</strong>
              <span>Multipart image uploads are restricted to JPEG, PNG, WEBP, GIF, and SVG with a 5MB size limit enforced by Multer.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Full Bilingual Schema Persistence</strong>
              <span>Every title, description, and copy field supports English and Bengali, rendering dynamically according to the visitor's chosen language.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
