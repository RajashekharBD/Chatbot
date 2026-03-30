# AI Chatbot - T3 Stack

A scalable AI chatbot built with the T3 Stack and MongoDB.

## Features

- Real-time messaging with AI (GPT-3.5-turbo)
- Secure authentication (Credentials + Google OAuth)
- MongoDB for data persistence
- Type-safe APIs with tRPC
- Responsive WhatsApp-like interface
- Dark/Light mode support

## Tech Stack

- **Frontend**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: tRPC
- **Database**: MongoDB (via Prisma)
- **Auth**: NextAuth.js v5
- **AI**: OpenAI API

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

- `DATABASE_URL` - MongoDB Atlas connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `OPENAI_API_KEY` - From OpenAI Platform

Optional for Google OAuth:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. Setup MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free M0 tier works)
3. Create a database user
4. Get your connection string from "Connect" > "Connect your application"
5. Replace `<password>` with your database user password

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
│   ├── openai.ts         # OpenAI client
│   ├── prisma.ts        # Prisma client
│   └── trpc.tsx         # tRPC React provider
├── server/
│   └── api/             # tRPC routers
└── styles/              # Global styles
```

## License

MIT
