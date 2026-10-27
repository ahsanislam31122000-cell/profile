export type Language = 'en' | 'bn';

export type LocalizedString = {
  en: string;
  bn: string;
};

export type LocalizedStringArray = {
  en: string[];
  bn: string[];
};

export type ProjectCategory =
  | 'ui-ux'
  | 'website-design'
  | 'web-dev'
  | 'email-copywriting'
  | 'ai-automation';

export interface Project {
  id: string;
  title: LocalizedString;
  slug: string;
  category: ProjectCategory;
  shortDescription: LocalizedString;
  fullCaseStudy: LocalizedString;
  challenge: LocalizedString;
  solution: LocalizedString;
  tools: string[];
  coverImage: string;
  galleryImages: string[];
  demoUrl: string;
  sourceUrl: string;
  isConcept: boolean;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  features: LocalizedStringArray;
  icon: string;
  order: number;
  isPublished: boolean;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  twitter: string;
  dribbble: string;
  behance: string;
}

export interface Profile {
  displayName: string;
  headline: LocalizedString;
  biography: LocalizedString;
  profilePhoto: string;
  skills: string[];
  email: string;
  whatsapp: string;
  socialLinks: SocialLinks;
}

export interface ProcessStep {
  step: number;
  title: LocalizedString;
  description: LocalizedString;
}

export interface SiteSettings {
  heroHeadline: LocalizedString;
  heroSubtitle: LocalizedString;
  heroCtaPrimary: LocalizedString;
  heroCtaSecondary: LocalizedString;
  aboutHeadline: LocalizedString;
  aboutBio: LocalizedString;
  processSteps: ProcessStep[];
  footerText: LocalizedString;
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  isMaintenance: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  passwordHash?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'project' | 'service' | 'profile' | 'settings' | 'inquiry' | 'auth';
  details: string;
  timestamp: string;
}

export interface PublicPortfolioData {
  profile: Profile;
  services: Service[];
  projects: Project[];
  settings: SiteSettings;
}

export interface AdminDashboardData {
  profile: Profile;
  services: Service[];
  projects: Project[];
  settings: SiteSettings;
  inquiries: ContactInquiry[];
  activities: ActivityLog[];
  adminUser: {
    id: string;
    email: string;
    role: string;
  };
  stats: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    totalServices: number;
    totalInquiries: number;
    unreadInquiries: number;
  };
}
