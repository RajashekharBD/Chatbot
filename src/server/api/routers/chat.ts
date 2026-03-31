import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import Groq from 'groq-sdk'

const CONTEXT_MESSAGES = 10

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Session:', JSON.stringify(ctx.session))
      
      if (!ctx.session?.user?.id) {
        console.log('No user ID in session')
        throw new Error('Unauthorized - No user session')
      }
      
      const userMessage = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'user',
          content: input.content,
        },
      })

      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      })

      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
        include: {
          messages: {
            take: CONTEXT_MESSAGES,
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const messages = conversation.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

      try {
        console.log('About to create Groq instance')
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        })
        console.log('Groq instance created')

        console.log('About to call Groq API with messages:', messages.length)
        const chatCompletion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are Jarvis, a helpful AI assistant. Be concise, friendly, and helpful.',
            },
            ...messages,
          ],
          max_tokens: 1000,
          temperature: 0.7,
        })

        const aiResponse = chatCompletion.choices[0]?.message?.content

        if (!aiResponse) {
          throw new Error('Empty response from Groq API')
        }

        const aiMessage = await ctx.prisma.message.create({
          data: {
            conversationId: input.conversationId,
            role: 'assistant',
            content: aiResponse,
          },
        })

        return {
          userMessage,
          aiMessage,
        }
      } catch (error) {
        console.error('Groq error:', error)
        if (error instanceof Error) {
          throw new Error(`AI Error: ${error.message}`)
        }
        throw new Error('Failed to generate AI response')
      }
    }),
})
