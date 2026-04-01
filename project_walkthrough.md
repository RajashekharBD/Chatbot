# Jarvis AI Chatbot: Technical Walkthrough

This document provides a comprehensive, line-by-line explanation of the entire codebase. We will explore the **T3 Stack**, define key technical terms, and walk through every file in the repository.

---

## 🚀 The Tech Stack: T3 Stack

The **T3 Stack** is a web development framework designed by Theo Browne (t3.gg) that focuses on **simplicity**, **modularity**, and **full-stack type safety**.

### Key Technologies Used:
1. **Next.js 15 (App Router)**: The framework for building modern React applications. It handles routing, server-side rendering (SSR), and static site generation (SSG).
2. **tRPC (v11)**: Allows us to build APIs that are "end-to-end type-safe." This means if you change a piece of data on the server, the frontend will immediately know about it and show a red error if it's used incorrectly.
3. **Prisma**: An **ORM (Object-Relational Mapper)**. It lets us interact with the database using TypeScript code instead of writing raw SQL queries.
4. **NextAuth.js (Auth.js v5)**: A complete open-source authentication solution for Next.js.
5. **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
6. **Zod**: A TypeScript-first schema declaration and validation library. We use it to ensure the data coming into our API is correct.
7. **Groq SDK**: The library used to interact with Groq's high-performance AI models (like Llama 3).

---

## 📖 Key Technical Terms

> [!NOTE]
> Here are some definitions to help you understand the code better:

- **ORM (Object-Relational Mapper)**: A tool that lets you query and manipulate data from a database using an object-oriented paradigm (like TypeScript objects) instead of SQL.
- **Type Safety**: A feature of TypeScript that ensures variables are of the correct "type" (e.g., a number is not treated like a string), preventing bugs before the code even runs.
- **Middleware**: Code that runs *between* a request coming in and the final response going out. For example, checking if a user is logged in before letting them see a chat page.
- **Schema**: A blueprint that defines how data is structured (in a database or in a validation tool like Zod).
- **JWT (JSON Web Token)**: A secure way to transmit information between parties as a JSON object. We use it to keep users logged in.
- **Environment Variables**: Sensitive configuration (like API keys) stored outside the code for security.

---

## 📂 Section 1: Core Configuration (Root Files)

These files set up the foundation of the project, including dependencies, styling, and TypeScript rules.

### 1. `package.json`
*The heart of the project. It lists all dependencies and scripts.*

```json
1: {
2:   "name": "ai-chatbot",
3:   "version": "0.1.0",
4:   "private": true,
```
- **Lines 1-4**: Basic project metadata.

```json
5:   "scripts": {
6:     "dev": "next dev",        // Runs the app in development mode
7:     "build": "next build",    // Prepares the app for production
8:     "start": "next start",    // Runs the production-built app
10:    "db:push": "prisma db push", // Syncs your Prisma schema with the database
11:    "db:studio": "prisma studio", // Opens a visual editor for your database
12:    "postinstall": "prisma generate" // Generates the Prisma client after installing packages
13:   },
```
- **Summary**: Scripts are shortcuts for common commands. `db:push` and `db:studio` are essential for managing your database.

---

### 2. `next.config.js`
*Configures how Next.js behaves.*

```javascript
1: /** @type {import('next').NextConfig} */
2: const nextConfig = {
3:   reactStrictMode: true, // Helps find potential bugs in React components
4:   experimental: {
5:     serverActions: {
6:       bodySizeLimit: '2mb', // Limits the size of data sent to the server (e.g., uploads)
7:     },
8:   },
9: }
```
- **Summary**: This file tells Next.js to be strict with React and sets a limit for server action data.

---

### 3. `tailwind.config.ts`
*Configures the styling system.*

```typescript
4:   content: [
5:     './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
6:     './src/components/**/*.{js,ts,jsx,tsx,mdx}',
7:     './src/app/**/*.{js,ts,jsx,tsx,mdx}',
8:   ],
```
- **Lines 4-8**: Tells Tailwind which files to scan for CSS classes so it only includes the styles you actually use.

