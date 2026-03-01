'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type FitnessGoal = 'cut' | 'maintain' | 'bulk'
type CookingSkill = 'beginner' | 'intermediate' | 'advanced'

const fitnessGoalOptions: {
  goal: FitnessGoal
  emoji: string
  title: string
  desc: string
}[] = [
  {
    goal: 'cut',
    emoji: '🔥',
    title: 'Lose Fat',
    desc: 'Cut calories, preserve muscle'
  },
  {
    goal: 'maintain',
    emoji: '⚖️',
    title: 'Stay Lean',
    desc: 'Maintain weight and performance'
  },
  {
    goal: 'bulk',
    emoji: '💪',
    title: 'Build Muscle',
    desc: 'Surplus calories, maximize gains'
  }
]

const cookingSkillOptions: {
  skill: CookingSkill
  emoji: string
  title: string
  desc: string
}[] = [
  {
    skill: 'beginner',
    emoji: '🥄',
    title: 'Beginner',
    desc: 'Simple recipes, minimal prep, under 20 mins'
  },
  {
    skill: 'intermediate',
    emoji: '👨‍🍳',
    title: 'Intermediate',
    desc: 'Comfortable with most techniques, 20-40 mins'
  },
  {
    skill: 'advanced',
    emoji: '⭐',
    title: 'Advanced',
    desc: 'Enjoy complex recipes, any prep time'
  }
]

const restrictionOptions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Halal',
  'Kosher',
  'Nut-Free',
  'Low-Sodium'
]

export default function OnboardingPage() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('maintain')
  const [calories, setCalories] = useState(2000)
  const [protein, setProtein] = useState(150)
  const [carbs, setCarbs] = useState(200)
  const [fat, setFat] = useState(65)
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['None'])
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>('intermediate')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
      }
    }

    checkSession()
  }, [router])

  const progressWidth = `${(currentStep / 4) * 100}%`
  const isFinalStep = currentStep === 4

  const toggleRestriction = (option: string) => {
    if (option === 'None') {
      setDietaryRestrictions(['None'])
      return
    }

    const hasOption = dietaryRestrictions.includes(option)

    if (hasOption) {
      const next = dietaryRestrictions.filter((item) => item !== option)
      setDietaryRestrictions(next.length > 0 ? next : ['None'])
      return
    }

    const withoutNone = dietaryRestrictions.filter((item) => item !== 'None')
    setDietaryRestrictions([...withoutNone, option])
  }

  const handleContinue = async () => {
    setError('')

    if (!isFinalStep) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    setLoading(true)

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        fitness_goal: fitnessGoal,
        daily_calories: calories,
        daily_protein: protein,
        daily_carbs: carbs,
        daily_fat: fat,
        dietary_restrictions: dietaryRestrictions,
        cooking_skill: cookingSkill,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleBack = () => {
    setError('')
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-lg px-6 py-12">
        <p className="gradient-text text-2xl font-bold">MacroMunch AI</p>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Step {currentStep} of 4</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <div className="mt-8">
          {currentStep === 1 && (
            <div>
              <h1 className="text-2xl font-bold">What&apos;s your main goal?</h1>
              <p className="mt-1 mb-6 text-sm text-zinc-400">
                This shapes every meal we suggest
              </p>

              <div className="grid grid-cols-1 gap-3">
                {fitnessGoalOptions.map((option) => {
                  const isSelected = fitnessGoal === option.goal

                  return (
                    <button
                      key={option.goal}
                      type="button"
                      onClick={() => setFitnessGoal(option.goal)}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{option.title}</p>
                        <p className="text-sm text-zinc-400">{option.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h1 className="text-2xl font-bold">Set your daily macro targets</h1>
              <p className="mt-1 mb-6 text-sm text-zinc-400">
                You can always change these later
              </p>

              <div className="mb-4">
                <label className="mb-1 block text-sm text-zinc-400">Daily Calories kcal</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(event) => setCalories(Number(event.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm text-zinc-400">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(event) => setProtein(Number(event.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm text-zinc-400">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(event) => setCarbs(Number(event.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm text-zinc-400">Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(event) => setFat(Number(event.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h1 className="text-2xl font-bold">Any dietary restrictions?</h1>
              <p className="mt-1 mb-6 text-sm text-zinc-400">
                Select all that apply — we&apos;ll never suggest meals you can&apos;t eat
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {restrictionOptions.map((option) => {
                  const isSelected = dietaryRestrictions.includes(option)

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleRestriction(option)}
                      className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-medium ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-800 bg-zinc-900 text-white'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h1 className="text-2xl font-bold">How confident are you in the kitchen?</h1>
              <p className="mt-1 mb-6 text-sm text-zinc-400">
                We&apos;ll match recipe complexity to your skill level
              </p>

              <div className="grid grid-cols-1 gap-3">
                {cookingSkillOptions.map((option) => {
                  const isSelected = cookingSkill === option.skill

                  return (
                    <button
                      key={option.skill}
                      type="button"
                      onClick={() => setCookingSkill(option.skill)}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{option.title}</p>
                        <p className="text-sm text-zinc-400">{option.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && isFinalStep ? 'Setting up your profile...' : 'Continue'}
          </button>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          {currentStep > 1 && (
            <p
              onClick={handleBack}
              className="mt-3 cursor-pointer text-center text-sm text-zinc-500 hover:text-white"
            >
              Back
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
