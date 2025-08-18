import { NextRequest, NextResponse } from 'next/server'
import { getMyReminders, upsertReminders } from '@/lib/db'
import { RemindersInputSchema } from '@/lib/validators'

/**
 * GET /api/reminders
 * Get current user's reminders grouped by type
 */
export async function GET() {
  try {
    const result = await getMyReminders()
    
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      )
    }

    // Group reminders by type for better organization
    const groupedReminders = {
      meal_times: result.data?.meal_times || [],
      water_times: result.data?.water_times || []
    }

    return NextResponse.json({ ok: true, data: groupedReminders })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reminders
 * Create or update user's reminders (upsert)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = RemindersInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await upsertReminders(validation.data)
    
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

