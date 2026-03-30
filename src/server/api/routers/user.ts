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

  getConversations: protectedProcedure.query(async ({ ctx }) => {
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

  getConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.prisma.conversation.findFirst({
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

      return conversation
    }),

  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.prisma.conversation.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title || 'New Chat',
        },
      })

      return conversation
    }),

  deleteConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.conversation.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      return { success: true }
    }),
})