```typescript
9:   darkMode: 'class', // Enables dark mode based on a CSS class
10:   theme: {
11:     extend: {
12:       colors: {
13:         background: 'var(--background)', // Uses CSS variables for background colors
14:         foreground: 'var(--foreground)', // Uses CSS variables for text colors
15:       },
16:     },
17:   },
```
- **Summary**: Sets up the color palette and tells Tailwind where your UI code lives.

---

### 4. `tsconfig.json`
*Rules for the TypeScript compiler.*

```json
10:     "strict": true, // Enables all strict type-checking options
24:     "paths": {
25:       "@/*": ["./src/*"] // Allows using "@/" as a shortcut for the "src" folder
28:     },
```
- **Summary**: Ensures high-quality code by being strict and sets up helpful import aliases.

---

### 5. `test-db.ts`
*A small script to check if your database is working.*

```typescript
3: const prisma = new PrismaClient()
8: const userCount = await prisma.user.count()
```
- **Summary**: Creates a database client and tries to count the users. If it works, your database connection is healthy.

---

### 6. `postcss.config.js`
*Configures how CSS is processed.*

```javascript
1: module.exports = {
2:   plugins: {
3:     tailwindcss: {}, // Use Tailwind
4:     autoprefixer: {}, // Add vendor prefixes (like -webkit-, -moz-) automatically
5:   },
6: }
```
- **Summary**: Ensures your styles work across different browsers by adding the necessary prefixes.

---

### 7. `next-env.d.ts`
*TypeScript definitions for Next.js.*

- **Summary**: An auto-generated file that helps TypeScript understand Next.js-specific types like images and CSS modules. Do not edit this file.

---

### 8. `.gitignore`
*Tells Git which files to ignore.*

- **Summary**: Prevents sensitive files (like `.env`) and large folders (like `node_modules`) from being uploaded to GitHub.

---

> [!TIP]
> We have covered the "Plumbing" of the app. Next, we will dive into the **Database Schema** and **Authentication**.

---

## 🏗️ Section 2: Database Layer (Prisma)

Prisma is the bridge between your code and your database. It uses a file called `schema.prisma` to define what your data looks like.

### 1. `prisma/schema.prisma`
*The blueprint of your data.*

```prisma
1: datasource db {
2:   provider = "postgresql"
3:   url      = env("DATABASE_URL")
4: }
```
- **Lines 1-4**: Tells Prisma we are using a **PostgreSQL** database and where to find the connection string (stored in the `.env` file).

```prisma
10: model User {
11:   id            String    @id @default(cuid())
12:   email         String    @unique
13:   name          String?
14:   password      String?
15:   accounts      Account[]
16:   sessions      Session[]
17:   conversations Conversation[]
18: }
```
- **Lines 10-18**: Defines a **User**. Each user has an ID, a unique email, and an optional password. They can have many accounts (if they use Google login), many sessions, and many chat conversations.

```prisma
59: model Conversation {
60:   id        String    @id @default(cuid())
61:   userId    String
62:   user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
63:   title     String    @default("New Chat")
64:   messages  Message[]
65: }
```
- **Lines 59-65**: Defines a **Conversation**. It belongs to a **User** (`userId`). If a user is deleted, their conversations are also deleted (`onDelete: Cascade`).

```prisma
69: model Message {
70:   id             String       @id @default(cuid())
71:   conversationId String
72:   conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
73:   role           String       // Either 'user' or 'assistant'
74:   content        String       // The actual text of the message
75: }
```
- **Lines 69-75**: Defines a **Message**. It has a `role` (who sent it) and `content` (what they said).

---

## 🔐 Section 3: Authentication (Auth.js)

Authentication is how we verify that users are who they say they are. We use **Auth.js** (formerly NextAuth).

### 1. `src/auth.ts`
*The main configuration for security.*

