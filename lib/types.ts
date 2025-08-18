// Database table types
export interface Profile {
  id: string
  user_id: string
  full_name?: string
  city?: string
  goal?: 'lose' | 'maintain' | 'gain'
  dietary_prefs?: string[]
  allergies?: string[]
  avatar_url?: string
  role?: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description?: string
  ingredients: any[]
  steps: string[]
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  image_url?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  user_id: string
  name: string
  goal?: 'lose' | 'maintain' | 'gain'
  daily_kcal?: number
  macros?: Record<string, any>
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PlanDay {
  id: string
  plan_id: string
  day_index: number
  breakfast?: string
  lunch?: string
  snack?: string
  dinner?: string
  created_at: string
  updated_at: string
}

export interface WaterLog {
  id: string
  user_id: string
  date: string
  ml: number
  created_at: string
}

export interface WeightLog {
  id: string
  user_id: string
  date: string
  kg: number
  created_at: string
}

export interface Reminders {
  id: string
  user_id: string
  meal_times?: string[]
  water_times?: string[]
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  text: string
  role: 'user' | 'assistant'
  created_at: string
}

// Input payload types
export interface ProfileUpdate {
  full_name?: string
  city?: string
  goal?: 'lose' | 'maintain' | 'gain'
  dietary_prefs?: string[]
  allergies?: string[]
  avatar_url?: string
}

export interface RecipeInput {
  title: string
  description?: string
  ingredients: any[]
  steps: string[]
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  image_url?: string
  is_public?: boolean
}

export interface PlanInput {
  name: string
  goal?: 'lose' | 'maintain' | 'gain'
  daily_kcal?: number
  macros?: Record<string, any>
  is_public?: boolean
}

export interface PlanDayInput {
  day_index: number
  breakfast?: string
  lunch?: string
  snack?: string
  dinner?: string
}

export interface WaterLogInput {
  date: string
  ml: number
}

export interface WeightLogInput {
  date: string
  kg: number
}

export interface RemindersInput {
  meal_times?: string[]
  water_times?: string[]
}

export interface MessageInput {
  text: string
  role?: 'user' | 'assistant'
}

// Result types for database operations
export type Result<T, E = string> = 
  | { ok: true; data: T }
  | { ok: false; error: E }

// Filter types for queries
export interface RecipeFilters {
  search?: string
  min_protein?: number
  max_calories?: number
}

// Chat-specific types
export interface UserWithLatestMessage {
  user_id: string
  full_name?: string
  avatar_url?: string
  latest_message?: {
    text: string
    role: 'user' | 'assistant'
    created_at: string
  }
  unread_count: number
  is_online: boolean
}

export interface ChatThread {
  user_id: string
  full_name?: string
  avatar_url?: string
  messages: Message[]
}
