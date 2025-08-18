import { NextRequest, NextResponse } from 'next/server'
import { getMyProfile, upsertMyProfile } from '@/lib/db'
import { ProfileUpdateSchema } from '@/lib/validators'

/**
 * GET /api/me
 * Get current user's profile, creating one if it doesn't exist
 */
export async function GET() {
  try {
    const result = await getMyProfile()
    
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
 * PATCH /api/me
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = ProfileUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await upsertMyProfile(validation.data)
    
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

