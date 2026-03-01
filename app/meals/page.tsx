'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Meal {
  id: string
  user_id: string
  name: string
  recipe: string
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  created_at: string
}

export default function MealsPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMeals = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('saved_meals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setMeals((data as Meal[]) ?? [])
      setLoading(false)
    }

    loadMeals()
  }, [router])

  const handleDelete = async (mealId: string) => {
    await supabase.from('saved_meals').delete().eq('id', mealId)
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
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
        <p className="text-white font-bold">MacroMunch AI</p>
        <div className="w-20" />
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10 pt-24">
        <h1 className="text-3xl font-black">🍽️ Saved Meals</h1>
        <p className="mt-1 mb-8 text-zinc-400">Your personal recipe library</p>

        {loading ? (
          <div className="mt-20 text-center text-zinc-400">Loading your meals...</div>
        ) : meals.length === 0 ? (
          <div className="mt-20">
            <p className="text-center text-6xl">🍽️</p>
            <h2 className="mt-4 text-center text-xl font-bold">No saved meals yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-center text-zinc-400">
              When MacroMunch suggests a recipe you love, hit &apos;+ Save this meal&apos; to add it
              here.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black hover:bg-emerald-400"
              >
                Go to Chat →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700"
              >
                <h2 className="text-lg font-bold text-white">{meal.name}</h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  {meal.calories ? (
                    <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                      🔥 {meal.calories} cal
                    </span>
                  ) : null}
                  {meal.protein ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                      🥩 {meal.protein}g protein
                    </span>
                  ) : null}
                  {meal.carbs ? (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
                      🍚 {meal.carbs}g carbs
                    </span>
                  ) : null}
                  {meal.fat ? (
                    <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-400">
                      🥑 {meal.fat}g fat
                    </span>
                  ) : null}
                </div>

                <div className="my-4 border-t border-zinc-800" />

                <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                  {meal.recipe}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-zinc-600">Saved on {formatDate(meal.created_at)}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(meal.id)}
                    className="cursor-pointer text-xs text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
