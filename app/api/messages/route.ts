import { NextRequest, NextResponse } from 'next/server'
import { getMyMessages, sendMessage } from '@/lib/db'
import { MessageInputSchema } from '@/lib/validators'

/**
 * GET /api/messages
 * Get current user's messages
 */
export async function GET() {
  try {
    const result = await getMyMessages()
    
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, data: result.data })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messages
 * Send a new message (role='user')
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = MessageInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await sendMessage(validation.data)
    
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
