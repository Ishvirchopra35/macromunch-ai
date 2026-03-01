'use client'

import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <p className="gradient-text font-bold">MacroMunch AI</p>
        <span
          onClick={() => router.push('/')}
          className="cursor-pointer text-sm text-zinc-400 hover:text-white"
        >
          ← Back
        </span>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10 pt-24">
        <h1 className="text-4xl font-black">Terms of Service</h1>
        <p className="mt-2 text-zinc-400">Last updated: March 2026</p>

        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold text-white">Acceptance of Terms</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            By using MacroMunch AI you agree to these terms. If you do not agree, please do not
            use the service.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Use of Service</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            MacroMunch AI is for personal meal planning and nutrition guidance only. You must be 13
            or older to use this service.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Not Medical Advice</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            MacroMunch AI provides general nutrition information only. Always consult a qualified
            healthcare professional before making significant dietary changes.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Free and Pro Plans</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            The free plan includes 10 AI messages per day. Pro plan subscribers get unlimited
            access for $9.99/month, billed monthly, cancel anytime.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Cancellation</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            You may cancel your Pro subscription at any time. Access continues until the end of the
            billing period.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Limitation of Liability</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            MacroMunch AI is provided as-is. We are not liable for any damages arising from use of
            the service.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Contact</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            For questions contact
            {' '}
            <a href="mailto:ishvir.chopra@gmail.com" className="text-emerald-400 hover:text-emerald-300">
              ishvir.chopra@gmail.com
            </a>
          </p>
        </section>
      </main>
    </div>
  )
}
