'use client'

import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-black">Privacy Policy</h1>
        <p className="mt-2 text-zinc-400">Last updated: March 2026</p>

        <section className="mt-8">
          <h2 className="mb-2 text-xl font-bold text-white">Information We Collect</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            We collect your email, name, fitness goals, macro targets, dietary preferences, and
            chat messages to provide personalized meal planning services.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">How We Use Your Information</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            Your data is used solely to personalize your MacroMunch AI experience. We never sell
            your personal information to third parties.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Data Storage</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            Your data is stored securely using Supabase with row-level security. Only you can
            access your personal data.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">AI Conversations</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            Your chat messages are sent to Groq&apos;s API to generate responses. Please do not share
            sensitive personal information in chats.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Cookies</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            We use essential cookies only for authentication purposes.
          </p>

          <h2 className="mb-2 text-xl font-bold text-white">Contact Us</h2>
          <p className="mb-8 leading-relaxed text-zinc-400">
            If you have questions about this privacy policy, contact us at
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
