# Portfolio & Blog Platform

A modern portfolio, blog engine, and interactive guestbook built with Nuxt 4, Vue 3, TypeScript, Drizzle ORM, and MySQL.

## Features

- **Modern Editorial Blog Platform**:
  - Full Markdown writing experience with live preview and split-pane view.
  - Cloudinary asset integration: direct uploads for featured header images and inline post media.
  - **Spotlight Hero Section**: Pin up to 3 featured articles at the top of the blog page (`/blog`).
  - **Modular Pagination & Instant Search**: Server-side pagination with query param synchronization and instant title/description search.
  - **Frictionless Guest Discussions**: Readers (both techies and non-techies) can post comments and replies with zero login friction. Guest avatars are dynamically generated via DiceBear Initials.
  - **Multi-Level Reactions**: Toggle emoji reactions (heart, fire, rocket, like, bulb) on articles, comments, and replies without requiring GitHub authentication.
  - **Per-Post Discussion Controls**: Authors can toggle comments on or off per article (reactions-only posts).
  - **Admin Studio**: Dedicated dashboard at `/admin/blog` with draft/publish toggling, quick feature/unfeature controls, editing, and deletion.
- **Interactive Guestbook**:
  - Signatures, GitHub authentication, and canvas drawing pads.
  - Responsive 2-column layout with formatted timestamps.
- **Live Music Streaming**:
  - Real-time Spotify playback widget with automatic Apple Music & YouTube Music link generation.
- **Open-Source Friendly Config**:
  - Centralized site configuration via `app/constants/site.ts` with full environment variable overrides.

## Tech Stack

- **Framework**: Nuxt 4 / Vue 3 (Composition API)
- **Styling**: Tailwind CSS & scoped responsive styles
- **Database & ORM**: MySQL with Drizzle ORM
- **Media Storage**: Cloudinary (for blog images and guestbook drawings)
- **Icons & Avatars**: Nuxt UI, Heroicons, DiceBear API
- **Testing**: Vitest, @nuxt/test-utils

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Generate a stable production secret for OG images with:

```bash
npx nuxt-og-image generate-secret
```

### 3. Database Migrations

Apply migrations to your MySQL database:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Architecture & Code Structure

```text
├── app/
│   ├── components/
│   │   ├── BlogComments.vue       # Discussion thread (guest mode, replies, reactions)
│   │   ├── BlogEditor.vue         # Markdown editor with Cloudinary upload & split preview
│   │   ├── BlogFeaturedHero.vue   # Spotlight hero section (max 3 featured posts)
│   │   ├── BlogPagination.vue     # Modular pagination controls
│   │   ├── BlogPostCard.vue       # Modular article summary card
│   │   └── BlogReactions.vue      # Post-level reaction buttons
│   ├── constants/
│   │   └── site.ts                # Open-source configurable site branding & title helper
│   ├── interfaces/
│   │   └── blog.ts                # TypeScript types for posts, comments, reactions, pagination
│   ├── pages/
│   │   ├── admin/blog/            # Content management dashboard, post creation & editing
│   │   └── blog/                  # Public blog index & article view
│   └── utils/
│       └── avatar.ts              # Modular avatar resolution (DiceBear initials & GitHub)
├── server/
│   ├── api/
│   │   ├── admin/                 # Protected admin endpoints (posts CRUD, image uploads)
│   │   ├── comments/              # Comment & reply reactions
│   │   └── posts/                 # Public posts (paginated + top 3 featured), comments, reactions
│   ├── db/
│   │   └── schema.ts              # Drizzle schema (posts, comments, reactions)
│   └── utils/
│       └── avatar.ts              # Server-side DiceBear avatar generation
```

## Running Tests

```bash
npm run test
```

## Production Build

```bash
npm run build
npm run start
```
