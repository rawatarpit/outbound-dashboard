# Outbound Dashboard

A modern, production-ready React dashboard for the Outbound Engine - an AI-powered B2B outbound sales automation platform.

## Features

- **Dashboard Overview** - Key metrics, pipeline funnel, and activity feed
- **Brand Manager** - Manage multiple brand profiles with discovery and outbound settings
- **Lead Management** - Import, track, and manage leads through the pipeline
- **Pipeline Manager** - Kanban and list views for company pipeline management
- **Discovery Sources** - Configure Apollo, Apify, Hunter, and other data sources
- **Analytics** - Email performance, conversion funnels, and detailed metrics
- **Settings** - LLM, email (SMTP/Resend), and IMAP configuration
- **Team Management** - Invite and manage team members with role-based access
- **Webhooks** - Configure outbound webhooks for system events
- **API Keys** - Generate and manage API keys for programmatic access

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Supabase** for backend (auth, database, RLS)
- **React Router** for routing
- **Recharts** for analytics charts
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Deployment

### Netlify

The project includes `netlify.toml` for automatic deployment. Connect your GitHub repository to Netlify and it will automatically build and deploy.

Make sure to set the environment variables in Netlify's dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── forms/        # Form components
├── contexts/         # React contexts (Auth)
├── lib/             # Utilities, Supabase client, types
└── pages/           # Page components
```

## Database

The dashboard connects to Supabase with Row-Level Security (RLS) enabled. All tables enforce `client_id` isolation - users can only access data belonging to their organization.

See the documentation files for:
- Complete database schema
- RLS policies
- API endpoints
- Edge functions

## License

MIT
