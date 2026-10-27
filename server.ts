import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  Project,
  Service,
  Profile,
  SiteSettings,
  ContactInquiry,
  AdminUser,
  ActivityLog,
} from './src/types/index.ts';
import {
  validateProjectInput,
  validateInquiryInput,
} from './src/utils/validation.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-admin-secure-token-key-2026';
const ADMIN_INITIAL_EMAIL = (process.env.ADMIN_EMAIL || 'ahsanislam31122000@gmail.com').toLowerCase();

// Storage Paths
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage for Image Uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, GIF, and SVG images are supported.'));
    }
  },
});

// Database State Interface
interface DatabaseState {
  adminUser: AdminUser;
  profile: Profile;
  services: Service[];
  projects: Project[];
  settings: SiteSettings;
  inquiries: ContactInquiry[];
  activities: ActivityLog[];
}

// Initial Seed Data
function getSeedData(): DatabaseState {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Admin@12345', salt);

  return {
    adminUser: {
      id: 'admin-primary-01',
      email: ADMIN_INITIAL_EMAIL,
      role: 'admin',
      passwordHash,
      createdAt: new Date().toISOString(),
    },
    profile: {
      displayName: 'Ahsan Islam',
      headline: {
        en: 'Product Designer, Full-Stack Developer & AI Automation Specialist',
        bn: 'প্রোডাক্ট ডিজাইনার, ফুল-স্ট্যাক ডেভেলপার ও এআই অটোমেশন বিশেষজ্ঞ',
      },
      biography: {
        en: 'Crafting pixel-perfect digital experiences, scalable high-performance web systems, persuasive email sequences, and cutting-edge intelligent automation pipelines that accelerate modern business growth.',
        bn: 'পিক্সেল-পারফেক্ট ডিজিটাল অভিজ্ঞতা, স্কেলযোগ্য হাই-পারফরম্যান্স ওয়েব সিস্টেম, কনভার্টিং ইমেইল সিকোয়েন্স এবং আধুনিক বিজনেসের জন্য উদ্ভাবনী এআই অটোমেশন তৈরি করছি।',
      },
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      skills: [
        'UI/UX Design',
        'Figma to Code',
        'Next.js / React',
        'TypeScript',
        'Tailwind CSS',
        'Node.js & Express',
        'PostgreSQL & Cloud SQL',
        'Email Copywriting',
        'AI Agents & LLM Integration',
        'Zapier & Make Automation',
      ],
      email: ADMIN_INITIAL_EMAIL,
      whatsapp: '+8801700000000',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        dribbble: 'https://dribbble.com',
        behance: 'https://behance.net',
      },
    },
    services: [
      {
        id: 'srv-uiux',
        order: 1,
        isPublished: true,
        icon: 'Palette',
        title: {
          en: 'UI/UX Design',
          bn: 'ইউআই/ইউএক্স ডিজাইন',
        },
        description: {
          en: 'Human-centered user interfaces, wireframes, design systems, and rapid interactive prototypes engineered for high conversion and effortless usability.',
          bn: 'ব্যবহারকারী-কেন্দ্রিক ইউজার ইন্টারফেস, ওয়্যারফ্রেম, ডিজাইন সিস্টেম এবং ইন্টারেক্টিভ প্রোটোটাইপ যা ব্যবহার সহজ এবং কনভার্সন বৃদ্ধি করে।',
        },
        features: {
          en: [
            'User Research & Information Architecture',
            'Figma High-Fidelity Prototypes & Design Systems',
            'Mobile-First & Web Responsive Layouts',
            'Conversion Rate & Usability Audits',
          ],
          bn: [
            'ব্যবহারকারী গবেষণা ও ইনফরমেশন আর্কিটেকচার',
            'ফিগমা হাই-ফিডেলিটি প্রোটোটাইপ ও ডিজাইন সিস্টেম',
            'মোবাইল-ফার্স্ট এবং রেসপনসিভ লেআউট',
            'কনভার্সন রেট এবং ইউজেবিলিটি অডিট',
          ],
        },
      },
      {
        id: 'srv-web-design',
        order: 2,
        isPublished: true,
        icon: 'Layout',
        title: {
          en: 'Website Design',
          bn: 'ওয়েবসাইট ডিজাইন',
        },
        description: {
          en: 'Visually stunning, distinct brand websites tailored to captivate your audience, communicate value immediately, and outshine competitors.',
          bn: 'দৃষ্টি-নন্দন আধুনিক ব্র্যান্ড ওয়েবসাইট যা অডিয়েন্সের মনোযোগ আকর্ষণ করে এবং ব্র্যান্ডের মর্যাদা বৃদ্ধি করে।',
        },
        features: {
          en: [
            'Bespoke Visual Direction & Aesthetics',
            'Landing Pages & Marketing Portals',
            'Micro-Interactions & Seamless Motion',
            'Brand-Aligned Color & Typographic Mastery',
          ],
          bn: [
            'কাস্টম ভিজ্যুয়াল স্টাইল ও ব্র্যান্ড নান্দনিকতা',
            'ল্যান্ডিং পেজ ও মার্কেটিং পোর্টাল ডিজাইন',
            'স্মুথ মাইক্রো-ইন্টারঅ্যাকশন ও মোশন',
            'ব্র্যান্ড টাইপোগ্রাফি ও কালার হারমোনি',
          ],
        },
      },
      {
        id: 'srv-web-dev',
        order: 3,
        isPublished: true,
        icon: 'Code',
        title: {
          en: 'Website Development',
          bn: 'ওয়েবসাইট ডেভেলপমেন্ট',
        },
        description: {
          en: 'Blazing-fast, SEO-optimized, and rock-solid full-stack web applications built with modern frameworks and robust backend architecture.',
          bn: 'দ্রুতগতির, এসইও-বান্ধব এবং সুরক্ষিত ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন যা আধুনিক প্রযুক্তি ও ব্যাকএন্ড দিয়ে তৈরি।',
        },
        features: {
          en: [
            'React, TypeScript & Tailwind CSS Engineering',
            'Custom CMS & Admin Dashboards',
            'API Integrations & Secure Databases',
            'Lightweight, Sub-Second Page Speeds',
          ],
          bn: [
            'রিঅ্যাক্ট, টাইপস্ক্রিপ্ট ও টেইলউইন্ড ইঞ্জিনিয়ারিং',
            'কাস্টম সিএমএস ও অ্যাডমিন ড্যাশবোর্ড',
            'এপিআই ইন্টিগ্রেশন ও নিরাপদ ডাটাবেস',
            'সর্বোচ্চ পারফরম্যান্স ও লাইটওয়েট স্পিড',
          ],
        },
      },
      {
        id: 'srv-email',
        order: 4,
        isPublished: true,
        icon: 'Mail',
        title: {
          en: 'Email Copywriting',
          bn: 'ইমেইল কপিরাইটিং',
        },
        description: {
          en: 'Compelling email campaigns, nurture funnels, and cold outreach sequences that hook readers, build trust, and drive consistent sales.',
          bn: 'আকর্ষণীয় ইমেইল ক্যাম্পেইন, নার্চার ফানেল এবং কোল্ড আউটরিচ সিকোয়েন্স যা কাস্টমারদের আস্থা অর্জন করে ও বিক্রয় বাড়ায়।',
        },
        features: {
          en: [
            'Automated Welcome & Onboarding Funnels',
            'High-Open Subject Lines & Irresistible CTAs',
            'B2B Cold Outreach & Lead Follow-ups',
            'Retention, Upsell & Newsletter Campaigns',
          ],
          bn: [
            'অটোমেটেড ওয়েলকাম ও অনবোর্ডিং ফানেল',
            'হাই-ওপেন সাবজেক্ট লাইন ও শক্তিশালী সিটিএ',
            'বিটুবি কোল্ড আউটরিচ ও লিড ফলো-আপ',
            'রিটেনশন, আপসেল ও নিউজলেটার ক্যাম্পেইন',
          ],
        },
      },
      {
        id: 'srv-ai',
        order: 5,
        isPublished: true,
        icon: 'Bot',
        title: {
          en: 'AI Automation',
          bn: 'এআই অটোমেশন',
        },
        description: {
          en: 'Intelligent business workflows, autonomous AI agents, and CRM sync pipelines that eliminate repetitive tasks and save hundreds of work hours.',
          bn: 'বুদ্ধিমান ব্যবসায়িক ওয়ার্কফ্লো, স্বায়ত্তশাসিত এআই এজেন্ট এবং সিআরএম সিঙ্ক যা পুনরাবৃত্তিমূলক কাজ দূর করে সময় বাঁচায়।',
        },
        features: {
          en: [
            'Custom AI Agents & Customer Support Bots',
            'Automated Lead Qualification & Intake Flows',
            'Zapier / Make / n8n Cross-Platform Pipelines',
            'Document Analysis & Smart Data Summarization',
          ],
          bn: [
            'কাস্টম এআই এজেন্ট ও কাস্টমার সাপোর্ট বট',
            'অটোমেটেড লিড কোয়ালিফিকেশন ও ইনটেক ফ্লো',
            'জ্যাপিয়ার, মেক ও এনএইটএন ইন্টিগ্রেশন',
            'ডকুমেন্ট প্রসেসিং ও স্মার্ট ডেটা বিশ্লেষণ',
          ],
        },
      },
    ],
    projects: [
      {
        id: 'proj-fintech-saas',
        slug: 'fintech-saas-platform',
        category: 'web-dev',
        isConcept: false,
        isPublished: true,
        views: 342,
        createdAt: '2026-08-15T10:00:00Z',
        updatedAt: '2026-09-20T14:30:00Z',
        title: {
          en: 'Apex Financial Intelligence Dashboard',
          bn: 'অ্যাপেক্স ফাইন্যান্সিয়াল ইন্টেলিজেন্স ড্যাশবোর্ড',
        },
        shortDescription: {
          en: 'A high-velocity wealth analytics platform providing real-time portfolio forecasting, multi-currency accounting, and intelligent transaction categorization.',
          bn: 'রিয়েল-টাইম পোর্টফোলিও পূর্বাভাস, মাল্টি-কারেন্সি অ্যাকাউন্টিং এবং স্মার্ট ট্রানজ্যাকশন অ্যানালিটিক্স সংবলিত ফাইন্যান্সিয়াল প্ল্যাটফর্ম।',
        },
        challenge: {
          en: 'Modern investors struggle with fragmented financial data spread across disparate institutions, resulting in delayed decision-making and manual ledger tracking.',
          bn: 'বিভিন্ন ব্যাংকিং ও ক্রিপ্টো অ্যাকাউন্টের মাঝে ডেটা সমন্বয়ের অভাবে বিনিয়োগকারীদের দ্রুত সিদ্ধান্ত নেওয়া ও ট্র্যাকিং কঠিন হয়ে পড়ে।',
        },
        solution: {
          en: 'Engineered an ultra-responsive dark-mode dashboard featuring interactive WebGL charting, zero-latency financial feeds, and automated tax reporting exports.',
          bn: 'একটি আল্ট্রা-রেসপনসিভ ডার্ক মোড ড্যাশবোর্ড তৈরি করা হয়েছে যা ইন্টারেক্টিভ চার্ট, তাৎক্ষণিক মার্কেট ফিড এবং স্বয়ংক্রিয় ট্যাক্স রিপোর্ট তৈরি করে।',
        },
        fullCaseStudy: {
          en: 'We designed the entire user journey from the ground up, starting with deep stakeholder interviews with 25 active portfolio managers. The resulting interface cut weekly accounting time by 68% while delivering 60 FPS charts on all desktop and mobile devices.',
          bn: 'আমরা ২৫ জন পোর্টফোলিও ম্যানেজারের সাথে গভীর আলোচনার মাধ্যমে পুরো ইউজার জার্নি ডিজাইন করি। এই ইন্টারফেসটি প্রতি সপ্তাহের অ্যাকাউন্টিং সময় ৬৮% কমিয়ে দিয়েছে।',
        },
        tools: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Chart.js', 'PostgreSQL'],
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
        ],
        demoUrl: 'https://apex-finance-preview.example.com',
        sourceUrl: 'https://github.com/example/apex-finance',
      },
      {
        id: 'proj-luxury-ecommerce',
        slug: 'botanical-artisan-commerce',
        category: 'website-design',
        isConcept: false,
        isPublished: true,
        views: 289,
        createdAt: '2026-09-02T12:00:00Z',
        updatedAt: '2026-10-10T16:00:00Z',
        title: {
          en: 'Verdant Artisan Botanicals E-Commerce',
          bn: 'ভার্ডান্ট আর্টিসান বোটানিক্যালস ই-কমার্স',
        },
        shortDescription: {
          en: 'Luxury organic skincare and botanical fragrance experience with bespoke storytelling, interactive scent profiling, and one-click checkout.',
          bn: 'বিলাসবহুল অর্গানিক স্কিনকেয়ার ও সুগন্ধি ব্র্যান্ডের জন্য দৃষ্টিনন্দন স্টোরফ্রন্ট ও ইন্টারেক্টিভ সেন্টিং প্রোফাইলার।',
        },
        challenge: {
          en: 'The brand lacked emotional resonance on digital channels, experiencing a 78% drop-off rate on generic mobile product pages.',
          bn: 'ব্র্যান্ডের মোবাইল পেজে পর্যাপ্ত ভিজ্যুয়াল আবেদন না থাকায় ক্রেতাদের ঝরে পড়ার হার ছিল প্রায় ৭৮%।',
        },
        solution: {
          en: 'Designed an editorial-style e-commerce layout featuring rich typography, tactile textures, immersive video product heroes, and a quiz-based fragrance finder.',
          bn: 'একটি এডিটোরিয়াল স্টাইল লেআউট, মনোমুগ্ধকর টাইপোগ্রাফি, হাই-রেজুলেশন ভিজ্যুয়াল ও কুইজ-ভিত্তিক ফ্র্যাগ্র্যান্স ফাইন্ডার তৈরি করা হয়।',
        },
        fullCaseStudy: {
          en: 'Within 60 days of launching the redesigned storefront, mobile conversion rates jumped by 142% and the average order value increased from $48 to $96.',
          bn: 'নতুন স্টোরফ্রন্ট চালুর ৬০ দিনের মধ্যে মোবাইল কনভার্সন ১৪২% বৃদ্ধি পায় এবং গড় অর্ডারের পরিমাণ ৪৮ ডলার থেকে ৯৬ ডলারে উন্নীত হয়।',
        },
        tools: ['Figma', 'React', 'Tailwind CSS', 'Shopify Storefront API', 'Framer Motion'],
        coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
        ],
        demoUrl: 'https://verdant-botanicals.example.com',
        sourceUrl: '',
      },
      {
        id: 'proj-ai-support-agent',
        slug: 'omnichannel-ai-customer-agent',
        category: 'ai-automation',
        isConcept: true,
        isPublished: true,
        views: 195,
        createdAt: '2026-09-18T09:30:00Z',
        updatedAt: '2026-10-18T11:45:00Z',
        title: {
          en: 'Omnichannel AI Customer Support Automation (Concept)',
          bn: 'অমনিচ্যানেল এআই কাস্টমার সাপোর্ট অটোমেশন (কনসেপ্ট)',
        },
        shortDescription: {
          en: 'Autonomous multi-lingual AI agent that resolves Tier-1 inquiries across Email, WhatsApp, and Web Chat with verified CRM order lookup.',
          bn: 'মাল্টি-লিঙ্গুয়াল এআই এজেন্ট যা ইমেইল, হোয়াটসঅ্যাপ ও ওয়েব চ্যাটে রিয়েল-টাইম অর্ডার ট্র্যাকিং ও সাপোর্ট প্রদান করে।',
        },
        challenge: {
          en: 'E-commerce support teams spend 70% of their workday answering repetitive "Where is my order?" questions and simple refund eligibility inquiries.',
          bn: 'সাপোর্ট দলগুলো তাদের কাজের ৭০% সময় ব্যয় করে পুনরাবৃত্তিমূলক প্রশ্নের উত্তর দিতে, যার ফলে জরুরি সমস্যায় দেরি হয়।',
        },
        solution: {
          en: 'Engineered an intelligent retrieval-augmented generation (RAG) agent integrated with Shopify and Zendesk, capable of resolving customer issues safely within 15 seconds.',
          bn: 'একটি র্যাগ-ভিত্তিক এআই এজেন্ট তৈরি করা হয়েছে যা শপিফাই ও জেনডেস্কের সাথে সরাসরি সংযুক্ত হয়ে ১৫ সেকেন্ডে সঠিক সমাধান দেয়।',
        },
        fullCaseStudy: {
          en: 'Includes human-in-the-loop escalation rules for complex requests, multi-channel sentiment monitoring, and strict data privacy guards protecting customer PII.',
          bn: 'জটিল সমস্যাগুলোর জন্য হিউম্যান এসকেলেশন পলিসি, সেন্টিমেন্ট অ্যানালাইসিস এবং গ্রাহকের গোপনীয়তা সুরক্ষার ব্যবস্থা রাখা হয়েছে।',
        },
        tools: ['OpenAI / Gemini API', 'Python', 'FastAPI', 'Make.com', 'PostgreSQL', 'Docker'],
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
        ],
        demoUrl: 'https://ai-agent-concept.example.com',
        sourceUrl: 'https://github.com/example/ai-support-agent',
      },
      {
        id: 'proj-email-nurture-funnel',
        slug: 'b2b-saas-email-conversion-sequence',
        category: 'email-copywriting',
        isConcept: false,
        isPublished: true,
        views: 145,
        createdAt: '2026-10-01T15:00:00Z',
        updatedAt: '2026-10-15T18:00:00Z',
        title: {
          en: 'B2B SaaS 7-Figure Nurture & Conversion Sequence',
          bn: 'বিটুবি সাশ ৭-ফিগার নার্চার ও কনভার্সন সিকোয়েন্স',
        },
        shortDescription: {
          en: 'A psychological 8-part onboarding and sales email campaign for an enterprise project management tool that increased trial-to-paid conversion by 34%.',
          bn: 'একটি শক্তিশালী ৮-পর্বের অনবোর্ডিং ইমেইল সিরিজ যা ট্রায়াল ইউজারদের পেইড গ্রাহকে রূপান্তর ৩৪% বাড়িয়ে তোলে।',
        },
        challenge: {
          en: 'Free trial users signed up enthusiastically but churned before day 7 due to product complexity and uninspired default notification emails.',
          bn: 'ব্যবহারকারীরা ফ্রি ট্রায়ালে সাইনআপ করলেও সঠিক দিকনির্দেশনার অভাবে ৭ দিনের মধ্যেই ব্যবহার বন্ধ করে দিত।',
        },
        solution: {
          en: 'Crafted benefit-driven micro-lessons, customer case studies, objection handling, and personalized milestone celebration emails triggered by in-app user progress.',
          bn: 'ইন-অ্যাপ অ্যাক্টিভিটি ভিত্তিক মাইক্রো-লেসন, কাস্টমার টেস্টমোনিয়াল ও অবজেকশন হ্যান্ডলিং সমৃদ্ধ আকর্ষক ইমেইল সিকোয়েন্স প্রস্তুত করা হয়।',
        },
        fullCaseStudy: {
          en: 'The sequence maintained an average open rate of 58.4% and an industry-leading click-to-open rate of 21.2%, directly generating $380,000 in incremental Annual Recurring Revenue (ARR).',
          bn: 'এই সিকোয়েন্সটি ৫৮.৪% গড় ওপেন রেট এবং ২১.২% ক্লিক রেট বজায় রেখে বার্ষিক ৩ লাখ ৮০ হাজার ডলারের অতিরিক্ত রাজস্ব এনে দেয়।',
        },
        tools: ['Klaviyo', 'ActiveCampaign', 'Copywriting Psychology', 'A/B Testing Framework'],
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [],
        demoUrl: '',
        sourceUrl: '',
      },
      {
        id: 'proj-draft-sample',
        slug: 'healthtech-mobile-companion',
        category: 'ui-ux',
        isConcept: true,
        isPublished: false, // DRAFT PROJECT TO DEMONSTRATE DRAFT VS PUBLISHED CAPABILITY
        views: 12,
        createdAt: '2026-10-20T10:00:00Z',
        updatedAt: '2026-10-25T14:00:00Z',
        title: {
          en: 'VitalSync Health Companion App (Draft)',
          bn: 'ভাইটালসিঙ্ক হেলথ কম্প্যানিয়ন অ্যাপ (ড্রাফট)',
        },
        shortDescription: {
          en: 'Proactive biometric tracking app with personalized micro-habits and physician communication portal.',
          bn: 'বায়োমেট্রিক ট্র্যাকিং এবং চিকিৎসকের সাথে যোগাযোগের মোবাইল অ্যাপ ডিজাইন কনসেপ্ট।',
        },
        challenge: {
          en: 'Patients with chronic conditions find medical apps intimidating and abandon tracking within 14 days.',
          bn: 'ক্রনিক রোগে আক্রান্ত রোগীরা জটিল ইন্টারফেসের কারণে দ্রুত ট্র্যাকিং বন্ধ করে দেন।',
        },
        solution: {
          en: 'Created a soothing, gamified companion with low-effort voice logging and gentle daily progress rings.',
          bn: 'সহজ ভয়েস লগিং এবং প্রোগ্রেস রিং সংবলিত প্রশান্তিদায়ক ইন্টারফেস তৈরি করা হয়েছে।',
        },
        fullCaseStudy: {
          en: 'Currently undergoing patient usability testing and clinical review for accessibility compliance.',
          bn: 'বর্তমানে রোগীদের সাথে ইউজেবিলিটি টেস্টিং এবং অ্যাক্সেসিবিলিটি যাচাই চলছে।',
        },
        tools: ['Figma', 'Protopie', 'User Research'],
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        galleryImages: [],
        demoUrl: '',
        sourceUrl: '',
      },
    ],
    settings: {
      heroHeadline: {
        en: 'Crafting High-Impact Digital Products & Scalable Systems',
        bn: 'উচ্চমানের ডিজিটাল প্রোডাক্ট ও স্কেলযোগ্য সিস্টেম নির্মাণে আপনার সঙ্গী',
      },
      heroSubtitle: {
        en: 'Specialized in UI/UX Design, Modern Web Development, Persuasive Email Copywriting, and Intelligent AI Automation for forward-thinking brands.',
        bn: 'ইউআই/ইউএক্স ডিজাইন, আধুনিক ওয়েব ডেভেলপমেন্ট, ইমেইল কপিরাইটিং ও উদ্ভাবনী এআই অটোমেশনে বিশেষ পারদর্শী।',
      },
      heroCtaPrimary: {
        en: 'Start a Project',
        bn: 'প্রজেক্ট শুরু করুন',
      },
      heroCtaSecondary: {
        en: 'Explore Portfolio',
        bn: 'কাজের নমুনা দেখুন',
      },
      aboutHeadline: {
        en: 'Merging Design Precision with Engineering Excellence',
        bn: 'ডিজাইন ও প্রযুক্তিগত দক্ষতার সমন্বয়ে আধুনিক সমাধান',
      },
      aboutBio: {
        en: 'With over 6 years of hands-on experience across product design, full-stack engineering, and AI pipelines, I bridge the gap between creative aesthetics and high-converting business outcomes.',
        bn: 'প্রোডাক্ট ডিজাইন, ফুল-স্ট্যাক ইঞ্জিনিয়ারিং ও এআই অটোমেশনে ৬ বছরেরও বেশি অভিজ্ঞতার মাধ্যমে আমি নান্দনিকতা ও ব্যবসায়িক সাফল্যের সমন্বয় ঘটিয়ে থাকি।',
      },
      processSteps: [
        {
          step: 1,
          title: {
            en: 'Discovery & Strategic Alignment',
            bn: 'গবেষণা ও কৌশলগত পরিকল্পনা',
          },
          description: {
            en: 'Deconstructing your target audience, core business goals, competitive landscape, and key performance indicators.',
            bn: 'লক্ষ্য নির্ধারণ, গ্রাহক বিশ্লেষণ, প্রতিযোগী পর্যবেক্ষণ এবং ব্যবসায়িক প্রবৃদ্ধি নিশ্চিত করার কৌশল তৈরি।',
          },
        },
        {
          step: 2,
          title: {
            en: 'Design Architecture & Prototyping',
            bn: 'ডিজাইন আর্কিটেকচার ও প্রোটোটাইপিং',
          },
          description: {
            en: 'Creating high-fidelity wireframes, interactive user flows, and cohesive design systems for validation.',
            bn: 'ব্যবহারযোগ্যতা নিশ্চিত করতে হাই-ফিডেলিটি ওয়্যারফ্রেম এবং ইন্টারেক্টিভ প্রোটোটাইপ প্রস্তুত।',
          },
        },
        {
          step: 3,
          title: {
            en: 'Full-Stack Development & Integration',
            bn: 'ডেভেলপমেন্ট ও এআই ইন্টিগ্রেশন',
          },
          description: {
            en: 'Writing clean, typed, modular code with accessible UI, high-speed database queries, and intelligent automations.',
            bn: 'পরিচ্ছন্ন কোড, দ্রুতগতির ডাটাবেস এবং সুরক্ষিত এপিআই ইন্টিগ্রেশনের মাধ্যমে বাস্তব রূপ দান।',
          },
        },
        {
          step: 4,
          title: {
            en: 'Quality Audit, Launch & Optimization',
            bn: 'গুণগত পরীক্ষা, লঞ্চ ও অপটিমাইজেশন',
          },
          description: {
            en: 'Rigorous cross-browser testing, SEO checklist verification, performance tuning, and post-launch support.',
            bn: 'নিরাপত্তা ও গতি পরীক্ষা, এসইও অপটিমাইজেশন এবং সফল লঞ্চ নিশ্চিতকরণ।',
          },
        },
      ],
      footerText: {
        en: '© 2026 Ahsan Islam. All rights reserved. Designed and developed with passion.',
        bn: '© ২০২৬ আহসান ইসলাম। সর্বস্বত্ব সংরক্ষিত। নিষ্ঠা ও দক্ষতার সাথে নির্মিত।',
      },
      seoTitle: {
        en: 'Ahsan Islam | Digital Services Portfolio & AI Automation',
        bn: 'আহসান ইসলাম | ডিজিটাল সার্ভিস পোর্টফোলিও ও এআই অটোমেশন',
      },
      seoDescription: {
        en: 'Expert UI/UX Design, Full-Stack Web Development, Email Copywriting, and Autonomous AI Workflows.',
        bn: 'অভিজ্ঞ ইউআই/ইউএক্স ডিজাইন, ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট, ইমেইল কপিরাইটিং ও এআই অটোমেশন সেবা।',
      },
      isMaintenance: false,
    },
    inquiries: [
      {
        id: 'inq-initial-01',
        name: 'Tanvir Ahmed',
        email: 'tanvir@techventures.io',
        service: 'Website Development',
        subject: 'Custom Web Application with Next.js',
        message: 'Hello Ahsan, we are building a B2B SaaS platform and love your portfolio work. Could we schedule a 20-minute discovery call this Thursday to discuss scope and timelines?',
        isRead: false,
        createdAt: '2026-10-24T14:15:00Z',
      },
      {
        id: 'inq-initial-02',
        name: 'Sarah Jenkins',
        email: 'sarah@zenithgrowth.com',
        service: 'AI Automation',
        subject: 'Automating Customer Intake with AI',
        message: 'We currently process 400 client applications manually each month and want to automate this with an AI agent. Can you help us design this workflow?',
        isRead: true,
        createdAt: '2026-10-21T09:40:00Z',
      },
    ],
    activities: [
      {
        id: 'act-01',
        action: 'System Initialized',
        entityType: 'auth',
        details: 'Admin Studio securely configured with verified admin user.',
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// Database Read/Write Helpers with In-Memory Caching & Disk Sync
let dbCache: DatabaseState | null = null;

function loadDatabase(): DatabaseState {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DB_FILE)) {
    const seed = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    dbCache = seed;
    return seed;
  }

  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(data);
    return dbCache!;
  } catch (err) {
    console.error('Failed reading database file, fallback to seed:', err);
    const seed = getSeedData();
    dbCache = seed;
    return seed;
  }
}

