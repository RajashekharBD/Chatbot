import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { groq } from '@/lib/groq'

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
      if (!ctx.session?.user?.id) {
        throw new Error('Unauthorized')
      }
      
      const { userMessage, aiMessage } = await ctx.withRLS(async (tx) => {
        const userMsg = await tx.message.create({
          data: {
            conversationId: input.conversationId,
            role: 'user',
            content: input.content,
          },
        })

        await tx.conversation.update({
          where: { id: input.conversationId },
          data: { updatedAt: new Date() },
        })

        const userId = ctx.session!.user.id;
        const conversation = await tx.conversation.findFirst({
          where: {
            id: input.conversationId,
            userId,
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

        const messages = conversation.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

        try {
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

          const aiResponse =
            chatCompletion.choices[0]?.message?.content ||
            'Sorry, I could not generate a response.'

          const aiMsg = await tx.message.create({
            data: {
              conversationId: input.conversationId,
              role: 'assistant',
              content: aiResponse,
            },
          })

          return {
            userMessage: userMsg,
            aiMessage: aiMsg,
          }
        } catch (error) {
          console.error('Groq error:', error)
          throw new Error('Failed to generate AI response')
        }
      })

      return {
        userMessage,
        aiMessage,
      }
    }),
})
