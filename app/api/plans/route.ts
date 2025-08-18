import { NextRequest, NextResponse } from 'next/server'
import { listPublicPlans, createPlan } from '@/lib/db'
import { PlanInputSchema } from '@/lib/validators'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/plans
 * List public plans and user's own plans
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get public plans
    const publicPlansResult = await listPublicPlans()
    if (!publicPlansResult.ok) {
      return NextResponse.json(
        { ok: false, error: publicPlansResult.error },
        { status: 400 }
      )
    }

    // Get user's own plans
    const { data: myPlans, error: myPlansError } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (myPlansError) {
      return NextResponse.json(
        { ok: false, error: myPlansError.message },
        { status: 400 }
      )
    }

    const allPlans = [...publicPlansResult.data, ...(myPlans || [])]
    
    return NextResponse.json({ ok: true, data: allPlans })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/plans
 * Create a new meal plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = PlanInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await createPlan(validation.data)
    
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

