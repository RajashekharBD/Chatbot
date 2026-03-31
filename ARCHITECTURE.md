# Jarvis AI - Architecture Documentation

## 🏗️ T3 Stack Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Next.js 15 App Router                         │   │
│  │                                                                       │   │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐       │   │
│  │   │   /      │    │  /login  │    │/register │    │   /chat  │       │   │
│  │   │ (Landing)│    │   Page   │    │   Page   │    │   Page   │       │   │
│  │   └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘       │   │
│  │        │                │                │                │             │   │
│  │        └────────────────┴────────────────┴────────────────┘             │   │
│  │                               │                                      │   │
│  │                    ┌──────────▼──────────┐                           │   │
│  │                    │  tRPC React Client │                           │   │
│  │                    │   (TanStack Query) │                           │   │
│  │                    └──────────┬──────────┘                           │   │
│  │                               │                                      │   │
│  └───────────────────────────────┼──────────────────────────────────────┘   │
│                                  │ HTTP/REST                                │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────────────┐
│                            SERVER SIDE                                      │
│                                  │                                           │
│  ┌───────────────────────────────▼───────────────────────────────────────┐ │
│  │                         Next.js API Routes                             │ │
│  │                                                                       │ │
│  │   ┌─────────────────────────┐    ┌─────────────────────────────────┐  │ │
│  │   │  /api/auth/[...nextauth] │    │    /api/trpc/[trpc]            │  │ │
│  │   │      NextAuth.js v5      │    │       tRPC Server              │  │ │
│  │   │   (Authentication)       │    │   (Type-Safe API)              │  │ │
│  │   └───────────┬─────────────┘    └───────────────┬─────────────────┘  │ │
│  │               │                                  │                     │ │
│  │               │                                  │                     │ │
│  │   ┌──────────▼──────────┐              ┌────────▼────────────────┐    │ │
│  │   │  Credentials        │              │   Routers:              │    │ │
│  │   │  Provider           │              │   ├─ userRouter         │    │ │
│  │   │  (Email/Password)  │              │   │   └─ register()    │    │ │
│  │   │                     │              │   │   └─ getConversations()│  │ │
│  │   └─────────────────────┘              │   │   └─ createConversation()│ │ │
│  │                                        │   │   └─ deleteConversation()│ │ │
│  │   ┌─────────────────────┐              │   │                       │    │ │
│  │   │  Google OAuth       │              │   │   └─ chatRouter        │    │ │
│  │   │  Provider           │              │   │       └─ sendMessage() │    │ │
│  │   │  (Social Login)     │              │   │                        │    │ │
│  │   └─────────────────────┘              │   └───────────────────────┘    │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
         ┌──────────────────┐              ┌──────────────────────┐
         │   Prisma ORM     │              │     Groq API         │
         │                  │              │                      │
         │   PostgreSQL      │              │   (LLM AI Model)    │
         │   ┌────────────┐ │              │                      │
         │   │   Neon     │ │              │   ┌────────────────┐ │
         │   │   Tech     │ │              │   │ Llama 3.3 70B  │ │
         │   │   Cloud    │ │              │   │ Versatile      │ │
         │   └────────────┘ │              │   └────────────────┘ │
         └──────────────────┘              └──────────────────────┘
```

## 📁 Project File Structure

```
jarvis-ai-chatbot/
│
├── prisma/
│   └── schema.prisma              # Database schema definition
│
├── src/
│   │
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts   # NextAuth handler
│   │   │   ├── trpc/
│   │   │   │   └── [trpc]/
│   │   │   │       └── route.ts   # tRPC handler
│   │   │   └── test/
│   │   │       └── route.ts       # Groq API test endpoint
│   │   │
│   │   ├── chat/                  # Chat pages (protected)
│   │   │   ├── layout.tsx         # Auth check + redirect
│   │   │   └── page.tsx           # Main chat UI
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   │
│   │   └── register/
│   │       └── page.tsx           # Registration page
│   │
│   ├── server/                    # Server-side code
│   │   └── api/
│   │       ├── trpc.ts            # tRPC context & procedures
│   │       ├── root.ts            # Main API router
│   │       └── routers/
│   │           ├── user.ts        # User-related procedures
│   │           └── chat.ts        # Chat & AI procedures
│   │
│   ├── lib/                       # Libraries
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── groq.ts               # Groq SDK client
│   │   └── trpc.tsx              # tRPC React client
│   │
│   ├── types/                     # TypeScript types
│   │   └── next-auth.d.ts         # NextAuth session types
│   │
│   ├── auth.ts                    # NextAuth configuration
│   ├── env.ts                     # Environment variables
│   └── styles/
│       └── globals.css            # Tailwind CSS styles
│
├── .env                           # Environment variables (local)
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
├── tailwind.config.ts             # Tailwind CSS config
└── README.md                      # Documentation
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MESSAGE SEND FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

