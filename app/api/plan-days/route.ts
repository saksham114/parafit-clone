import { NextRequest, NextResponse } from 'next/server'
import { upsertPlanDays } from '@/lib/db'
import { PlanDayInputSchema } from '@/lib/validators'
import { z } from 'zod'

// Schema for the request body (array of plan days with plan_id)
const PlanDaysBulkSchema = z.object({
  plan_id: z.string().min(1, 'Plan ID is required'),
  days: z.array(PlanDayInputSchema).min(1, 'At least one day is required')
})

/**
 * POST /api/plan-days
 * Bulk upsert plan days for a plan the user owns
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = PlanDaysBulkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { plan_id, days } = validation.data

    const result = await upsertPlanDays(plan_id, days)
    
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

