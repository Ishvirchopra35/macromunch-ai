type FitnessGoal = 'cut' | 'bulk' | 'maintain'
type CookingSkill = 'beginner' | 'intermediate' | 'advanced'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  fitness_goal: FitnessGoal
  dietary_restrictions: string[]
  disliked_foods: string[]
  cooking_skill: CookingSkill
  is_pro: boolean
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Ingredient {
  id: string
  user_id: string
  name: string
  quantity?: string
  unit?: string
  created_at: string
}

export interface SavedMeal {
  id: string
  user_id: string
  name: string
  recipe: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  ingredients: string[]
  created_at: string
}

export interface MessageCount {
  id: string
  user_id: string
  date: string
  count: number
}