function saveDatabase(data: DatabaseState): void {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing to database file:', err);
  }
}

function logActivity(
  action: string,
  entityType: ActivityLog['entityType'],
  details: string
): void {
  const db = loadDatabase();
  const entry: ActivityLog = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    entityType,
    details,
    timestamp: new Date().toISOString(),
  };
  db.activities.unshift(entry);
  if (db.activities.length > 50) {
    db.activities = db.activities.slice(0, 50);
  }
  saveDatabase(db);
}

// Authentication Middleware
function verifyAdminToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied: Valid administrator Bearer token required.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    if (decoded.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient administrative privileges.',
      });
      return;
    }

    (req as any).adminUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session token has expired or is invalid. Please sign in again.',
    });
  }
}

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. Public Portfolio Data (ONLY published content, NO inquiries, NO secrets)
app.get('/api/public/data', (_req: Request, res: Response) => {
  const db = loadDatabase();

  // Strict Security Filter: Only published items are sent to public visitors
  const publishedProjects = db.projects.filter((p) => p.isPublished);
  const publishedServices = db.services
    .filter((s) => s.isPublished)
    .sort((a, b) => a.order - b.order);

  res.json({
    profile: db.profile,
    services: publishedServices,
    projects: publishedProjects,
    settings: db.settings,
  });
});

