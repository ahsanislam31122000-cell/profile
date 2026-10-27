import { Language, LocalizedString, Project, ContactInquiry } from '../types/index.ts';

/**
 * Generate a clean URL-friendly slug from title
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Validate URL string (accepts http, https, or empty string if optional)
 */
export function isValidUrl(url: string, required = false): boolean {
  if (!url || !url.trim()) {
    return !required;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Standard email validation
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validate phone / mobile number, specifically supporting Bangladeshi formats:
 * - 01712345678 (11 digits)
 * - +8801712345678
 * - 8801712345678
 * - With spaces/dashes (e.g. 01712-345678, +880 1712 345678)
 * Also accepts general international phone numbers (+ followed by 7-15 digits).
 */
export function isValidPhoneNumber(phone: string, required = false): boolean {
  if (!phone || !phone.trim()) {
    return !required;
  }
  const clean = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Bangladeshi mobile numbers:
  // 01[3-9]XXXXXXXX (11 digits), +8801[3-9]XXXXXXXX, or 8801[3-9]XXXXXXXX
  const bdRegex = /^(?:\+?8801|01)[3-9]\d{8}$/;
  if (bdRegex.test(clean)) {
    return true;
  }

  // General international telephone format: 7 to 15 digits
  const intlRegex = /^\+?[0-9]{7,15}$/;
  return intlRegex.test(clean);
}

/**
 * Generate a valid WhatsApp direct click-to-chat URL from a phone number string.
 * Keeps the stored phone number clean while generating the https://wa.me/ link.
 */
export function formatWhatsAppUrl(phone: string): string {
  if (!phone || !phone.trim()) return '';
  const trimmed = phone.trim();
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('http://wa.me/')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  // If Bangladeshi 11-digit number starting with 01, prepend 88
  if (digits.length === 11 && digits.startsWith('01')) {
    return `https://wa.me/88${digits}`;
  }

  return `https://wa.me/${digits}`;
}

/**
 * Safe bilingual string accessor with graceful fallback
 */
export function getLocalized(
  value: LocalizedString | undefined | null,
  lang: Language,
  fallback = ''
): string {
  if (!value) return fallback;
  const primary = value[lang];
  if (primary && primary.trim().length > 0) return primary;
  const secondary = lang === 'en' ? value.bn : value.en;
  if (secondary && secondary.trim().length > 0) return secondary;
  return fallback;
}

/**
 * Validate Project fields before save
 */
export function validateProjectInput(project: Partial<Project>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!project.title?.en || project.title.en.trim().length < 2) {
    errors['title.en'] = 'English title is required (at least 2 characters)';
  }

  if (!project.category) {
    errors.category = 'Project category is required';
  }

  if (!project.slug || project.slug.trim().length < 2) {
    errors.slug = 'Valid slug is required';
  }

  if (project.demoUrl && !isValidUrl(project.demoUrl, false)) {
    errors.demoUrl = 'Demo URL must be a valid http/https address';
  }

  if (project.sourceUrl && !isValidUrl(project.sourceUrl, false)) {
    errors.sourceUrl = 'Source URL must be a valid http/https address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Contact Inquiry submission
 */
export function validateInquiryInput(inquiry: Partial<ContactInquiry>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!inquiry.name || inquiry.name.trim().length < 2) {
    errors.name = 'Please provide your name (at least 2 characters)';
  }

  if (!inquiry.email || !isValidEmail(inquiry.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!inquiry.message || inquiry.message.trim().length < 5) {
    errors.message = 'Please provide a message (at least 5 characters)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
