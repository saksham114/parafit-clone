import { NextRequest, NextResponse } from 'next/server'
import { getWeight30d, addWeight } from '@/lib/db'
import { WeightLogInputSchema } from '@/lib/validators'

/**
 * GET /api/track/weight
 * Get weight logs for the last 30 days
 */
export async function GET() {
  try {
    const result = await getWeight30d()
    
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
 * POST /api/track/weight
 * Add a weight log
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = WeightLogInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await addWeight(validation.data)
    
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