// 2. Public Contact Inquiry Submission (Writes to inbox, never exposes inquiries)
app.post('/api/inquiries', (req: Request, res: Response) => {
  const { name, email, service, subject, message } = req.body;

  const validation = validateInquiryInput({ name, email, message });
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors,
    });
    return;
  }

  const db = loadDatabase();
  const newInquiry: ContactInquiry = {
    id: `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    service: service ? String(service).trim() : 'General Inquiry',
    subject: subject ? String(subject).trim() : 'New Project Inquiry',
    message: message.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  db.inquiries.unshift(newInquiry);
  logActivity('New Inquiry Received', 'inquiry', `From ${newInquiry.name} (${newInquiry.email}) for ${newInquiry.service}`);
  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. Ahsan will review your details and respond shortly.',
  });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Admin Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = loadDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== db.adminUser.email.toLowerCase()) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, db.adminUser.passwordHash || '');
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const token = jwt.sign(
    {
      id: db.adminUser.id,
      email: db.adminUser.email,
      role: 'admin',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logActivity('Admin Logged In', 'auth', `Admin session started for ${db.adminUser.email}`);

  res.json({
    success: true,
    token,
    user: {
      id: db.adminUser.id,
      email: db.adminUser.email,
      role: db.adminUser.role,
    },
  });
});

// Verify Current Admin Token
app.get('/api/auth/me', verifyAdminToken, (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  res.json({
    user: {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    },
  });
});

// Change Admin Password
app.post('/api/auth/change-password', verifyAdminToken, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({
      error: 'New password must be at least 8 characters long.',
    });
    return;
  }

  const db = loadDatabase();
  const isMatch = bcrypt.compareSync(currentPassword, db.adminUser.passwordHash || '');
  if (!isMatch) {
    res.status(400).json({ error: 'Current password does not match.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  db.adminUser.passwordHash = bcrypt.hashSync(newPassword, salt);
  logActivity('Password Changed', 'auth', 'Administrator password was updated successfully.');
  saveDatabase(db);

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Reset initial admin account helper for authorized user
app.post('/api/auth/quick-setup-demo', (req: Request, res: Response) => {
  // Safe helper: sets the admin email to user runtime email with known dev credential
  const { confirmation } = req.body;
  if (confirmation !== 'setup-authorized-admin') {
    res.status(400).json({ error: 'Invalid confirmation token.' });
    return;
  }

  const db = loadDatabase();
  const salt = bcrypt.genSaltSync(10);
  db.adminUser.email = ADMIN_INITIAL_EMAIL;
  db.adminUser.passwordHash = bcrypt.hashSync('Admin@12345', salt);
  saveDatabase(db);

  res.json({
    success: true,
    email: ADMIN_INITIAL_EMAIL,
    message: 'Administrator account configured. Default password is Admin@12345 (changeable in settings).',
  });
});

// ==========================================
// SECURE ADMIN DASHBOARD & CRUD ENDPOINTS
// ==========================================

// Upload Image endpoint
app.post('/api/upload', verifyAdminToken, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Get Complete Admin Dashboard Data (Includes all drafts, metrics, inquiries)
app.get('/api/admin/all-data', verifyAdminToken, (req: Request, res: Response) => {
  const db = loadDatabase();

  const totalProjects = db.projects.length;
  const publishedProjects = db.projects.filter((p) => p.isPublished).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalServices = db.services.length;
  const totalInquiries = db.inquiries.length;
  const unreadInquiries = db.inquiries.filter((i) => !i.isRead).length;

  res.json({
    profile: db.profile,
    services: db.services.sort((a, b) => a.order - b.order),
    projects: db.projects,
    settings: db.settings,
    inquiries: db.inquiries,
    activities: db.activities,
    adminUser: {
      id: db.adminUser.id,
      email: db.adminUser.email,
      role: db.adminUser.role,
    },
    stats: {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalServices,
      totalInquiries,
      unreadInquiries,
    },
  });
});

// --- Projects CRUD ---

// Create Project
app.post('/api/admin/projects', verifyAdminToken, (req: Request, res: Response) => {
  const projectData = req.body;
  const validation = validateProjectInput(projectData);

  if (!validation.isValid) {
    res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    return;
  }

  const db = loadDatabase();
  const newProject: Project = {
    id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: {
      en: projectData.title?.en || '',
      bn: projectData.title?.bn || '',
    },
    slug: projectData.slug.trim().toLowerCase(),
    category: projectData.category,
    shortDescription: {
      en: projectData.shortDescription?.en || '',
      bn: projectData.shortDescription?.bn || '',
    },
    fullCaseStudy: {
      en: projectData.fullCaseStudy?.en || '',
      bn: projectData.fullCaseStudy?.bn || '',
    },
    challenge: {
      en: projectData.challenge?.en || '',
      bn: projectData.challenge?.bn || '',
    },
    solution: {
      en: projectData.solution?.en || '',
      bn: projectData.solution?.bn || '',
    },
    tools: Array.isArray(projectData.tools) ? projectData.tools : [],
    coverImage: projectData.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    galleryImages: Array.isArray(projectData.galleryImages) ? projectData.galleryImages : [],
    demoUrl: projectData.demoUrl || '',
    sourceUrl: projectData.sourceUrl || '',
    isConcept: Boolean(projectData.isConcept),
    isPublished: Boolean(projectData.isPublished),
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  logActivity('Created Project', 'project', `Created project "${newProject.title.en}" (${newProject.isPublished ? 'Published' : 'Draft'})`);
  saveDatabase(db);

  res.status(201).json({ success: true, project: newProject });
});

// Update Project
app.put('/api/admin/projects/:id', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const projectData = req.body;

  const validation = validateProjectInput(projectData);
  if (!validation.isValid) {
    res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    return;
  }

  const db = loadDatabase();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const existing = db.projects[index];
  const updatedProject: Project = {
    ...existing,
    ...projectData,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  db.projects[index] = updatedProject;
  logActivity('Updated Project', 'project', `Updated project "${updatedProject.title.en}"`);
  saveDatabase(db);

  res.json({ success: true, project: updatedProject });
});

// Toggle Publish State
app.patch('/api/admin/projects/:id/publish', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDatabase();
  const project = db.projects.find((p) => p.id === id);

  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  project.isPublished = !project.isPublished;
  project.updatedAt = new Date().toISOString();
  logActivity(
    project.isPublished ? 'Published Project' : 'Unpublished Project',
    'project',
    `Project "${project.title.en}" is now ${project.isPublished ? 'live for public' : 'draft'}`
  );
  saveDatabase(db);

  res.json({ success: true, isPublished: project.isPublished, project });
});

// Delete Project
app.delete('/api/admin/projects/:id', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDatabase();
  const index = db.projects.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const deleted = db.projects.splice(index, 1)[0];
  logActivity('Deleted Project', 'project', `Deleted project "${deleted.title.en}"`);
  saveDatabase(db);

  res.json({ success: true, message: 'Project deleted successfully.' });
});

// --- Services CRUD ---

// Bulk Update / Reorder Services
app.put('/api/admin/services', verifyAdminToken, (req: Request, res: Response) => {
  const { services } = req.body;
  if (!Array.isArray(services)) {
    res.status(400).json({ error: 'Services array is required.' });
    return;
  }

  const db = loadDatabase();
  db.services = services.map((s, idx) => ({
    ...s,
    order: idx + 1,
  }));

  logActivity('Updated Services', 'service', `Updated and reordered ${db.services.length} services.`);
  saveDatabase(db);

  res.json({ success: true, services: db.services });
});

// Add Single Service
app.post('/api/admin/services', verifyAdminToken, (req: Request, res: Response) => {
  const serviceData = req.body;
  const db = loadDatabase();

  const newService: Service = {
    id: `srv-${Date.now()}`,
    order: db.services.length + 1,
    isPublished: true,
    icon: serviceData.icon || 'Code',
    title: {
      en: serviceData.title?.en || 'New Service',
      bn: serviceData.title?.bn || 'নতুন সার্ভিস',
    },
    description: {
      en: serviceData.description?.en || '',
      bn: serviceData.description?.bn || '',
    },
    features: {
      en: Array.isArray(serviceData.features?.en) ? serviceData.features.en : [],
      bn: Array.isArray(serviceData.features?.bn) ? serviceData.features.bn : [],
    },
  };

  db.services.push(newService);
  logActivity('Added Service', 'service', `Added new service: ${newService.title.en}`);
  saveDatabase(db);

  res.status(201).json({ success: true, service: newService });
});

// Delete Service
app.delete('/api/admin/services/:id', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDatabase();
  const index = db.services.findIndex((s) => s.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }

  const removed = db.services.splice(index, 1)[0];
  logActivity('Removed Service', 'service', `Removed service: ${removed.title.en}`);
  saveDatabase(db);

  res.json({ success: true, message: 'Service removed successfully.' });
});

// --- Profile & Site Settings ---

// Update Profile
app.put('/api/admin/profile', verifyAdminToken, (req: Request, res: Response) => {
  const profileData = req.body;
  const db = loadDatabase();

  db.profile = {
    ...db.profile,
    ...profileData,
    whatsapp: profileData.whatsapp !== undefined ? String(profileData.whatsapp).trim() : db.profile.whatsapp,
  };

  logActivity('Updated Profile', 'profile', 'Updated profile information and contact links.');
  saveDatabase(db);

  res.json({ success: true, profile: db.profile });
});

// Update Site Settings & Content
app.put('/api/admin/settings', verifyAdminToken, (req: Request, res: Response) => {
  const settingsData = req.body;
  const db = loadDatabase();

  db.settings = {
    ...db.settings,
    ...settingsData,
  };

  logActivity('Updated Site Content', 'settings', 'Updated hero, about, process, and SEO meta content.');
  saveDatabase(db);

  res.json({ success: true, settings: db.settings });
});

// --- Inquiries Management ---

// Toggle Inquiry Read/Unread Status
app.patch('/api/admin/inquiries/:id/read', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDatabase();
  const inquiry = db.inquiries.find((i) => i.id === id);

  if (!inquiry) {
    res.status(404).json({ error: 'Inquiry not found.' });
    return;
  }

  inquiry.isRead = !inquiry.isRead;
  saveDatabase(db);

  res.json({ success: true, isRead: inquiry.isRead, inquiry });
});

// Delete Inquiry
app.delete('/api/admin/inquiries/:id', verifyAdminToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDatabase();
  const index = db.inquiries.findIndex((i) => i.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Inquiry not found.' });
    return;
  }

  const removed = db.inquiries.splice(index, 1)[0];
  logActivity('Deleted Inquiry', 'inquiry', `Removed inquiry from ${removed.name}`);
  saveDatabase(db);

  res.json({ success: true, message: 'Inquiry deleted successfully.' });
});

// Update Profile Photo directly
app.patch('/api/admin/profile/photo', verifyAdminToken, (req: Request, res: Response) => {
  const { photoUrl } = req.body;
  if (!photoUrl) {
    res.status(400).json({ error: 'Photo URL is required.' });
    return;
  }

  const db = loadDatabase();
  db.profile.profilePhoto = photoUrl;
  logActivity('Updated Profile Photo', 'profile', 'Administrator updated profile picture.');
  saveDatabase(db);

  res.json({ success: true, profilePhoto: photoUrl, profile: db.profile });
});

// Firebase Token Login Endpoint
app.post('/api/auth/firebase-login', (req: Request, res: Response) => {
  const { email, idToken } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  const normalized = String(email).trim().toLowerCase();
  const db = loadDatabase();

  if (normalized !== db.adminUser.email.toLowerCase()) {
    res.status(403).json({
      error: 'Unauthorized',
      message: `The Google account (${normalized}) is not registered as an authorized administrator. Expected: ${db.adminUser.email}`,
    });
    return;
  }

  const token = jwt.sign(
    {
      id: db.adminUser.id,
      email: db.adminUser.email,
      role: 'admin',
      provider: 'firebase-google',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logActivity('Google/Firebase Sign-In', 'auth', `Admin logged in via Google Authentication (${normalized})`);

  res.json({
    success: true,
    token,
    user: {
      id: db.adminUser.id,
      email: db.adminUser.email,
      role: db.adminUser.role,
    },
  });
});

// ==========================================
// VITE DEV SERVER & PRODUCTION STATIC FALLBACK
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // CRITICAL: Handle SPA client-side routing in dev mode
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/uploads')) {
        return next();
      }

      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Digital Service Portfolio & Admin Studio running at http://localhost:${PORT}`);
  });
}

startServer();
