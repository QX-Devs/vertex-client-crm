# 🚀 Vertex Client CRM Portal

<div align="center">

![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)
![Dark Mode](https://img.shields.io/badge/Dark%20Mode-Zero--FOUC-10B981?style=for-the-badge)
![i18n](https://img.shields.io/badge/i18n-Arabic%20%7C%20English-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**The unified client-facing portal for business owners to manage AI-driven conversations, track qualified leads, fulfill customer bookings, monitor channel health, and configure knowledge bases across WhatsApp, Instagram, and Messenger.**

[✨ Features](#-key-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Quick Start](#-quick-start) • [⚙️ Environment](#️-environment-variables) • [📁 Project Structure](#-project-structure) • [📖 API Reference](#-api-endpoints)

</div>

---

## 🌟 Key Features

### 1. 🌓 Zero-FOUC Dark & Light Theme System
* **Instant Detection**: Synchronous inline `<head>` script inspects `localStorage` or system settings before initial paint, eliminating white-screen flashes (FOUC).
* **Cybernetic Glass Aesthetics**: Glassmorphic cards (`backdrop-blur-xl`), animated neon 3D floating channel badges (WhatsApp, Messenger, Instagram), and interactive mouse-following spotlights.
* **Accessible Color Contrasts**: Fully tuned palette supporting deep slate backgrounds (`#172033`, `#0f172a`), glowing emerald highlights, and high-contrast text.

### 2. 🌍 Bilingual Arabic (RTL) & English (LTR) Localization
* **Native RTL/LTR**: Dynamic switching between Arabic (`ar-JO`) and English (`en-US`) with instantaneous layout flipping (`dir="rtl"` / `dir="ltr"`).
* **Comprehensive Translations**: Over 300+ keys translating all portal modules, buttons, error messages, placeholders, and tooltips.

### 3. 🔐 Multi-Factor Auth, Email OTP & Edge Guards
* **Multiple Sign-in Modes**: Standard email/password authentication or passwordless **6-digit Email OTP**.
* **Self-Service Password Reset**: Email verification flow with cooldown timers and secure SHA-256 code hashing.
* **Edge Middleware Guard (`middleware.ts`)**: Server-side JWT validation on edge runtime protecting all portal routes against unauthorized access.
* **Clean Logout**: Immediate, multi-alias cookie purging across all domain paths.

### 4. 📊 Real-Time Operations Dashboard
* **Dynamic KPIs**: Total conversations, captured leads, confirmed bookings, and monthly chat usage percentage.
* **Smart Usage Quota Meter**: Visual threshold meter (Emerald `< 80%`, Amber `80-99%`, Rose `100%`) with quota warning alerts.
* **Live Customer Activity Stream**: Chronological feed of incoming customer inquiries with channel identifiers and relative timestamps.

### 5. 💬 Multi-Channel Conversation Timeline Drawer
* **Omnichannel Inbox**: Unified view of WhatsApp, Facebook Messenger, and Instagram Direct customer threads.
* **Slide-In Timeline Panel**: Right/Left slide-in drawer showing chronological customer messages, inbound/outbound alignments, and captured order indicators.

### 6. 🎯 Lead Management & Booking Pipeline
* **Full Status Lifecycle**: Manage leads across `New`, `Contacted`, `Qualified`, `Waiting`, `Booked`, `Converted`, `Lost`, and `Closed`.
* **Booking Details**: Inspect customer payload (service type, area/location, scheduled date/time, total price, and notes).
* **Staff Assignment & Timestamped Notes**: Assign team members and append timestamped notes to lead records.

### 7. ⚙️ Service Configuration & Knowledge Base CRUD
* **AI Business Rules**: Direct form controls for service descriptions, pricing rules, coverage areas, fallback responses, escalation keywords, and human agent phone numbers.
* **Knowledge Base Sections**: Add, edit, toggle, and delete categorized knowledge base sections powering automated AI bot responses.

### 8. ⚡ Instant Interactive Loading Modals & Laser Bar
* **Instant Top-Bar Laser**: Millisecond click confirmation with an emerald laser stream across the top of the browser.
* **Glass Database Modals**: Centered holographic loader with database pulse animations during asynchronous data fetches.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
* **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
* **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom `@tailwindcss/forms` & arbitrary slate palettes
* **Database**: [PostgreSQL](https://www.postgresql.org/) (Supabase Cloud Pool via `pg` singleton)
* **Security & JWT**: [jose](https://github.com/panva/jose) (HS256) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Mailing**: [Nodemailer](https://nodemailer.com/) (Secure Gmail SMTP SSL/TLS)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
vertex-client-crm/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx               # 3D Animated Login, OTP modal & Password Reset
│   ├── (portal)/
│   │   ├── layout.tsx                   # Authenticated Portal Shell (Sidebar, Header, Laser)
│   │   ├── loading.tsx                  # Next.js Suspense Fallback Loading Modal
│   │   ├── dashboard/page.tsx           # KPI Cards, Quota Meter & Activity Stream
│   │   ├── conversations/page.tsx       # Omnichannel Table & Slide-in Chat Drawer
│   │   ├── leads/page.tsx               # Lead Management Pipeline & Notes History
│   │   ├── orders/page.tsx              # Order Fulfillment & Booking Modals
│   │   ├── channels/page.tsx            # WhatsApp, Instagram & Messenger Status
│   │   ├── usage/page.tsx               # Plan Limits & Monthly History Chart
│   │   ├── settings/page.tsx            # AI Configuration & Knowledge Base CRUD
│   │   └── profile/page.tsx             # Business Details & Account Security Info
│   ├── api/
│   │   ├── auth/                        # Login, Logout, Me, Send-Code, Verify-Code, Reset
│   │   └── client/                      # Dashboard, Conversations, Leads, Orders, Settings...
│   ├── globals.css                      # Base Tailwind layers, animations & dark utilities
│   └── layout.tsx                       # Root Layout with Blocking Theme Script
├── components/
│   ├── layout/
│   │   ├── ClientHeader.tsx             # Sticky Glass Header, Language & Dark Mode Toggles
│   │   ├── ClientSidebar.tsx            # RTL/LTR Responsive Nav Sidebar
│   │   ├── NavigationProgress.tsx       # Instant Click Laser Bar
│   │   └── StatCard.tsx                 # KPI Display Containers
│   └── ui/
│       ├── AnimatedBackground.tsx       # 3D Interactive Canvas & Floating Channel Orbs
│       ├── LoadingModal.tsx             # Holographic Database Loading Modal
│       ├── Modal.tsx                    # Reusable Glassmorphic Popup Container
│       ├── StatusBadge.tsx              # High-contrast Status Pills
│       ├── ThemeToggle.tsx              # Sun/Moon Animated Switch
│       └── LanguageSwitcher.tsx         # EN/AR Flag Switcher
├── lib/
│   ├── auth.ts                          # JWT Signing, Cookie Setting & Request Guards
│   ├── db.ts                            # PostgreSQL Singleton Connection Pool
│   ├── email.ts                         # Gmail SMTP Transporter & Template Generator
│   ├── i18n.ts                          # Bilingual Arabic/English Translation Dictionary
│   ├── LanguageContext.tsx              # Context Provider for Language & Direction
│   ├── ThemeContext.tsx                 # Context Provider for Light/Dark/System Theme
│   └── types.ts                         # Domain Interfaces & Token Payload Types
├── middleware.ts                        # Edge Route Guard & Server-Side Redirection
├── tailwind.config.js                   # Extended Color Palettes & Keyframe Animations
└── package.json                         # Project Manifest & Scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Supabase PostgreSQL Connection (Shared with Admin CRM)
POSTGRES_HOST=db.your-supabase-id.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-postgres-password
DATABASE_URL=postgresql://postgres:your-postgres-password@db.your-supabase-id.supabase.co:5432/postgres?sslmode=require

# Client Portal Authentication & Security
JWT_SECRET=your-64-character-hex-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Gmail SMTP Email Configuration (Password Reset & OTP Login)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-gmail-app-password
SMTP_FROM="Vertex CRM <your-email@gmail.com>"
```

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js**: v18.17+ or v20+
* **npm** or **yarn** / **pnpm**
* **PostgreSQL Database** (e.g. Supabase)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/QX-Devs/vertex-client-crm.git

# Enter project directory
cd vertex-client-crm

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The Client Portal will start at: **[http://localhost:3001](http://localhost:3001)**

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 📖 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Authenticate with email & password | No |
| `POST` | `/api/auth/send-code` | Dispatch 6-digit OTP code to email | No |
| `POST` | `/api/auth/verify-code-login` | Verify OTP code and issue JWT cookie | No |
| `POST` | `/api/auth/reset-password` | Reset password using verified email OTP | No |
| `POST` | `/api/auth/logout` | Clear authentication cookies | Yes |
| `GET`  | `/api/auth/me` | Fetch active user profile and client info | Yes |
| `GET`  | `/api/client/dashboard` | KPI statistics, quota meters, and activity | Yes |
| `GET`  | `/api/client/conversations` | Paginated conversation records & threads | Yes |
| `GET`  | `/api/client/leads` | Filterable lead pipeline records | Yes |
| `PUT`  | `/api/client/leads/[id]` | Update lead status, staff, and notes | Yes |
| `GET`  | `/api/client/orders` | Confirmed bookings and fulfillment data | Yes |
| `PUT`  | `/api/client/orders/[id]` | Update booking status and notes | Yes |
| `GET`  | `/api/client/channels` | Connected channel platform health | Yes |
| `GET`  | `/api/client/usage` | Plan chat limits and 3-month history | Yes |
| `GET`  | `/api/client/settings` | Retrieve AI guidelines and Knowledge Base | Yes |
| `PUT`  | `/api/client/settings` | Save service rules or manage KB sections | Yes |
| `GET`  | `/api/client/profile` | View business profile settings | Yes |
| `PUT`  | `/api/client/profile` | Update owner details, timezone, and tone | Yes |

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js dev server on port `3001` |
| `npm run build` | Compiles optimized production build with edge middleware |
| `npm run start` | Serves production build on port `3001` |
| `npm run lint` | Runs Next.js ESLint validation |
| `npm run type-check` | Validates TypeScript types across entire codebase |

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <sub>Built by <b>QX-Devs</b> • Vertex Automation CRM Suite</sub>
</div>
