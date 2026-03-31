# AI Chatbot - T3 Stack

A scalable AI chatbot built with the T3 Stack and Supabase PostgreSQL.

## Features

- **Real-time AI Chat**: Llama-3.3-70b-versatile via Groq for intelligent responses.
- **Secure Authentication**: NextAuth.js (Credentials + Google OAuth).
- **Supabase PostgreSQL**: High-performance database with connection pooling.
- **Row-Level Security (RLS)**: Strict database-level isolation so users can only access their own data.
- **Type-safe API**: Full end-to-end type safety with tRPC v11.
- **Modern UI**: Responsive WhatsApp-style interface with Dark Mode.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **ORM**: [Prisma](https://prisma.io)
- **API**: [tRPC v11](https://trpc.io)
- **Auth**: [NextAuth.js v5](https://authjs.dev)
- **AI**: [Groq](https://groq.com) (Llama 3.3)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: Supabase URL (Transaction mode - Port 6543)
- `DIRECT_URL`: Supabase URL (Session mode - Port 5432)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GROQ_API_KEY`: From [Groq Console](https://console.groq.com)

Optional for Google OAuth:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. Database Setup (Supabase)

1. Create a project at [Supabase](https://supabase.com).
2. Go to **Project Settings > Database** to get your connection strings.
3. Run migrations to setup the schema:
   ```bash
   npx prisma db push
   ```
4. **Enable Row-Level Security (RLS)**:
   Run the SQL script in `setup-rls.sql` in your Supabase SQL Editor to enforce data isolation at the database level.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Security: Row-Level Security

This project uses **Database-Level Protection**. Even if a malicious user bypasses the application code, the database itself will block access to messages belonging to other users.

- **Forced RLS**: Policies are enabled on `Conversation` and `Message` tables.
- **Isolation**: Verified using `auth.user_id()` session variables within Prisma transactions.

## Deployment to Vercel

1. Push code to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel dashboard.
4. **Important**: Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
5. Deploy.

## License

MIT
