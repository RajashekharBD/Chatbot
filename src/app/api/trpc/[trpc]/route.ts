import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'

export const runtime = 'nodejs'

export async function handler(req: Request) {
  try {
    const session = await auth()
    
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => ({
        prisma,
        session,
      }),
      transformer: superjson,
      onError: ({ path, error }) => {
        console.error(`❌ tRPC Error on ${path}:`, error.message, error.stack)
      },
    })
  } catch (error) {
    console.error('❌ Handler Error:', error)
    throw error
  }
}

export { handler as GET, handler as POST }
