# Digital Service Portfolio & Admin Studio
## Architecture, Security & Production Deployment Guide

This application is built with a decoupled client-server architecture:
1. **Frontend**: React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion.
2. **Backend**: Express + Node.js with JWT authentication, bcrypt password hashing, input validation, and server-side authorization enforcement.
3. **Database Options**:
   - **Out-of-the-Box**: Self-contained persistent database (`./data/database.json`) with image uploads in `./uploads/`. Changes persist across restarts.
   - **Cloud Database (Supabase / PostgreSQL)**: Drop-in schema and Row Level Security policies defined in `supabase-schema.sql`.
   - **Cloud Database (Firebase / Firestore)**: Security rules in `firestore.rules` and blueprint in `firebase-blueprint.json`.

---

## 1. Initial Administrator Setup

- **Default Administrator Email**: `ahsanislam31122000@gmail.com`
- **Default Initial Password**: `Admin@12345`
- **First-Time Sign-In**:
  1. Open `/admin` in the browser.
  2. Enter the administrator credentials.
  3. Once logged in, navigate to **Profile / Security** to update your password to your private passphrase.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env`:
```bash
# Host URL
APP_URL="https://your-domain.com"

# Authorized Administrator Email
ADMIN_EMAIL="ahsanislam31122000@gmail.com"

# Secret Key for JWT Signing (Generate a random 64-character string in production)
JWT_SECRET="c98f82a1b9e07f9c2d148b301aef0368b5e91244e8f7d9a102476b32819c991b"
```

---

## 3. Database Security & Access Control Policies

The backend enforces strict separation between public and administrative privileges:

| Resource | Public Visitor (Anonymous) | Authorized Administrator |
|---|---|---|
| **Published Projects** | Read Only (`GET /api/public/data`) | Full CRUD (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) |
| **Draft Projects** | **Hidden** (Filtered server-side) | Visible in Admin Studio & Admin Preview |
| **Published Services** | Read Only | Full CRUD & Reordering |
| **Draft Services** | **Hidden** | Visible & Editable in Admin Studio |
| **Profile & Settings** | Read Only | Full Update (`PUT /api/admin/profile`, `PUT /api/admin/settings`) |
| **Contact Inquiries** | **Create Only** (`POST /api/inquiries`) | Full Read, Mark Read/Unread, Delete |
| **Image Uploads** | **Forbidden** (401 Unauthorized) | Permitted (JPEG, PNG, WEBP, SVG <= 5MB) |

---

## 4. Production Deployment & Security Testing Checklist

### Pre-Deployment Checklist
- [x] **No hardcoded client-side password**: Auth is verified using bcrypt hashes on the server.
- [x] **JWT Token Expiration**: Tokens expire after 7 days and must be signed with a strong secret.
- [x] **Protected API Routes**: All `/api/admin/*` endpoints strictly verify the Bearer token and role.
- [x] **Inquiry Privacy Guard**: Public endpoint `/api/public/data` does NOT return contact inquiries.
- [x] **Draft Project Isolation**: Public visitors cannot query or view unpublished drafts.
- [x] **Input Validation**: Required fields, slug formats, and URL schemes (`http:`/`https:`) validated before database commit.
- [x] **File Upload Restrictions**: MIME type allowlist enforced and file size capped at 5MB.
- [x] **Bilingual Completeness**: English and Bengali fields for titles, descriptions, and site settings.

---

## 5. Supabase RLS Migration (Optional)

If deploying to Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and paste the entire contents of `supabase-schema.sql`.
3. Run the script. This creates all tables, enables RLS, and sets up row policies for public reads and admin-only writes.
4. In **Storage**, create a bucket named `portfolio-assets` with public read access and admin-only write policy.
