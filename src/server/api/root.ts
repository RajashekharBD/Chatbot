import { createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from './routers/user'
import { chatRouter } from './routers/chat'

export const appRouter = createTRPCRouter({
  user: userRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
