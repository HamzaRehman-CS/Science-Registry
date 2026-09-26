# PAF-IAST Science Society - Student Recruitment Portal

Production-ready student recruitment and cabinet application system for the PAF-IAST Science Society (2026–27).

---

## Features
- **Student Application Portal (`/`)**: 
  - Section 1: Personal Details
  - Section 2: General Application Questions
  - Section 3: Team-Specific Conditional Questions (Event Management, Media & Content, Decor & Arts, PR, Content & Editorial, General Secretary, Vice President Male)
  - Direct live submission to Supabase cloud database
- **Admin Application Viewer (`/admin`)**:
  - Secure authentication (Admin ID: `PAFSS26`, Password: `register`)
  - Real-time search across name, registration number, or position
  - Modal view to read entire submission data
  - Immutable application records
- **Single Deployment**:
  - Both the public application form and the private admin dashboard run on the exact same Vercel deployment with built-in SPA rewrites.

---

## Deployment to Vercel

1. Push or import this repository into your [Vercel](https://vercel.com) account.
2. Under **Project Settings > Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://xqhdznhjvgcsguclktsg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaGR6bmhqdmdjc2d1Y2xrdHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0Mzc0MTIsImV4cCI6MjEwNjAxMzQxMn0.x3GeSz_UnraP70ul90jqr59mgV17_p4l41ke4te5yqA`
3. Click **Deploy**.

---

## Database Setup (Supabase)
The database schema and Row Level Security policies are located in `supabase_schema.sql`.
