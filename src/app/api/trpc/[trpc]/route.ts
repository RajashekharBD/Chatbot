import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'

export const runtime = 'nodejs'

async function fetchTrpc(req: Request) {
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
      console.error(`❌ tRPC Error on ${path}:`, error.message)
    },
  })
}

export async function GET(req: Request) {
  return fetchTrpc(req)
}

export async function POST(req: Request) {
  return fetchTrpc(req)
}
