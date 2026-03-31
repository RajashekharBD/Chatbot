# Build Log - Jarvis AI Chatbot

## Build Information
- **Build Date:** March 31, 2026
- **Project:** Jarvis AI Chatbot
- **Tech Stack:** T3 Stack (Next.js 15, tRPC, Prisma, NextAuth)

---

## Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Deploy to Vercel
vercel --prod

---

## Environment Variables Required

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.vercel.app
GROQ_API_KEY=...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## Build Output - Routes

```
Route (app)                                 Size    First Load JS
├ ƒ /                                      162 B   106 kB
├ ○ /_not-found                            994 B   103 kB
├ ƒ /api/auth/[...nextauth]                129 B   102 kB
├ ƒ /api/trpc/[trpc]                       129 B   102 kB
├ ƒ /chat                                 7.5 kB  136 kB
├ ○ /login                                1.6 kB  109 kB
└ ○ /register                            2.51 kB  134 kB

Legend:
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## Dependencies

### Production
- next@^15.0.0
- react@^18.3.0
- react-dom@^18.3.0
- @tanstack/react-query@^5.0.0
- @trpc/client@^11.0.0-rc.602
- @trpc/react-query@^11.0.0-rc.602
- @trpc/server@^11.0.0-rc.602
- @prisma/client@^5.10.0
- next-auth@beta
- bcryptjs@^2.4.3
- groq-sdk@latest
- zod@^3.22.4

### Development
- typescript@^5.3.0
- @types/node@^22.0.0
- @types/react@^18.3.0
- @types/react-dom@^18.3.0
- @types/bcryptjs@^2.4.6
- prisma@^5.10.0
- tailwindcss@^3.4.1
- autoprefixer@^10.4.18
- postcss@^8.4.35

---

## Deployment History

| Date | Commit | Deployment URL | Status |
|------|--------|----------------|--------|
| Mar 31, 2026 | f8008b5 | chatbot-*.vercel.app | Ready |
| Mar 31, 2026 | dce68a0 | chatbot-*.vercel.app | Ready |
| Mar 31, 2026 | ef77df7 | chatbot-*.vercel.app | Ready |

---

## Common Issues & Fixes

### 1. Session not persisting
**Fix:** Ensure `NEXTAUTH_URL` is set to production URL in Vercel env vars

### 2. Groq API errors
**Fix:** Verify `GROQ_API_KEY` is set in Vercel environment variables

### 3. Database connection errors
**Fix:** Run `npx prisma db push` and ensure `DATABASE_URL` is correct

### 4. Build errors
**Fix:** Delete `.next` folder and run `npm run build` again

---

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:push": "prisma db push",
  "db:studio": "prisma studio",
  "postinstall": "prisma generate"
}
```

---

## Database Schema (Neon PostgreSQL)

### Tables
1. **User** - User accounts with email/password
2. **Account** - OAuth accounts (Google)
3. **Session** - Active sessions
4. **VerificationToken** - Email verification
5. **Conversation** - Chat conversations
6. **Message** - Individual messages

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Set user_id function
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS text AS $$
  SELECT current_setting('app.user_id', true)::text;
$$ LANGUAGE sql STABLE;
```

---

## Last Updated
March 31, 2026 - Build log created
