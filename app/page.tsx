'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-black text-white">
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-up-delay-1 { transition-delay: 0.1s; }
        .fade-up-delay-2 { transition-delay: 0.2s; }
        .fade-up-delay-3 { transition-delay: 0.3s; }
      `}</style>
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-black">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-black sm:text-xl">
            <span className="gradient-text">MacroMunch AI</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white sm:text-base"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 sm:px-4 sm:text-base"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-gradient flex min-h-screen items-center pt-24">
          <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="fade-up mb-6 inline-flex rounded-full border border-emerald-500/50 px-4 py-2 text-sm font-medium text-emerald-400">
              🥗 AI-Powered Macro Tracking
            </div>

            <h1 className="fade-up fade-up-delay-1 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Your AI Chef That</span>
              <span className="gradient-text block">Knows Your Macros</span>
            </h1>

            <p className="fade-up fade-up-delay-2 mx-auto mt-6 max-w-3xl text-base text-zinc-400 sm:text-lg lg:text-xl">
              Tell MacroMunch what&apos;s in your fridge, set your fitness goals,
              and get personalized meal plans with exact macros. No guesswork.
              No generic recipes.
            </p>

            <div className="fade-up fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-500 px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-emerald-400"
              >
                Start Cooking Free
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-lg border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-200 transition-colors hover:bg-zinc-900"
              >
                See How It Works
              </Link>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              Free plan includes 10 messages/day • No credit card required
            </p>

            <div className="fade-up fade-up-delay-2 mx-auto mt-10 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left sm:p-6">
              <div className="mb-4 ml-auto max-w-xl rounded-2xl bg-zinc-800 px-4 py-3 text-sm text-zinc-100 sm:text-base">
                I have chicken breast, brown rice, spinach and eggs. I need a
                high protein lunch under 600 calories.
              </div>
              <div className="max-w-xl rounded-2xl bg-black/50 px-4 py-3 text-sm text-zinc-200 sm:text-base">
                <p className="mb-2">🥗 Perfect! Here&apos;s a Teriyaki Chicken Bowl for you: 520 cal | 52g protein | 48g carbs | 12g fat</p>
                <ol className="list-decimal space-y-1 pl-5 text-zinc-300">
                  <li>Season and sear chicken breast for 6-7 minutes per side.</li>
                  <li>Cook brown rice and steam spinach until tender.</li>
                  <li>Whisk teriyaki sauce and toss it with sliced chicken.</li>
                  <li>Assemble bowl with rice, spinach, chicken, and sliced egg.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-zinc-950 py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <p className="fade-up text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 sm:text-sm">
              HOW IT WORKS
            </p>
            <h2 className="fade-up fade-up-delay-1 mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From fridge to plate in seconds
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="fade-up rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-left">
                <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-emerald-400">01</p>
                <div className="mb-4 text-3xl">🎯</div>
                <h3 className="text-xl font-semibold text-white">Set Your Goals</h3>
                <p className="mt-3 text-zinc-400">
                  Tell us your daily macro targets, fitness goal
                  (cut/bulk/maintain), dietary restrictions, and cooking skill
                  level.
                </p>
              </div>

              <div className="fade-up fade-up-delay-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-left">
                <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-emerald-400">02</p>
                <div className="mb-4 text-3xl">🥦</div>
                <h3 className="text-xl font-semibold text-white">Add Your Ingredients</h3>
                <p className="mt-3 text-zinc-400">
                  List what&apos;s in your fridge or snap a photo. MacroMunch
                  remembers your pantry so you never start from scratch.
                </p>
              </div>

              <div className="fade-up fade-up-delay-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-left">
                <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-emerald-400">03</p>
                <div className="mb-4 text-3xl">🤖</div>
                <h3 className="text-xl font-semibold text-white">Chat &amp; Get Meals</h3>
                <p className="mt-3 text-zinc-400">
                  Have a natural conversation with your AI chef. Ask for
                  recipes, meal plans, substitutions, or macro breakdowns.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="fade-up text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, honest pricing
            </h2>
            <p className="mt-3 text-zinc-400">
              Start free. Upgrade when you&apos;re ready.
            </p>

            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="fade-up rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-left">
                <h3 className="text-2xl font-semibold text-white">Free</h3>
                <p className="mt-2 text-3xl font-black text-white">$0/month</p>
                <ul className="mt-6 space-y-3 text-zinc-300">
                  <li>10 AI messages per day</li>
                  <li>Ingredient-based recipes</li>
                  <li>Basic macro breakdown</li>
                  <li>Save up to 5 meals</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex rounded-lg border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  Get Started Free
                </Link>
              </div>

              <div className="fade-up fade-up-delay-1 card-glow rounded-2xl border-2 border-emerald-500 bg-zinc-900 p-8 text-left">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">Pro</h3>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                    Most Popular
                  </span>
                </div>
                <p className="mt-2 text-3xl font-black text-white">$9.99/month</p>
                <ul className="mt-6 space-y-3 text-zinc-300">
                  <li>Unlimited AI messages</li>
                  <li>Full weekly meal planning</li>
                  <li>Grocery list generation</li>
                  <li>Unlimited saved meals</li>
                  <li>Ingredient memory</li>
                  <li>Macro goal tracking</li>
                  <li>Priority responses</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-black transition-colors hover:bg-emerald-400"
                >
                  Start Pro Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-800 bg-black py-12 text-zinc-500">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-lg font-semibold">MacroMunch AI</p>
                <p className="mt-1">Your AI-powered macro chef</p>
              </div>
              <div className="flex items-center gap-6">
                <Link href="#" className="transition-colors hover:text-zinc-300">
                  Privacy
                </Link>
                <Link href="#" className="transition-colors hover:text-zinc-300">
                  Terms
                </Link>
                <Link href="#" className="transition-colors hover:text-zinc-300">
                  Contact
                </Link>
              </div>
            </div>
            <p className="mt-8">© 2025 MacroMunch AI. Built for fitness lovers.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
