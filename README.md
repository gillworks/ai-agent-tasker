# AI Task Manager

A Next.js application for managing AI-assisted coding tasks.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- A local or remote instance of the AI Task API running

## Environment Setup

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
API_BASE_URL=http://localhost:8000  # or your API URL
```

## Database Setup

The application requires the following Supabase tables:

- tasks
- projects
- agents

Make sure to set up the appropriate schema and constraints, including the `check_status` constraint for task statuses:

```sql
ALTER TABLE tasks
ADD CONSTRAINT check_status
CHECK (status IN ('draft', 'pending', 'running', 'complete', 'failed'));
```

## Task Status Flow

1. Tasks start in "draft" status when created
2. When "Run Task" is clicked:
   - Task is sent to the AI Task API
   - Status changes to "pending"
   - API task ID is stored
3. Background polling checks task status every 5 seconds:
   - "pending" → "running" → "complete" or "failed"
   - Feature branch is updated when available
4. Polling continues until task reaches terminal status ("complete" or "failed")

## Features

- Task management with AI integration
- Project organization
- Agent assignment
- Real-time status updates via polling
- GitHub integration for feature branches
- Dark/Light mode support

## Tech Stack

- Next.js 14
- TypeScript
- Supabase
- Tailwind CSS
- Lucide Icons
- Shadcn/ui Components

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)

## Deployment

The application can be deployed on [Vercel](https://vercel.com) or any other Next.js-compatible hosting platform.

Make sure to configure the environment variables in your deployment environment.
