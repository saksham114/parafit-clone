import { createClient } from '@/lib/supabase-browser'
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
 * Get the current user's profile (Client-side)
 */
export async function getMyProfile(): Promise<Result<Profile | null>> {
  try {
    const supabase = createClient()
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
 * Create or update the current user's profile (Client-side)
 */
export async function upsertMyProfile(payload: ProfileUpdate): Promise<Result<Profile>> {
  try {
    const supabase = createClient()
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
 * List recipes with optional filters (Client-side)
 */
export async function listRecipes(filters: RecipeFilters = {}): Promise<Result<Recipe[]>> {
  try {
    const supabase = createClient()
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
 * Get a recipe by ID (Client-side)
 */
export async function getRecipe(id: string): Promise<Result<Recipe>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
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
 * Create a new recipe (Client-side)
 */
export async function createRecipe(input: RecipeInput): Promise<Result<Recipe>> {
  try {
    const supabase = createClient()
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
 * Update a recipe (Client-side)
 */
export async function updateRecipe(id: string, input: Partial<RecipeInput>): Promise<Result<Recipe>> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('recipes')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: 'Failed to update recipe' }
  }
}

/**
 * Delete a recipe (Client-side)
 */
export async function deleteRecipe(id: string): Promise<Result<void>> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: 'Failed to delete recipe' }
  }
}

/**
 * Get the current user's messages (Client-side)
 */
export async function getMyMessages(): Promise<Result<Message[]>> {
  try {
    const supabase = createClient()
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
 * Send a new message (Client-side)
 */
export async function sendMessage(input: MessageInput): Promise<Result<Message>> {
  try {
    const supabase = createClient()
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
 * Get the current user's reminders (Client-side)
 */
export async function getMyReminders(): Promise<Result<Reminders>> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { ok: false, error: error.message }
    }

    return { ok: true, data: data || { user_id: user.id, meal_times: [], water_times: [] } }
  } catch (error) {
    return { ok: false, error: 'Failed to fetch reminders' }
  }
}

/**
 * Create or update the current user's reminders (Client-side)
 */
export async function upsertReminders(input: RemindersInput): Promise<Result<Reminders>> {
  try {
    const supabase = createClient()
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
 * Check if the current user has admin role (Client-side)
 */
export async function requireAdminRole(): Promise<Result<Profile>> {
  try {
    const supabase = createClient()
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
 * Get all users with their latest messages for admin support (Client-side)
 */
export async function getUsersWithLatestMessages(): Promise<Result<UserWithLatestMessage[]>> {
  try {
    const supabase = createClient()
    
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
 * Get a complete chat thread for a specific user (Client-side)
 */
export async function getChatThread(targetUserId: string): Promise<Result<ChatThread>> {
  try {
    const supabase = createClient()
    
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
 * Send a message as admin (role='assistant') (Client-side)
 */
export async function sendAdminMessage(userId: string, text: string): Promise<Result<Message>> {
  try {
    const supabase = createClient()
    
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
