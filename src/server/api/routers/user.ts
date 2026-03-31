import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (exists) {
        throw new Error('User already exists')
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
        },
      })

      return { success: true, userId: user.id }
    }),

  getConversations: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      return []
    }
    
    return ctx.prisma.conversation.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }),

  getConversation: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        return null
      }
      
      return ctx.prisma.conversation.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    }),

  createConversation: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('Unauthorized')
      }
      
      return ctx.prisma.conversation.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title || 'New Chat',
        },
      })
    }),

  deleteConversation: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('Unauthorized')
      }
      
      await ctx.prisma.conversation.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      return { success: true }
    }),
})