```typescript
6: export const { handlers, auth, signIn, signOut } = NextAuth({
7:   providers: [
8:     Credentials({
```
- **Line 6**: Exports the tools we need to log users in/out and check their session.
- **Line 8**: We use the **Credentials** provider, which means users log in with an email and password.

```typescript
13:       async authorize(credentials) {
16:         const user = await prisma.user.findUnique({
17:           where: { email: credentials.email as string },
18:         })
22:         const passwordMatch = await bcrypt.compare(
23:           credentials.password as string,
24:           user.password
25:         )
29:         return user;
```
- **Lines 13-29**: This logic runs when someone tries to log in. It finds the user in the database, checks if the password matches using `bcrypt` (encryption), and returns the user if everything is correct.

```typescript
38:   session: {
39:     strategy: 'jwt',
40:   },
```
- **Line 39**: Says we're using **JSON Web Tokens** to remember the user between page refreshes.

---

### 2. `src/app/api/auth/[...nextauth]/route.ts`
*The "doorway" for authentication requests.*

```typescript
1: import { handlers } from '@/auth'
3: export const { GET, POST } = handlers
```
- **Summary**: This file sets up the actual web addresses (endpoints) that Auth.js needs to handle login/logout. `GET` is for checking status, and `POST` is for submitting credentials.

---

---

## 🛰️ Section 4: Backend API (tRPC & Groq)

This is the "brain" of the application. It handles user registration, chat history, and the connection to the AI (Groq).

### 1. `src/server/api/trpc.ts`
*The configuration for our API framework.*

```typescript
6: export const createTRPCContext = async () => {
7:   const session = await auth()
8:   return { prisma, session }
9: }
```
- **Lines 6-9**: This function creates the "Context." Every time you make an API request, tRPC prepares the database connection (`prisma`) and the logged-in user's info (`session`) so they are ready to use.

```typescript
32: const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
33:   if (!ctx.session || !ctx.session.user) {
34:     throw new TRPCError({ code: 'UNAUTHORIZED' })
35:   }
36:   return next({ ctx: { ...ctx, session: ctx.session } })
37: })
44: export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
```
- **Lines 32-44**: This is a security check. We create a `protectedProcedure` that only works if the user is logged in. If they aren't, it throws an "UNAUTHORIZED" error.

---

### 2. `src/server/api/routers/user.ts`
*Handles user-related actions like registration and fetching chats.*

```typescript
6:   register: publicProcedure
7:     .input(z.object({ email: z.string(), password: z.string(), name: z.string() }))
14:     .mutation(async ({ ctx, input }) => {
23:       const hashedPassword = await bcrypt.hash(input.password, 10)
25:       const user = await ctx.prisma.user.create({
26:         data: { email: input.email, password: hashedPassword, name: input.name }
27:       })
33:       return { success: true, userId: user.id }
34:     }),
```
- **Lines 6-34**: The **Register** function. It takes user info, hashes (encrypts) the password for security, and saves the user to the database.

---

### 3. `src/server/api/routers/chat.ts`
*The engine that powers the AI chat.*

```typescript
15:     .mutation(async ({ ctx, input }) => {
20:       const userMessage = await ctx.prisma.message.create({
21:         data: { conversationId: input.conversationId, role: 'user', content: input.content }
22:       })
```
- **Lines 15-22**: When you send a message, it first saves your message to the database.

```typescript
56:         const chatCompletion = await groq.chat.completions.create({
57:           model: 'llama-3.3-70b-versatile',
58:           messages: [
59:             { role: 'system', content: 'You are Jarvis...' },
60:             ...messages,
61:           ],
62:         })
```
- **Lines 56-62**: This is the **AI Magic**. It sends your message (and the previous chat history) to Groq's high-speed "Llama 3" model.

