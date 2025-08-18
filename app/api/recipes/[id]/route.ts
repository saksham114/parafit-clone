import { NextRequest, NextResponse } from 'next/server'
import { getRecipe } from '@/lib/db'
import { RecipeInputSchema } from '@/lib/validators'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/recipes/[id]
 * Get recipe details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getRecipe(params.id)
    
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { ok: false, error: 'Recipe not found' },
        { status: 404 }
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
 * PATCH /api/recipes/[id]
 * Update recipe (only if creator or admin)
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
    const validation = RecipeInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if user owns the recipe
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !recipe) {
      return NextResponse.json(
        { ok: false, error: 'Recipe not found' },
        { status: 404 }
      )
    }

    if (recipe.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update recipe
    const { data, error } = await supabase
      .from('recipes')
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
 * DELETE /api/recipes/[id]
 * Delete recipe (only if creator or admin)
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

    // Check if user owns the recipe
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !recipe) {
      return NextResponse.json(
        { ok: false, error: 'Recipe not found' },
        { status: 404 }
      )
    }

    if (recipe.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete recipe
    const { error } = await supabase
      .from('recipes')
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

