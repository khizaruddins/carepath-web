# CarePath Web — Patient Health Vault (Milestone 1)

> **Positioning:** *Your health. Your records. Your next step.*

CarePath Web is the patient-facing frontend for **CarePath Milestone 1: Patient Health Vault**. It provides a secure, calm, and trustworthy environment for patients to organize, review, verify, and maintain their personal medical records, health indicators, and care chronology.

---

## 🏥 Product Design Philosophy

CarePath is engineered around healthcare realities rather than generic SaaS design tropes. It deliberately avoids:
- Artificial AI aesthetics (neon glow, purple gradients, floating blobs, giant decorative cards).
- Low-density layouts with excessive whitespace.
- Communicating critical health information through color alone.

### Core Design Principles

1. **Patient Trust & Privacy**: Visual presentation conveys stability and medical-grade security.
2. **Clinical Clarity**: Medical data, dates, and dosages are easy to scan with tabular numerals and clear labels.
3. **Calm & Cognitive Ease**: Restrained palette designed to comfort patients managing stressful health journeys.
4. **Information Density**: Efficient screens allowing patients to view complete records without endless scrolling.
5. **Accessibility (WCAG 2.1 AA)**: High contrast, discernible focus rings, screen-reader friendly form controls, and mobile responsiveness.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Client Boundaries)
- **UI Library**: React 19, TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with healthcare design system tokens
- **Data Fetching & Cache**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/) (applied semantically)
- **Testing**: Jest 29 & React Testing Library (22 tests)

---

## 📂 Project Structure

```text
carepath-web/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public trust & information pages
│   │   │   ├── page.tsx           # Home / Vault overview
│   │   │   ├── how-it-works/      # Document verification explanation
│   │   │   ├── patients/          # Patient benefits & vault ownership
│   │   │   ├── doctors/           # Clinician perspective (read-only for M1)
│   │   │   ├── security/          # Encryption & HIPAA-aligned posture
│   │   │   ├── about/             # Mission & team philosophy
│   │   │   └── contact/           # Support & inquiries
│   │   │
│   │   ├── (auth)/                # Secure authentication flows
│   │   │   ├── login/             # Email & password login (+ demo accounts)
│   │   │   ├── register/          # Account registration with role selection
│   │   │   ├── verify/            # Email verification token entry
│   │   │   ├── forgot-password/   # Password reset request
│   │   │   └── reset-password/    # Secure token-based password reset
│   │   │
│   │   └── app/                   # Patient Health Vault application
│   │       ├── dashboard/         # Vault overview, quick stats, recent records
│   │       ├── profile/           # Clinical profile (demographics, conditions, meds, allergies)
│   │       ├── documents/         # Record repository, search, filter, categorization
│   │       │   └── [id]/          # Secure viewer, metadata review, signed URL download
│   │       ├── timeline/          # Chronological medical history
│   │       ├── activity/          # Immutable security & audit log
│   │       └── settings/          # Security settings & active sessions
│   │
│   ├── components/
│   │   ├── layout/                # Shell, Header, Sidebar, BottomNav, PublicNavbar
│   │   ├── ui/                    # Reusable design system primitives
│   │   │   ├── Button.tsx         # Primary, secondary, outline, destructive, ghost
│   │   │   ├── Input.tsx          # With icons, error states, password toggle
│   │   │   ├── Select.tsx         # Accessible dropdown selector
│   │   │   ├── Badge.tsx          # Status indicators (neutral, success, warning, error, brand)
│   │   │   ├── Card.tsx           # Dense, bordered container
│   │   │   ├── Dialog.tsx         # Accessible modal dialog with focus trap
│   │   │   ├── Tabs.tsx           # Accessible tab navigation
│   │   │   ├── EmptyState.tsx     # Calm empty states with clear CTAs
│   │   │   ├── LoadingState.tsx   # Skeletons & spinners
│   │   │   └── ErrorMessage.tsx   # Clear error alerts with retry
│   │   └── documents/
│   │       └── DocumentUploadModal.tsx  # Multi-step upload, OCR review & confirmation
│   │
│   └── lib/
│       ├── api/                   # Typed API client calling NestJS backend
│       │   ├── client.ts          # Fetch wrapper, JWT refresh interceptor
│       │   ├── auth.ts            # Auth & session endpoints
│       │   ├── patients.ts        # Patient profile endpoints
│       │   ├── documents.ts       # Document upload, metadata & signed URL retrieval
│       │   ├── timeline.ts        # Medical chronology endpoints
│       │   └── audit.ts           # Access & audit logs
│       ├── auth-context.tsx       # Auth provider & route protection
│       └── utils.ts               # Formatting, cn helper, date helpers
│
└── __tests__/                     # Unit & integration test suites
```

---

## 📄 Document Upload & Confirmation Workflow

The patient is the ultimate authority over their health records. The upload pipeline follows this workflow:

1. **File Selection**: Client validates format (PDF, JPG, JPEG, PNG) and size limit (25MB).
2. **Secure Upload & OCR Hook**: File is sent via `multipart/form-data` to `/api/v1/documents`. The backend processes the document through an OCR provider abstraction.
3. **Patient Review Step**: Extracted text, dates, title, provider name, and clinic are displayed.
4. **Correction & Confirmation**: The patient can edit any field. Confirming flags `isPatientConfirmed: true`.
5. **Timeline Integration**: An immutable `HealthTimelineEvent` is recorded in the patient's medical chronology.
6. **Zero Public Storage Exposure**: Documents are accessed exclusively via short-lived signed URLs generated on demand with an access audit log entry.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v20+` (tested on Node v23.3.0)
- CarePath Backend running on `http://localhost:3000`

### 1. Install Dependencies

```bash
cd carepath/carepath-web
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will start on **`http://localhost:3001`**. API requests to `/api/v1/*` are automatically proxied to the backend at `http://localhost:3000/api/v1/*` via `next.config.js`.

### 3. Run Tests

```bash
npm test
```

Runs the 22 automated Jest & React Testing Library tests covering design system components, authentication flows, document upload workflows, and patient profile management.

### 4. Build for Production

```bash
npm run build
```

Generates an optimized static and SSR production build with zero TypeScript or linting errors.

---

## 🔒 Security Model

- **Authentication**: JWT access tokens stored in memory/session, secure refresh token rotation handled automatically by API client interceptor.
- **Backend Authorization**: RBAC (`PATIENT`, `DOCTOR`, `ADMIN`) and patient ownership rules enforced strictly by the backend `AccessControlService`.
- **Short-Lived Signed URLs**: Medical documents are never publicly accessible via static bucket links.
- **Audit Logs**: All logins, profile edits, document uploads, downloads, and view attempts generate immutable audit logs available in `/app/activity`.
