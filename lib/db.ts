import { createClient } from '@/lib/supabase-server'
import type {
  Profile,
  ProfileUpdate,
  Recipe,
  RecipeInput,
  RecipeFilters,
  Plan,
  PlanInput,
  PlanDay,
  PlanDayInput,
  WaterLog,
  WaterLogInput,
  WeightLog,
  WeightLogInput,
  Reminders,
  RemindersInput,
  Message,
  MessageInput,
  UserWithLatestMessage,
  ChatThread,
  Result,
} from '@/lib/types'

/**
 * Get the current user's profile
 */
export async function getMyProfile(): Promise<Result<Profile | null>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch profile' }
  }
}

/**
 * Create or update the current user's profile
 */
export async function upsertMyProfile(payload: ProfileUpdate): Promise<Result<Profile>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, ...payload })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to upsert profile' }
  }
}

/**
 * List recipes with optional filters
 */
export async function listRecipes(filters: RecipeFilters = {}): Promise<Result<Recipe[]>> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('recipes')
      .select('*')
      .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id)

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }
    if (filters.min_protein) {
      query = query.gte('protein', filters.min_protein)
    }
    if (filters.max_calories) {
      query = query.lte('calories', filters.max_calories)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch recipes' }
  }
}

/**
 * Get a specific recipe by ID
 */
export async function getRecipe(id: string): Promise<Result<Recipe | null>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .or(`is_public.eq.true,user_id.eq.${user?.id}`)
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch recipe' }
  }
}

/**
 * Create a new recipe
 */
export async function createRecipe(input: RecipeInput): Promise<Result<Recipe>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert({ user_id: user.id, ...input })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to create recipe' }
  }
}

/**
 * List public meal plans
 */
export async function listPublicPlans(): Promise<Result<Plan[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch plans' }
  }
}

/**
 * Get a plan with its associated days
 */
export async function getPlanWithDays(planId: string): Promise<Result<{ plan: Plan; days: PlanDay[] }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .or(`is_public.eq.true,user_id.eq.${user?.id}`)
      .single()

    if (planError) {
      return { ok: false, error: planError.message }
    }

    // Get plan days
    const { data: days, error: daysError } = await supabase
      .from('plan_days')
      .select('*')
      .eq('plan_id', planId)
      .order('day_index')

    if (daysError) {
      return { ok: false, error: daysError.message }
    }

    return { ok: true, data: { plan, days: days || [] } }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch plan with days' }
  }
}

/**
 * Create a new meal plan
 */
export async function createPlan(input: PlanInput): Promise<Result<Plan>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('plans')
      .insert({ user_id: user.id, ...input })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to create plan' }
  }
}

/**
 * Upsert plan days for a specific plan
 */
export async function upsertPlanDays(planId: string, days: PlanDayInput[]): Promise<Result<PlanDay[]>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    // Verify plan ownership
    const { data: plan } = await supabase
      .from('plans')
      .select('user_id')
      .eq('id', planId)
      .single()

    if (!plan || plan.user_id !== user.id) {
      return { ok: false, error: 'Plan not found or access denied' }
    }

    // Prepare days with plan_id
    const daysWithPlanId = days.map(day => ({ ...day, plan_id: planId }))

    const { data, error } = await supabase
      .from('plan_days')
      .upsert(daysWithPlanId, { onConflict: 'plan_id,day_index' })
      .select()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    return { ok: false, error: 'Failed to upsert plan days' }
  }
}

/**
 * Get water intake for the last 30 days
 */
export async function getWater30d(): Promise<Result<WaterLog[]>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('track_water')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch water logs' }
  }
}

/**
 * Add a water intake log
 */
export async function addWater(input: WaterLogInput): Promise<Result<WaterLog>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('track_water')
      .insert({ user_id: user.id, ...input })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to add water log' }
  }
}

/**
 * Get weight logs for the last 30 days
 */
export async function getWeight30d(): Promise<Result<WeightLog[]>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('track_weight')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch weight logs' }
  }
}

/**
 * Add a weight log
 */
export async function addWeight(input: WeightLogInput): Promise<Result<WeightLog>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('track_weight')
      .insert({ user_id: user.id, ...input })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to add weight log' }
  }
}

/**
 * Get the current user's reminders
 */
export async function getMyReminders(): Promise<Result<Reminders | null>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch reminders' }
  }
}

/**
 * Create or update the current user's reminders
 */
export async function upsertReminders(input: RemindersInput): Promise<Result<Reminders>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('reminders')
      .upsert({ user_id: user.id, ...input })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to upsert reminders' }
  }
}

/**
 * Get the current user's messages
 */
export async function getMyMessages(): Promise<Result<Message[]>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch messages' }
  }
}

/**
 * Send a new message
 */
export async function sendMessage(input: MessageInput): Promise<Result<Message>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    // Set default role to 'user' if not provided
    const messageData = {
      user_id: user.id,
      text: input.text,
      role: input.role || 'user'
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to send message' }
  }
}

/**
 * Check if the current user has admin role
 */
export async function requireAdminRole(): Promise<Result<Profile>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (error || !data) {
      return { ok: false, error: 'Admin access required' }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to verify admin role' }
  }
}

/**
 * Get all users with their latest messages for admin support
 */
export async function getUsersWithLatestMessages(): Promise<Result<UserWithLatestMessage[]>> {
  try {
    const supabase = await createClient()
    
    // First verify admin role
    const adminCheck = await requireAdminRole()
    if (!adminCheck.ok) {
      return adminCheck
    }

    // Get all users with their latest message and unread count
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        avatar_url,
        messages!inner(
          text,
          role,
          created_at
        )
      `)
      .order('messages.created_at', { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    // Transform the data to match our interface
    const usersWithMessages: UserWithLatestMessage[] = data.map((profile: any) => {
      const messages = profile.messages || []
      const latestMessage = messages[0]
      
      return {
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        latest_message: latestMessage ? {
          text: latestMessage.text,
          role: latestMessage.role,
          created_at: latestMessage.created_at
        } : undefined,
        unread_count: messages.filter((m: any) => m.role === 'user').length,
        is_online: false // Will be updated with real-time data
      }
    })

    return { ok: true, data: usersWithMessages }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch users with messages' }
  }
}

/**
 * Get a complete chat thread for a specific user
 */
export async function getChatThread(targetUserId: string): Promise<Result<ChatThread>> {
  try {
    const supabase = await createClient()
    
    // Verify admin role
    const adminCheck = await requireAdminRole()
    if (!adminCheck.ok) {
      return adminCheck
    }

    // Get the target user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .eq('user_id', targetUserId)
      .single()

    if (profileError || !profile) {
      return { ok: false, error: 'User not found' }
    }

    // Get all messages for this user
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return { ok: false, error: messagesError.message }
    }

    return {
      ok: true,
      data: {
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        messages: messages || []
      }
    }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch chat thread' }
  }
}

/**
 * Send a message as admin (role='assistant')
 */
export async function sendAdminMessage(userId: string, text: string): Promise<Result<Message>> {
  try {
    const supabase = await createClient()
    
    // Verify admin role
    const adminCheck = await requireAdminRole()
    if (!adminCheck.ok) {
      return adminCheck
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        text,
        role: 'assistant'
      })
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to send admin message' }
  }
}
