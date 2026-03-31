import { NextResponse } from 'next/server'

export async function GET() {
  // Explicitly read the env variable at runtime
  const apiKey = process.env.GROQ_API_KEY || ''
  
  return NextResponse.json({
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 12),
    keySuffix: apiKey.substring(apiKey.length - 6),
    isDefined: !!apiKey,
    rawValue: apiKey,
  })
}
