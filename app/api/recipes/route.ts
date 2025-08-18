import { NextRequest, NextResponse } from 'next/server'
import { listRecipes, createRecipe } from '@/lib/db'
import { RecipeInputSchema } from '@/lib/validators'

/**
 * GET /api/recipes
 * List recipes with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      search: searchParams.get('search') || undefined,
      minProtein: searchParams.get('minProtein') ? Number(searchParams.get('minProtein')) : undefined,
      maxCalories: searchParams.get('maxCalories') ? Number(searchParams.get('maxCalories')) : undefined,
    }

    // Validate numeric parameters
    if (filters.minProtein !== undefined && (isNaN(filters.minProtein) || filters.minProtein < 0)) {
      return NextResponse.json(
        { ok: false, error: 'minProtein must be a positive number' },
        { status: 400 }
      )
    }

    if (filters.maxCalories !== undefined && (isNaN(filters.maxCalories) || filters.maxCalories < 0)) {
      return NextResponse.json(
        { ok: false, error: 'maxCalories must be a positive number' },
        { status: 400 }
      )
    }

    const result = await listRecipes(filters)
    
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
 * POST /api/recipes
 * Create a new recipe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = RecipeInputSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await createRecipe(validation.data)
    
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

