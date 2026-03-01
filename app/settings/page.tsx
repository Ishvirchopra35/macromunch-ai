'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type FitnessGoal = 'cut' | 'maintain' | 'bulk'
type CookingSkill = 'beginner' | 'intermediate' | 'advanced'

const dietaryOptions = [
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

export default function SettingsPage() {
  const router = useRouter()

  const [profileId, setProfileId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('maintain')
  const [dailyCalories, setDailyCalories] = useState(2000)
  const [dailyProtein, setDailyProtein] = useState(150)
  const [dailyCarbs, setDailyCarbs] = useState(200)
  const [dailyFat, setDailyFat] = useState(65)
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['None'])
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>('intermediate')

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setEmail(session.user.email ?? '')
      setProfileId(session.user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name ?? '')
        setEmail(profile.email ?? session.user.email ?? '')
        setFitnessGoal((profile.fitness_goal as FitnessGoal) ?? 'maintain')
        setDailyCalories(profile.daily_calories ?? 2000)
        setDailyProtein(profile.daily_protein ?? 150)
        setDailyCarbs(profile.daily_carbs ?? 200)
        setDailyFat(profile.daily_fat ?? 65)
        setDietaryRestrictions(
          Array.isArray(profile.dietary_restrictions) && profile.dietary_restrictions.length > 0
            ? profile.dietary_restrictions
            : ['None']
        )
        setCookingSkill((profile.cooking_skill as CookingSkill) ?? 'intermediate')
      }

      setLoadingProfile(false)
    }

    loadProfile()
  }, [router])

  const toggleDietaryRestriction = (option: string) => {
    if (option === 'None') {
      setDietaryRestrictions(['None'])
      return
    }

    const isSelected = dietaryRestrictions.includes(option)

    if (isSelected) {
      const updated = dietaryRestrictions.filter((item) => item !== option)
      setDietaryRestrictions(updated.length > 0 ? updated : ['None'])
      return
    }

    const withoutNone = dietaryRestrictions.filter((item) => item !== 'None')
    setDietaryRestrictions([...withoutNone, option])
  }

  const handleSaveChanges = async () => {
    if (!profileId || saving) {
      return
    }

    setSaving(true)

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        fitness_goal: fitnessGoal,
        daily_calories: dailyCalories,
        daily_protein: dailyProtein,
        daily_carbs: dailyCarbs,
        daily_fat: dailyFat,
        dietary_restrictions: dietaryRestrictions,
        cooking_skill: cookingSkill,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)

    setShowToast(true)
    setSaving(false)

    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <span
          onClick={() => router.push('/dashboard')}
          className="cursor-pointer text-sm text-zinc-400 hover:text-white"
        >
          ← Dashboard
        </span>
        <p className="gradient-text font-bold">MacroMunch AI</p>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={saving}
          className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-10 pt-24">
        <h1 className="mt-2 text-3xl font-black">Your Profile &amp; Goals</h1>
        <p className="mt-1 mb-8 text-zinc-400">Update your fitness profile and macro targets</p>

        <section className="mb-8">
          <p className="mb-4 text-xs font-semibold tracking-widest text-zinc-500">PERSONAL INFO</p>
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div>
              <label className="block text-sm text-zinc-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 text-white opacity-60"
              />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <p className="mb-4 text-xs font-semibold tracking-widest text-zinc-500">FITNESS GOAL</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: 'cut',
                emoji: '🔥',
                title: 'Lose Fat',
                desc: 'Cut calories, preserve muscle'
              },
              {
                value: 'maintain',
                emoji: '⚖️',
                title: 'Stay Lean',
                desc: 'Maintain weight and performance'
              },
              {
                value: 'bulk',
                emoji: '💪',
                title: 'Build Muscle',
                desc: 'Surplus calories, maximize gains'
              }
            ].map((option) => {
              const selected = fitnessGoal === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFitnessGoal(option.value as FitnessGoal)}
                  className={`rounded-2xl border bg-zinc-900 p-4 text-center ${
                    selected ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800'
                  }`}
                >
                  <p className="text-xl">{option.emoji}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{option.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{option.desc}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <p className="mb-4 text-xs font-semibold tracking-widest text-zinc-500">DAILY MACRO TARGETS</p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400">Daily Calories (kcal)</label>
                <input
                  type="number"
                  value={dailyCalories}
                  onChange={(event) => setDailyCalories(Number(event.target.value))}
                  className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Protein (g)</label>
                <input
                  type="number"
                  value={dailyProtein}
                  onChange={(event) => setDailyProtein(Number(event.target.value))}
                  className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Carbs (g)</label>
                <input
                  type="number"
                  value={dailyCarbs}
                  onChange={(event) => setDailyCarbs(Number(event.target.value))}
                  className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Fat (g)</label>
                <input
                  type="number"
                  value={dailyFat}
                  onChange={(event) => setDailyFat(Number(event.target.value))}
                  className="mt-1 block w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              💡 For cutting: high protein, calorie deficit. For bulking: calorie surplus, plenty of carbs.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <p className="mb-4 text-xs font-semibold tracking-widest text-zinc-500">DIETARY RESTRICTIONS</p>
          <div className="grid grid-cols-3 gap-2">
            {dietaryOptions.map((option) => {
              const selected = dietaryRestrictions.includes(option)

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietaryRestriction(option)}
                  className={`rounded-xl border p-3 text-sm font-medium ${
                    selected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <p className="mb-4 text-xs font-semibold tracking-widest text-zinc-500">COOKING SKILL</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'beginner', emoji: '🥄', label: 'Beginner' },
              { value: 'intermediate', emoji: '👨‍🍳', label: 'Intermediate' },
              { value: 'advanced', emoji: '⭐', label: 'Advanced' }
            ].map((option) => {
              const selected = cookingSkill === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCookingSkill(option.value as CookingSkill)}
                  className={`rounded-2xl border bg-zinc-900 p-4 text-center ${
                    selected ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800'
                  }`}
                >
                  <p className="text-xl">{option.emoji}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{option.label}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-zinc-500">ACCOUNT</p>
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-xl border border-zinc-700 py-2 text-sm hover:bg-zinc-800"
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-black">
          Profile saved!
        </div>
      )}
    </div>
  )
}
