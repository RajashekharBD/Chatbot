import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/auth'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'

export const createTRPCContext = async () => {
  const session = await auth()

  return {
    prisma,
    session,
    // Helper to run Prisma queries with RLS context
    withRLS: async <T>(callback: (tx: typeof prisma) => Promise<T>): Promise<T> => {
      if (!session?.user?.id) {
        return callback(prisma);
      }
      return prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL app.user_id = '${session.user.id}'`);
        return callback(tx as any);
      });
    },
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