```typescript
72:         const aiMessage = await ctx.prisma.message.create({
73:           data: { conversationId: input.conversationId, role: 'assistant', content: aiResponse }
74:         })
```
- **Lines 72-74**: After the AI responds, it saves the AI's message to the database so you can see it in your history later.

---

### 4. `src/lib/groq.ts`
*Initializes the AI client.*

```typescript
4: export const groq = new Groq({
5:   apiKey: env.GROQ_API_KEY,
6: })
```
- **Summary**: This simple file sets up the connection to Groq using your private API key.

---

### 5. `src/server/api/root.ts`
*The "Master" router.*

```typescript
5: export const appRouter = createTRPCRouter({
6:   user: userRouter, // Connect the User router
7:   chat: chatRouter, // Connect the Chat router
8: })
```
- **Summary**: Combines all the different API sections (User, Chat) into one single router that the app can use.

---

### 6. `src/app/api/trpc/[trpc]/route.ts`
*The "Gatekeeper" for API requests.*

```typescript
11:   return fetchRequestHandler({
14:     router: appRouter, // Use the router we defined in root.ts
15:     createContext: () => ({ prisma, session }), // Provide the database and user info
16:   })
```
- **Summary**: This file handles the actual network requests for your API. It connects the URL `/api/trpc` to your TypeScript code.

---

---

## 🎨 Section 5: Frontend (Pages & Components)

This is what you see in the browser. It's built with **React** and styled with **Tailwind CSS**.

### 1. `src/app/layout.tsx`
*The "frame" of your entire website.*

```tsx
5: export const metadata: Metadata = {
6:   title: 'AI Chatbot',
7:   description: 'Your personal AI assistant',
8: }
18: <TRPCReactProvider>{children}</TRPCReactProvider>
```
- **Lines 5-8**: Sets the title and description you see in the browser tab.
- **Line 18**: Wraps the entire app in the `TRPCReactProvider`, which makes our API available everywhere.

---

### 2. `src/app/page.tsx`
*The landing page (the first thing you see).*

```tsx
5: export default async function Home() {
6:   const session = await auth()
8:   if (session) { redirect('/chat') }
```
- **Lines 5-8**: Checks if you are already logged in. If you are, it automatically sends you to the chat page (`/chat`).

```tsx
24:         <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
25:           Jarvis AI
26:         </h1>
```
- **Lines 24-26**: Displays a beautiful, gradient "Jarvis AI" title.

---

### 3. `src/app/chat/page.tsx`
*The main chat interface (most complex file).*

```tsx
22:   const conversations = api.user.getConversations.useQuery(...)
26:   const sendMessage = api.chat.sendMessage.useMutation()
```
- **Lines 22-26**: Fetches your previous chats and prepares the "Send Message" function using our tRPC API.

```tsx
75:   const handleSendMessage = async (e: React.FormEvent) => {
84:       const result = await sendMessage.mutateAsync({
85:         conversationId: currentConversationId,
86:         content: userMessage,
87:       })
```
- **Lines 75-87**: When you click "Send," this function sends your text to the backend and waits for the AI to answer. It then adds both messages to the screen.

---

### 4. `src/app/chat/layout.tsx`
*Protects the chat route.*

```typescript
11:   if (!session) {
12:     redirect('/login') // If not logged in, boot out to login page
13:   }
```
- **Summary**: Ensures that nobody can access the `/chat` page unless they are logged in.

---

### 5. `src/components/providers.tsx`
*Sets up the React "Context".*

```tsx
11: export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
40:     <api.Provider client={trpcClient} queryClient={queryClient}>
41:       <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
```
- **Summary**: This file wraps your app in all the necessary "Providers" (tRPC, React Query) so that your components can fetch data and manage state easily.

---

### 6. `src/app/login/page.tsx` & `register/page.tsx`
*The entry points for users.*

- **Login**: Uses `signIn('credentials', ...)` to check your email and password.
- **Register**: Uses `api.user.register.mutate(...)` to create your account in the database.

---

### 7. `src/types/next-auth.d.ts`
*Extends user types.*

