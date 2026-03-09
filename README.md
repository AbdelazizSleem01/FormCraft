# FormCraft — Dynamic Form Dashboard

A full-stack Next.js dashboard for building, managing, and analyzing dynamic forms stored in MongoDB.

## Features

- 🧱 **Dynamic Form Builder** — add, reorder, and configure form fields with drag & drop
- 🌐 **Website Logo Field** — users enter a URL, logo auto-fetches via Clearbit API
- 💾 **MongoDB persistence** — form schemas and submissions stored in MongoDB
- 📊 **Auto-expanding table** — new columns appear automatically when new fields are added
- 🔍 **Search, sort & filter** — submissions table with full controls
- 📥 **CSV Export** — download all submissions as a CSV
- 🗑️ **CRUD operations** — create, read, update, delete forms and submissions
- ✨ **Premium dark UI** — Syne + DM Sans typography, dark design system

## Field Types Supported

| Type | Description |
|------|-------------|
| `text` | Short text input |
| `email` | Email address |
| `number` | Numeric value |
| `url` | Website URL link |
| `logo` | Website domain → auto-fetches company logo |
| `textarea` | Long text / multiline |
| `select` | Dropdown with custom options |
| `checkbox` | Boolean toggle |
| `date` | Date picker |

## Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Edit `.env.local`:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/form-dashboard

# Or MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/form-dashboard?retryWrites=true&w=majority
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the dashboard automatically.

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forms` | List all form schemas |
| POST | `/api/forms` | Create a new form schema |
| GET | `/api/forms/:id` | Get a form by ID |
| PUT | `/api/forms/:id` | Update a form |
| DELETE | `/api/forms/:id` | Delete a form |
| GET | `/api/submissions` | List all submissions (filter by `?formId=`) |
| POST | `/api/submissions` | Save a new submission |
| DELETE | `/api/submissions/:id` | Delete a submission |

## Project Structure

```
form-dashboard/
├── app/
│   ├── api/
│   │   ├── forms/            # CRUD for form schemas
│   │   └── submissions/      # CRUD for submissions
│   ├── dashboard/
│   │   ├── page.tsx          # Overview stats
│   │   ├── forms/            # Form management
│   │   └── submissions/      # Data table
│   └── form-builder/         # Form builder UI
├── components/
│   ├── FormBuilder.tsx       # Dynamic form builder
│   ├── DynamicForm.tsx       # Form renderer / submission
│   ├── SubmissionsTable.tsx  # Auto-expanding data table
│   ├── LogoDisplay.tsx       # Website logo component
│   ├── Sidebar.tsx           # Navigation
│   ├── TopBar.tsx            # Header
│   └── StatCard.tsx          # Dashboard stat cards
├── lib/
│   ├── mongodb.ts            # Mongoose connection
│   ├── models.ts             # Mongoose models
│   └── utils.ts              # Utilities
└── types/
    └── index.ts              # TypeScript types
```

## Logo Field

When a user creates a "Website Logo" field and someone submits a website URL:
1. The URL is stored in MongoDB as-is
2. On the submissions table, the domain is extracted and a logo is fetched from `logo.clearbit.com`
3. Falls back to Google Favicons if Clearbit fails
4. Falls back to a globe icon if both fail

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Styling**: Tailwind CSS + Custom CSS variables
- **Icons**: Lucide React
- **Fonts**: Syne (display) + DM Sans (body) + DM Mono (code)
