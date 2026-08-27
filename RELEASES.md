# 🚀 Release History & Changelog

All notable changes to the **Vertex Client CRM Suite** will be documented in this file.

---

## [v1.0.0] - 2026-08-27 — Initial Production Release

### 🌟 New Features & Core Architecture

#### 1. 🌓 Zero-FOUC Dark Mode & 3D Interactive Mesh
* Implemented synchronous inline `<head>` execution script to prevent theme flash (FOUC) on SSR page loads.
* Designed dynamic 3D canvas particle constellation with mouse-reactive parallax.
* Added floating 3D glossy badge tiles for **WhatsApp**, **Messenger**, and **Instagram**.
* Extended Tailwind palette with `#172033` (`slate-850`) for seamless contrast across tables, search bars, and modals.

#### 2. 🌍 Bilingual Arabic (RTL) & English (LTR) Localization
* Full native RTL/LTR layout flipping based on active language selection.
* Centralized translation system with 300+ entries covering all navigation, dashboard KPIs, forms, and validation alerts.
* Instant client-side language switching without page reloads.

#### 3. 🔐 Enterprise Authentication & Email OTP System
* Standard password sign-in with bcrypt hash verification.
* Passwordless **6-digit Email OTP** login powered by secure Gmail SMTP SSL.
* In-app **Forgot Password** reset flow with 60-second cooldown timers and single-use token invalidation.
* **Edge Middleware Guard (`middleware.ts`)** protecting all `/dashboard`, `/conversations`, `/leads`, `/orders`, `/channels`, `/usage`, `/settings`, and `/profile` routes.
* Multi-alias cookie eraser (`crm_client_token` & `vertex_client_token`) ensuring zero session retention after logout.

#### 4. 📊 Real-Time Operations Dashboard
* Live KPI StatCards for Conversations, New Leads, Confirmed Bookings, and Plan Usage.
* Monthly Chat Quota Meter with multi-stage color thresholds (Emerald, Amber, Rose).
* Chronological Customer Activity stream with relative timestamps and channel identifiers.
* Quick action shortcuts for fast navigation.

#### 5. 💬 Omnichannel Conversation Drawer
* Unified customer message logs with channel badges.
* Slide-in chat timeline drawer rendering full chronological message histories.
* Clear visual distinction between inbound customer messages and outbound AI replies.

#### 6. 🎯 Lead & Booking Fulfillment Pipelines
* Filterable lead table with comprehensive status pipeline (`New`, `Contacted`, `Qualified`, `Waiting`, `Booked`, `Converted`, `Lost`, `Closed`).
* Customer booking payload inspection with service breakdown, scheduled appointment time, location, and price.
* In-modal status updates, staff assignments, and timestamped note-taking.

#### 7. ⚙️ Service Configuration & Knowledge Base CRUD
* Business service descriptions, pricing guidelines, coverage area rules, and fallback responses.
* Escalation keyword triggers and human agent handoff phone configuration.
* Categorized Knowledge Base section management (Add, Edit, Enable/Disable, Delete) to feed AI response context.

#### 8. ⚡ Instant Feedback & Loading Transitions
* Global top laser progress bar giving millisecond visual feedback on all link clicks.
* Centered holographic database loading modals for zero perceived latency during async queries.

---

<div align="center">
  <sub>Released by <b>QX-Devs</b> • Vertex Automation Suite</sub>
</div>
