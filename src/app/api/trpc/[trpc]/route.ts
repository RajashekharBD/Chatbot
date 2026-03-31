import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

export const runtime = 'nodejs'

async function fetchTrpc(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
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
