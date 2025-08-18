import { z } from 'zod'

// Profile update validation
export const ProfileUpdateSchema = z.object({
  full_name: z.string().optional(),
  city: z.string().optional(),
  goal: z.enum(['lose', 'maintain', 'gain']).optional(),
  dietary_prefs: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  avatar_url: z.string().url().optional(),
})

// Recipe input validation
export const RecipeInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ingredients: z.array(z.any()).min(1, 'At least one ingredient is required'),
  steps: z.array(z.string()).min(1, 'At least one step is required'),
  calories: z.number().positive().optional(),
  protein: z.number().positive().optional(),
  carbs: z.number().positive().optional(),
  fat: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  is_public: z.boolean().optional(),
})

// Plan input validation
export const PlanInputSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  goal: z.enum(['lose', 'maintain', 'gain']).optional(),
  daily_kcal: z.number().positive().optional(),
  macros: z.record(z.any()).optional(),
  is_public: z.boolean().optional(),
})

// Plan day input validation
export const PlanDayInputSchema = z.object({
  day_index: z.number().int().min(0, 'Day index must be 0 or greater'),
  breakfast: z.string().optional(),
  lunch: z.string().optional(),
  snack: z.string().optional(),
  dinner: z.string().optional(),
})

// Water log input validation
export const WaterLogInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  ml: z.number().positive('Water amount must be positive'),
})

// Weight log input validation
export const WeightLogInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  kg: z.number().positive('Weight must be positive'),
})

// Reminders input validation
export const RemindersInputSchema = z.object({
  meal_times: z.array(z.string()).optional(),
  water_times: z.array(z.string()).optional(),
})

// Message input validation
export const MessageInputSchema = z.object({
  text: z.string().min(1, 'Message text is required'),
})

// Type exports for use in other files
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>
export type RecipeInput = z.infer<typeof RecipeInputSchema>
export type PlanInput = z.infer<typeof PlanInputSchema>
export type PlanDayInput = z.infer<typeof PlanDayInputSchema>
export type WaterLogInput = z.infer<typeof WaterLogInputSchema>
export type WeightLogInput = z.infer<typeof WeightLogInputSchema>
export type RemindersInput = z.infer<typeof RemindersInputSchema>
export type MessageInput = z.infer<typeof MessageInputSchema>

