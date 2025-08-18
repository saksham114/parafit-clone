import { NextRequest, NextResponse } from 'next/server'
import { getPlanWithDays } from '@/lib/db'
import { PlanInputSchema } from '@/lib/validators'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/plans/[id]
 * Get plan details with plan_days count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getPlanWithDays(params.id)
    
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      )
    }

    if (!result.data.plan) {
      return NextResponse.json(
        { ok: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Add plan_days count to the response
    const planWithCount = {
      ...result.data.plan,
      days_count: result.data.days.length
    }

    return NextResponse.json({ ok: true, data: planWithCount })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/plans/[id]
 * Update plan (only if owner or admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = PlanInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if user owns the plan
    const { data: plan, error: fetchError } = await supabase
      .from('plans')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !plan) {
      return NextResponse.json(
        { ok: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update plan
    const { data, error } = await supabase
      .from('plans')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/plans/[id]
 * Delete plan (only if owner or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user owns the plan
    const { data: plan, error: fetchError } = await supabase
      .from('plans')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !plan) {
      return NextResponse.json(
        { ok: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete plan (plan_days will be cascaded if RLS is set up properly)
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, data: null })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

