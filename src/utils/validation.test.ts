import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  isValidUrl,
  isValidEmail,
  isValidPhoneNumber,
  formatWhatsAppUrl,
  getLocalized,
  validateProjectInput,
  validateInquiryInput,
} from './validation.ts';

test('slugify transforms strings to url-friendly format', () => {
  assert.equal(slugify('E-commerce Mobile App 2026!'), 'e-commerce-mobile-app-2026');
  assert.equal(slugify('  AI Automation & Workflow  '), 'ai-automation-workflow');
  assert.equal(slugify('Special@#$Characters*&Test'), 'specialcharacterstest');
});

test('isValidUrl checks protocols correctly', () => {
  assert.equal(isValidUrl('https://example.com/project'), true);
  assert.equal(isValidUrl('http://localhost:3000'), true);
  assert.equal(isValidUrl('ftp://example.com'), false);
  assert.equal(isValidUrl('not-a-valid-url'), false);
  assert.equal(isValidUrl('', false), true); // optional
  assert.equal(isValidUrl('', true), false); // required
});

test('isValidEmail validates standard email addresses', () => {
  assert.equal(isValidEmail('admin@portfolio.com'), true);
  assert.equal(isValidEmail('ahsanislam31122000@gmail.com'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail('test@missing-tld'), false);
});

test('isValidPhoneNumber accepts Bangladeshi and international formats', () => {
  // Bangladeshi 11-digit local
  assert.equal(isValidPhoneNumber('01712345678'), true);
  assert.equal(isValidPhoneNumber('01912345678'), true);
  assert.equal(isValidPhoneNumber('01812345678'), true);
  assert.equal(isValidPhoneNumber('01312345678'), true);

  // Bangladeshi with country code
  assert.equal(isValidPhoneNumber('+8801712345678'), true);
  assert.equal(isValidPhoneNumber('8801712345678'), true);
  assert.equal(isValidPhoneNumber('+880 1712-345678'), true);

  // Optional empty string
  assert.equal(isValidPhoneNumber('', false), true);
  assert.equal(isValidPhoneNumber('   ', false), true);
  assert.equal(isValidPhoneNumber('', true), false);

  // Invalid formats
  assert.equal(isValidPhoneNumber('invalid-text'), false);
  assert.equal(isValidPhoneNumber('123'), false);
});

test('formatWhatsAppUrl generates clean wa.me URLs', () => {
  assert.equal(formatWhatsAppUrl('01712345678'), 'https://wa.me/8801712345678');
  assert.equal(formatWhatsAppUrl('+8801712345678'), 'https://wa.me/8801712345678');
  assert.equal(formatWhatsAppUrl('8801712345678'), 'https://wa.me/8801712345678');
  assert.equal(formatWhatsAppUrl('+880 1712-345678'), 'https://wa.me/8801712345678');
  assert.equal(formatWhatsAppUrl('https://wa.me/8801712345678'), 'https://wa.me/8801712345678');
  assert.equal(formatWhatsAppUrl(''), '');
});

test('getLocalized falls back properly between languages', () => {
  const biling = { en: 'Web Development', bn: 'ওয়েবসাইট ডেভেলপমেন্ট' };
  assert.equal(getLocalized(biling, 'en'), 'Web Development');
  assert.equal(getLocalized(biling, 'bn'), 'ওয়েবসাইট ডেভেলপমেন্ট');

  const partial = { en: 'Only English', bn: '' };
  assert.equal(getLocalized(partial, 'bn'), 'Only English');

  assert.equal(getLocalized(undefined, 'en', 'Default Text'), 'Default Text');
});

test('validateProjectInput catches invalid project data', () => {
  const invalidProject = {
    title: { en: '', bn: '' },
    category: undefined,
    slug: '',
    demoUrl: 'ftp://bad-url',
  };
  const result = validateProjectInput(invalidProject);
  assert.equal(result.isValid, false);
  assert.ok(result.errors['title.en']);
  assert.ok(result.errors.category);
  assert.ok(result.errors.demoUrl);

  const validProject = {
    title: { en: 'AI Support Chatbot', bn: 'এআই চ্যাটবট' },
    category: 'ai-automation' as const,
    slug: 'ai-support-chatbot',
    demoUrl: 'https://demo.example.com',
  };
  const validResult = validateProjectInput(validProject);
  assert.equal(validResult.isValid, true);
});

test('validateInquiryInput validates public contact inquiries', () => {
  const bad = { name: '', email: 'bad-email', message: 'hi' };
  const badResult = validateInquiryInput(bad);
  assert.equal(badResult.isValid, false);
  assert.ok(badResult.errors.name);
  assert.ok(badResult.errors.email);
  assert.ok(badResult.errors.message);

  const good = {
    name: 'Rafiqul Islam',
    email: 'client@example.com',
    message: 'We need an e-commerce website redesign for our brand.',
  };
  const goodResult = validateInquiryInput(good);
  assert.equal(goodResult.isValid, true);
});
