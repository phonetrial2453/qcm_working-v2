# 📚 Quran & Seerat Class Application Manager

A web-based platform to manage student applications for Quran and Seerat classes, with real-time validation, secure authentication, and admin/moderator approval workflow.

---

## ✨ Features

- 📝 **Application Form**: Clean and mobile-friendly form with validation for:
  - Full Name
  - Parent Name
  - Address & Location
  - Mobile & WhatsApp Number
  - Reference (Naqeeb)
  - Class & Age Selection

- 🔐 **Role-Based Access**
  - **Admin**: Full access to manage all applications and moderators
  - **Moderator (Naqeeb)**: Review, approve, or reject students from their area

- 🔄 **Real-Time Validation**
  - Prevent submission if required fields are incomplete or invalid
  - Unique Application ID generation for every form

- 🧾 **Google Sheets Integration**
  - Store all submissions in a Google Sheet with live updates

- 🛡️ **Secure Authentication**
  - Email/password-based login for admins and moderators
  - Option for OTP-based access (if enabled)

- 📊 **Dashboard**
  - Search, filter, and track application statuses
  - Update or modify entries with comments

---

## 🔧 Tech Stack

- **Frontend**: Next.js with TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Forms & Storage**: Google Sheets API
- **Auth Roles**: SuperAdmin, Admin, Moderator (Naqeeb)
- **Hosting**: Vercel / Self-hosted (Docker Compatible)

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/phonetrial2453/quran-seerat-scribe.git
cd quran-seerat-scribe


###Install Dependencies
npm install
# or
yarn install


###Create a .env.local file and configure the following:

SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_SHEET_ID=your-google-sheet-id

###Run the App
npm run dev



##🛠️ Admin Panel Features
View all applications

Filter by status (Pending, Approved, Rejected)

Approve or Reject applications

Add internal comments or feedback

Export data to Excel or PDF (optional feature)

##📌 Future Plans
Email/WhatsApp notifications on approval

Multi-language form support (Urdu/Hindi/English)

Mobile App version (PWA)

Class reminders and attendance logging

