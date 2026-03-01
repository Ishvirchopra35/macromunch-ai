'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function MealPlanPage() {
  const router = useRouter()

  const [mealPlan, setMealPlan] = useState<Record<string, any>>({})
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getWeekDate = (dayIndex: number) => {
    const today = new Date()
    const currentDay = today.getDay()
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    const targetDate = new Date(monday)
    targetDate.setDate(monday.getDate() + dayIndex)
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  useEffect(() => {
    const loadPageData = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setSession(session)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profile)

      const savedMealPlan = localStorage.getItem('macromunch_mealplan')
      if (savedMealPlan) {
        try {
          const parsed = JSON.parse(savedMealPlan)
          setMealPlan(parsed)
        } catch {
          setMealPlan({})
        }
      }

      setLoadingProfile(false)
    }

    loadPageData()
  }, [router])

  const generatePlan = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      const { plan } = await response.json()
      setMealPlan(plan)
      localStorage.setItem('macromunch_mealplan', JSON.stringify(plan))
    } catch {
      // no-op
    } finally {
      setGenerating(false)
    }
  }

  const today = new Date()
  const currentDay = today.getDay()
  const todayIndex = currentDay === 0 ? 6 : currentDay - 1

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <span
          onClick={() => router.push('/dashboard')}
          className="cursor-pointer text-sm text-zinc-400 hover:text-white"
        >
          ← Dashboard
        </span>
        <p className="text-white font-bold">MacroMunch AI</p>
        <button
          type="button"
          onClick={generatePlan}
          disabled={generating || !profile || !session}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Plan'}
        </button>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10 pt-24">
        <h1 className="text-3xl font-black">Weekly Meal Plan</h1>
        <p className="mt-1 mb-8 text-zinc-400">Your personalized week of eating</p>

        {loadingProfile ? (
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-800" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-7 md:gap-3">
            {Object.keys(mealPlan).length === 0 ? (
              <div className="md:col-span-7">
                <p className="mt-16 text-center text-lg font-semibold text-zinc-400">No meal plan yet</p>
                <p className="mx-auto mt-2 max-w-sm text-center text-sm text-zinc-600">
                  Hit Generate Plan to get a personalized week of meals based on your macros and goals.
                </p>
              </div>
            ) : (
              days.map((day, dayIndex) => {
                const dayPlan = mealPlan[day]
                const isToday = dayIndex === todayIndex

                return (
                  <div
                    key={day}
                    className={`rounded-2xl bg-zinc-900 p-4 ${isToday ? 'border-2 border-emerald-500' : 'border border-zinc-800'}`}
                  >
                    <p className="text-sm font-bold text-white">{dayLabels[dayIndex]}</p>
                    <p className="text-xs text-zinc-500">{getWeekDate(dayIndex)}</p>

                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">BREAKFAST</p>
                        {dayPlan?.breakfast ? (
                          <div className="mt-1 rounded-lg bg-zinc-800 p-2">
                            <p className="text-xs font-medium leading-tight text-white">{dayPlan.breakfast.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {dayPlan.breakfast.calories}cal · {dayPlan.breakfast.protein}g P
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 p-3 text-lg text-zinc-600 hover:border-zinc-500">
                            +
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">LUNCH</p>
                        {dayPlan?.lunch ? (
                          <div className="mt-1 rounded-lg bg-zinc-800 p-2">
                            <p className="text-xs font-medium leading-tight text-white">{dayPlan.lunch.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {dayPlan.lunch.calories}cal · {dayPlan.lunch.protein}g P
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 p-3 text-lg text-zinc-600 hover:border-zinc-500">
                            +
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">DINNER</p>
                        {dayPlan?.dinner ? (
                          <div className="mt-1 rounded-lg bg-zinc-800 p-2">
                            <p className="text-xs font-medium leading-tight text-white">{dayPlan.dinner.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {dayPlan.dinner.calories}cal · {dayPlan.dinner.protein}g P
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 p-3 text-lg text-zinc-600 hover:border-zinc-500">
                            +
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}
