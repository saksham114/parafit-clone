import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const result = await requireAdminRole()
    
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 403 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: { role: result.data.role }
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
