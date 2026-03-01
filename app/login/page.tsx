'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Unable to sign in. Please try again.')
      setLoading(false)
      return
    }

    const userId = data.user.id
    const { data: profileData } = await supabase
      .from('profiles')
      .select('cooking_skill, updated_at, created_at')
      .eq('id', userId)
      .single()

    console.log('Profile data:', profileData)

    // User needs onboarding if their profile has never been updated
    // (updated_at equals created_at means they never completed onboarding)
    const hasCompletedOnboarding = profileData?.cooking_skill && 
      profileData?.updated_at !== profileData?.created_at

    if (!hasCompletedOnboarding) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="gradient-text text-2xl font-bold">MacroMunch AI</p>

        <h1 className="mt-6 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-zinc-400">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />

          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-emerald-500 hover:text-emerald-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
