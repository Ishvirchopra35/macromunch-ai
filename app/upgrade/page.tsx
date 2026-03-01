'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export default function UpgradePage() {
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
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
        .select('is_pro')
        .eq('id', session.user.id)
        .single()

      if (profile?.is_pro) {
        router.push('/dashboard')
      }
    }

    loadUser()
  }, [router])

  const handleUpgrade = async () => {
    if (!session?.user?.id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email
        })
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        setError('Failed to create checkout. Please try again.')
      }
    } catch {
      setError('Failed to create checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <span
          onClick={() => router.push('/dashboard')}
          className="cursor-pointer text-sm text-zinc-400 hover:text-white"
        >
          ← Back
        </span>
        <p className="gradient-text font-bold">MacroMunch AI</p>
        <div className="w-12" />
      </nav>

      <section className="px-6 pt-24 pb-12 text-center">
        <span className="mb-6 inline-block rounded-full border border-emerald-500 px-4 py-1 text-sm text-emerald-400">
          🚀 Upgrade to Pro
        </span>
        <h1 className="text-4xl font-black">Unlock Your Full Potential</h1>
        <p className="mx-auto mt-3 max-w-md text-zinc-400">
          Remove all limits and let MacroMunch plan every meal around your goals
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 pb-16 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-2 text-3xl font-black">$0 / month</p>
          <p className="mt-1 text-sm text-zinc-500">Your current plan</p>

          <div className="my-6 border-t border-zinc-800" />

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-zinc-500">·</span>
              <span>10 AI messages per day</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-zinc-500">·</span>
              <span>Ingredient-based recipes</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-zinc-500">·</span>
              <span>Basic macro breakdown</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-zinc-500">·</span>
              <span>Save up to 5 meals</span>
            </li>
          </ul>

          <button
            type="button"
            disabled
            className="mt-8 w-full cursor-not-allowed rounded-xl border border-zinc-700 py-3 text-zinc-500"
          >
            Current Plan
          </button>
        </div>

        <div className="card-glow relative rounded-2xl border-2 border-emerald-500 bg-zinc-900 p-8">
          <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-black">
            MOST POPULAR
          </span>

          <h2 className="text-xl font-bold">Pro</h2>
          <p className="mt-2 text-3xl font-black">$9.99 / month</p>
          <p className="mt-1 text-sm text-zinc-500">Billed monthly, cancel anytime</p>

          <div className="my-6 border-t border-zinc-800" />

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Unlimited AI messages</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Full weekly meal planning</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Grocery list generation</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Unlimited saved meals</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Ingredient memory across sessions</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Macro goal tracking</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-500">·</span>
              <span>Priority AI responses</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Redirecting to checkout...' : 'Upgrade to Pro →'}
          </button>
        </div>
      </section>

      <div className="mt-6 px-6 text-center text-sm text-zinc-500">
        Secured by Stripe · Cancel anytime · Instant access after payment
      </div>

      {error ? <p className="mt-3 px-6 text-center text-sm text-red-400">{error}</p> : null}
    </div>
  )
}