```typescript
1: declare module "next-auth" {
2:   interface Session {
3:     user: { id: string } & DefaultSession["user"]
4:   }
5: }
```
- **Summary**: Tells TypeScript that our "User" object in the session includes a unique `id` field, which isn't there by default.

---

### 8. `src/styles/globals.css`
*The global styling rules.*

```css
5: :root {
6:   --background: #ffffff;
7:   --foreground: #1a1a1a;
8: }
10: .dark {
11:   --background: #1a1a1a;
12:   --foreground: #ffffff;
13: }
```
- **Summary**: Defines the "Light Mode" and "Dark Mode" colors throughout the app.

---

## 🛠️ Section 6: Utilities & Libraries

Helper files that make the rest of the code cleaner.

### 1. `src/lib/prisma.ts`
*Prevents multiple database connections.*

```typescript
7: export const prisma = globalForPrisma.prisma ?? new PrismaClient()
```
- **Summary**: In development, Next.js reloads frequently. This file ensures we don't accidentally create thousands of connections to the database, which would crash it.

---

### 2. `src/lib/trpc.tsx`
*Sets up the "bridge" for the frontend.*

```typescript
32:         httpBatchLink({
33:           url: '/api/trpc',
34:         }),
```
- **Summary**: Tells the frontend where to find the tRPC backend (`/api/trpc`).

---

### 3. `src/env.ts`
*Safety check for secrets.*

```typescript
4:   DATABASE_URL: process.env.DATABASE_URL!,
9:   GROQ_API_KEY: process.env.GROQ_API_KEY!,
```
- **Summary**: Ensures your database URL and AI key are actually set. If they are missing, the app will let you know instead of crashing mysteriously.

---

---

## 🔍 Section 7: Technical Analysis & Modern Architecture

After analyzing your current codebase, here is a breakdown of the design patterns and potential areas for "Next-Level" updates.

### 1. The Power of Groq + Llama 3
By using **Groq**, your chatbot is significantly faster than standard OpenAI implementations. Groq's LPU (Language Processing Unit) architecture allows for near-instant inference, which is perfect for a real-time "Jarvis" assistant.

### 2. State Management (tRPC + React Query)
- **The Pattern**: You are using `api.user.getConversations.useQuery` inside your components.
- **Why it works**: tRPC handles the fetching, while React Query handles the **caching**. If you switch between chats and come back, the data is still there instantly.

### 3. Identity & Security
- **JWT Strategy**: Your `auth.ts` uses the `jwt` strategy. This makes your app stateless and highly scalable, as the server doesn't need to look up a session ID in the database for every single request.
- **Password Safety**: You use `bcryptjs` for one-way hashing, ensuring that even if the database is compromised, user passwords remain secure.

### 4. 🚀 Future "Jarvis" Improvements
If you want to take this project even further, here are the "Pro" updates I recommend:
1. **AI Streaming**: Currently, the user waits for the entire AI response to finish. We could update this to **stream** words one by one (like ChatGPT), making it feel even faster.
2. **Infinite Loading**: For users with hundreds of chats, we could add "infinite scroll" to the sidebar using tRPC's `useInfiniteQuery`.
3. **Voice Integration**: Since Jarvis is known for voice, we could integrate the **Web Speech API** for hands-free interaction.
4. **Tool Use (Function Calling)**: We could teach Jarvis to actually "do" things (like check the weather or search the web) using Groq's tool-calling capabilities.

---

## ✅ Conclusion

You now have a fully functional, highly optimized, AI-powered chatbot! 🤖
- **Next.js 15** handles the modern routing.
- **Prisma + Neon PostgreSQL** provides a flexible and scalable memory.
- **tRPC** provides the safest possible communication between your frontend and backend.
- **Groq + Llama 3** provides world-class intelligence with industry-leading speed.

**What to do next?**
You can ask me to implement one of the **Future Improvements** listed above, or we can dive deeper into any specific line of code!
