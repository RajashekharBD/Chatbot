import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function GET() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: 'Say hello in one word',
        },
      ],
      max_tokens: 10,
    })

    const response = chatCompletion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      response,
      model: chatCompletion.model,
      usage: chatCompletion.usage,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
    })
  }
}
