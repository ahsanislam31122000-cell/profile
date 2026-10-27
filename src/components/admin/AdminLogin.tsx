import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { auth, googleProvider } from '../../firebase.ts';
import { signInWithPopup } from 'firebase/auth';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Check,
  Chrome,
} from 'lucide-react';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('ahsanislam31122000@gmail.com');
  const [password, setPassword] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickSetupSuccess, setQuickSetupSuccess] = useState<string | null>(null);

  // Email & Password Sign In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate.');
      }

      login(data.token, data.user);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : 'Invalid credentials.';
      if (msg.toLowerCase().includes('failed to fetch')) {
        setError('Network connectivity check failed. Please click "Autofill verified credentials" below to verify connection.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In with Firebase Authentication
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSigningIn(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error('No email associated with Google account.');
      }

      // Exchange Firebase identity with backend
      const idToken = await user.getIdToken();
      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Google login unauthorized.');
      }

      login(data.token, data.user);
    } catch (err) {
      console.error('Firebase Google Auth error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or encountered an error.'
      );
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleQuickSetup = async () => {
    setError(null);
    try {
      const res = await fetch('/api/auth/quick-setup-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'setup-authorized-admin' }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail(data.email);
        setPassword('Admin@12345');
        setQuickSetupSuccess('Verified admin credentials ready. Click "Sign In to Admin Studio".');
      } else {
        throw new Error(data.error);
      }
    } catch {
      setEmail('ahsanislam31122000@gmail.com');
      setPassword('Admin@12345');
      setQuickSetupSuccess('Credentials loaded. Click Sign In.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onBackToPublic}
        className="absolute top-6 left-6 text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
      >
        <span>← Back to Public Portfolio</span>
      </button>

      <div className="w-full max-w-md relative">
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1.5px] mb-4 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Studio</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Private access for authorized portfolio administrator
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {quickSetupSuccess && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{quickSetupSuccess}</p>
            </div>
          )}

          {/* Google Sign-In with Firebase Auth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="w-full mb-5 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold border border-zinc-700/80 shadow-md hover:border-zinc-600 transition-all cursor-pointer disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-emerald-400" />
            <span>{isGoogleSigningIn ? 'Connecting to Google...' : 'Sign in with Google (Firebase)'}</span>
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-zinc-800" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Or Email & Password</span>
            <div className="flex-1 h-[1px] bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Setup Hint Box */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-400 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Authorized Administrator Setup</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Email: <span className="text-zinc-300 font-mono">ahsanislam31122000@gmail.com</span>. Default Password: <span className="text-zinc-300 font-mono">Admin@12345</span>.
              </p>
              <button
                type="button"
                onClick={handleQuickSetup}
                className="self-start text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Autofill verified administrator credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
