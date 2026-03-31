# AI Chatbot - T3 Stack

A scalable AI chatbot built with the T3 Stack and Neon (PostgreSQL).

## Features

- Real-time messaging with AI (Llama-3.3-70b-versatile via Groq)
- Secure authentication (Credentials + Google OAuth)
- Neon PostgreSQL for data persistence
- Type-safe APIs with tRPC
- Responsive WhatsApp-like interface
- Dark/Light mode support

## Tech Stack

- **Frontend**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: tRPC v11
- **Database**: Neon PostgreSQL (via Prisma)
- **Auth**: NextAuth.js v5
- **AI**: Groq API (Llama 3)

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

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `GROQ_API_KEY` - From Groq Cloud Platform

Optional for Google OAuth:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. Setup Neon (PostgreSQL)

1. Create a free account at [Neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string from the dashboard
4. Use the pooled connection string for best performance

### 4. Push Prisma Schema

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── chat/              # Chat interface
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
├── lib/                   # Utilities
│   ├── groq.ts           # Groq client
│   ├── prisma.ts        # Prisma client
│   └── trpc.tsx         # tRPC React provider
├── server/
│   └── api/             # tRPC routers
└── styles/              # Global styles
```

## License

MIT
