'use client'

import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <p className="text-white font-bold">MacroMunch AI</p>
        <span
          onClick={() => router.push('/')}
          className="cursor-pointer text-sm text-zinc-400 hover:text-white"
        >
          ← Back
        </span>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10 pt-24">
        <h1 className="text-4xl font-black">Contact Us</h1>
        <p className="mt-2 text-zinc-400">We&apos;d love to hear from you</p>

        <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <section>
            <h2 className="mb-2 text-xl font-bold text-white">Email us at</h2>
            <a
              href="mailto:ishvir.chopra@gmail.com"
              className="text-2xl font-bold text-emerald-400 hover:text-emerald-300"
            >
              ishvir.chopra@gmail.com
            </a>
          </section>

          <div className="my-8 border-t border-zinc-800" />

          <section>
            <p className="mb-8 leading-relaxed text-zinc-400">We typically respond within 24 hours.</p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">Found a bug or have a feature request?</h2>
            <p className="mb-8 leading-relaxed text-zinc-400">
              We read every message and use your feedback to improve MacroMunch AI.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
