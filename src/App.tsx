import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { PublicPortfolioData, Project } from './types/index.ts';
import { Navbar } from './components/public/Navbar.tsx';
import { Hero } from './components/public/Hero.tsx';
import { ServicesSection } from './components/public/ServicesSection.tsx';
import { ProjectsSection } from './components/public/ProjectsSection.tsx';
import { AboutSection } from './components/public/AboutSection.tsx';
import { ProcessSection } from './components/public/ProcessSection.tsx';
import { ContactSection } from './components/public/ContactSection.tsx';
import { Footer } from './components/public/Footer.tsx';
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminShell } from './components/admin/AdminShell.tsx';
import { ShieldCheck, ArrowLeft, Eye } from 'lucide-react';

function PortfolioApp() {
  const { isAuthenticated, isLoading: authLoading, authFetch } = useAuth();
  const [publicData, setPublicData] = useState<PublicPortfolioData | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      ? '/admin'
      : '/';
  });

  const [isAdminPreviewMode, setIsAdminPreviewMode] = useState<boolean>(false);
  const [previewProjects, setPreviewProjects] = useState<Project[]>([]);
  const [preselectedContactService, setPreselectedContactService] = useState<string>('');

  // Synchronize route with browser URL history
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setCurrentRoute('/admin');
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    if (route === '/admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Fetch Public Portfolio Data (Strictly published items only)
  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public/data');
      if (res.ok) {
        const data = await res.json();
        setPublicData(data);
      }
    } catch (err) {
      console.error('Failed to load public portfolio data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  // Fetch draft projects when entering Admin Preview
  const handleEnterAdminPreview = async () => {
    setIsAdminPreviewMode(true);
    setCurrentRoute('/');
    window.history.pushState({}, '', '/');

    try {
      const res = await authFetch('/api/admin/all-data');
      if (res.ok) {
        const data = await res.json();
        setPreviewProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch preview data:', err);
    }
  };

  const handleExitAdminPreview = () => {
    setIsAdminPreviewMode(false);
    setPreviewProjects([]);
  };

  const handleSelectServiceForContact = (serviceTitle: string) => {
    setPreselectedContactService(serviceTitle);
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If on /admin route:
  if (currentRoute === '/admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLogin onBackToPublic={() => navigateTo('/')} />;
    }

    return (
      <AdminShell
        onExitToPublic={() => {
          fetchPublicData();
          navigateTo('/');
        }}
        onEnterPreview={handleEnterAdminPreview}
      />
    );
  }

  // Otherwise, render Public Portfolio Website
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Admin Preview Mode Floating Banner */}
      {isAdminPreviewMode && (
        <div className="sticky top-0 z-50 bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>ADMIN LIVE PREVIEW ACTIVE: Draft & unpublished projects are visible with badges.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/admin')}
              className="px-3 py-1 rounded bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
            >
              Return to Admin Studio
            </button>
            <button
              onClick={handleExitAdminPreview}
              className="px-2.5 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-xs cursor-pointer"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {loadingData || !publicData ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Loading Portfolio...</p>
          </div>
        </div>
      ) : (
        <>
          <Navbar
            onNavigateToAdmin={() => navigateTo('/admin')}
            whatsappUrl={publicData.profile.whatsapp}
          />

          <main id="main-content">
            <Hero
              settings={publicData.settings}
              profile={publicData.profile}
              onExploreWork={() => {
                const el = document.getElementById('work');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onContactClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <ServicesSection
              services={publicData.services}
              onSelectService={handleSelectServiceForContact}
            />

            <ProjectsSection
              projects={isAdminPreviewMode ? previewProjects : publicData.projects}
              isAdminPreview={isAdminPreviewMode}
            />

            <AboutSection profile={publicData.profile} />

            <ProcessSection steps={publicData.settings.processSteps} />

            <ContactSection
              profile={publicData.profile}
              preselectedService={preselectedContactService}
            />
          </main>

          <Footer
            profile={publicData.profile}
            settings={publicData.settings}
            onNavigateToAdmin={() => navigateTo('/admin')}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PortfolioApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