User types message
        │
        ▼
Chat Page (React)
        │
        │ setMessage()
        ▼
Optimistic Update ──────► Message appears immediately
        │
        │ sendMessage.mutateAsync()
        ▼
tRPC Mutation
        │
        │ http request
        ▼
/api/trpc/chat.sendMessage
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
Prisma: Save User Message          Session Check (NextAuth)
        │                              │
        ▼                              ▼
Prisma: Get Conversation           JWT Token
with Messages                           │
        │                              ▼
        │                       Get User ID from
        │                       Database
        │                              │
        └──────────┬─────────────────┘
                   │
                   ▼
           Groq API Request
           (Llama 3.3 70B)
                   │
                   ▼
           AI Response
                   │
                   ▼
           Prisma: Save AI Message
                   │
                   ▼
           Return to Client
                   │
                   ▼
           Update UI with Response
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────┐
│              User                       │
├─────────────────────────────────────────┤
│ id           : String (PK, CUID)       │
│ email        : String (UNIQUE)          │
│ name         : String?                  │
│ password     : String? (hashed)         │
│ image        : String?                  │
│ emailVerified: DateTime?                │
│ createdAt    : DateTime                 │
│ updatedAt    : DateTime                 │
└───────────────┬─────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────────┐
│           Account                       │
├─────────────────────────────────────────┤
│ id                : String (PK)        │
│ userId            : String (FK)         │
│ type              : String             │
│ provider          : String             │
│ providerAccountId : String             │
│ refresh_token     : String?             │
│ access_token      : String?             │
│ expires_at        : Int?               │
│ token_type        : String?             │
│ scope             : String?             │
│ id_token          : String?             │
│ session_state     : String?             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Session                       │
├─────────────────────────────────────────┤
│ id           : String (PK)             │
│ sessionToken : String (UNIQUE)          │
│ userId       : String (FK)             │
│ expires      : DateTime                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Conversation                    │
├─────────────────────────────────────────┤
│ id        : String (PK)                │
│ userId    : String (FK)                 │
│ title     : String (default: "New Chat")│
│ createdAt : DateTime                   │
│ updatedAt : DateTime                   │
└───────────────┬─────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────────┐
│            Message                      │
├─────────────────────────────────────────┤
│ id             : String (PK)            │
│ conversationId : String (FK)            │
│ role           : String ("user" or      │
│                 :         "assistant")   │
│ content        : String                 │
│ createdAt      : DateTime               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       VerificationToken                 │
├─────────────────────────────────────────┤
│ id         : String (PK)               │
│ identifier : String                     │
│ token      : String (UNIQUE)           │
│ expires    : DateTime                  │
└─────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CREDENTIALS LOGIN FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

User enters email/password
        │
        ▼
signIn('credentials', { email, password })
        │
        ▼
NextAuth Credentials Provider
        │
        ▼
Prisma: Find user by email
        │
        ▼
bcrypt: Compare password
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
Password Match?           Password Mismatch?
        │                      │
        ▼                      ▼
JWT Token Created         Return Error
with user.id
        │
        ▼
Session Created
        │
        ▼
Redirect to /chat
        │
        ▼
chat/layout.tsx
        │
        │ await auth()
        ▼
Check session.user.id
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
Has Session?              No Session
        │                      │
        ▼                      ▼
Show Chat Page           Redirect /login
```

## 🧩 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 | React framework with App Router |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **API** | tRPC v11 | End-to-end type-safe APIs |
| **Auth** | NextAuth.js v5 | Authentication (Credentials + OAuth) |
| **Database** | PostgreSQL (Neon) | Cloud-hosted relational database |
| **ORM** | Prisma v5 | Database access layer |
| **AI** | Groq API (Llama 3.3) | Language model for chat |
| **State** | TanStack Query v5 | Data fetching & caching |
| **Deployment** | Vercel | Hosting platform |
