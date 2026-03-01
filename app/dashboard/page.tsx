'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Ingredient, Message, Profile } from '@/lib/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  isUpgradeNotice?: boolean
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [input, setInput] = useState('')
  const [ingredientInput, setIngredientInput] = useState('')
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [todayMessageCount, setTodayMessageCount] = useState(0)
  const [messageCountId, setMessageCountId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [upgradeToast, setUpgradeToast] = useState(false)
  const [savedMealToast, setSavedMealToast] = useState(false)
  const [loggedCalories, setLoggedCalories] = useState(0)
  const [loggedProtein, setLoggedProtein] = useState(0)
  const [loggedCarbs, setLoggedCarbs] = useState(0)
  const [loggedFat, setLoggedFat] = useState(0)
  const messageCount = todayMessageCount

  const todayDate = new Date().toISOString().split('T')[0]
  const isPro = Boolean(profile?.is_pro)

  useEffect(() => {
    const loadDashboardData = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      setUserId(session.user.id)
      setUserEmail(session.user.email ?? '')

      const [profileResult, countResult, messagesResult, ingredientsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase
          .from('message_counts')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('date', todayDate)
          .single(),
        supabase
          .from('messages')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true })
          .limit(20),
        supabase.from('ingredients').select('*').eq('user_id', session.user.id)
      ])

      if (profileResult.data) {
        const profile = profileResult.data as Profile
        setProfile(profile)

        if (!profile?.cooking_skill) {
          router.push('/onboarding')
          return
        }

        if (searchParams.get('upgraded') === 'true') {
          // Poll for pro status since webhook may take a moment
          let attempts = 0
          const pollForPro = async () => {
            const { data: freshProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (freshProfile?.is_pro || attempts >= 5) {
              if (freshProfile) setProfile(freshProfile)
              setUpgradeToast(true)
              setTimeout(() => setUpgradeToast(false), 5000)
            } else {
              attempts++
              setTimeout(pollForPro, 2000)
            }
          }
          pollForPro()
          window.history.replaceState({}, '', '/dashboard')
        }
      }

      if (countResult.data) {
        setTodayMessageCount(countResult.data.count ?? 0)
        setMessageCountId(countResult.data.id)
      }

      if (messagesResult.data) {
        const formattedMessages = (messagesResult.data as Message[]).map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          created_at: message.created_at
        }))
        setMessages(formattedMessages)
      }

      if (ingredientsResult.data) {
        setIngredients(ingredientsResult.data as Ingredient[])
      }

      setIsInitializing(false)
    }

    loadDashboardData()
  }, [router, todayDate, searchParams])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const resizeTextarea = () => {
    if (!textareaRef.current) {
      return
    }

    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
  }

  useEffect(() => {
    resizeTextarea()
  }, [input])

  const refreshIngredients = async () => {
    if (!userId) {
      return
    }

    const { data } = await supabase.from('ingredients').select('*').eq('user_id', userId)
    if (data) {
      setIngredients(data as Ingredient[])
    }
  }

  const addIngredient = async () => {
    const name = ingredientInput.trim()

    if (!name || !userId) {
      return
    }

    await supabase.from('ingredients').insert({
      user_id: userId,
      name
    })

    setIngredientInput('')
    await refreshIngredients()
  }

  const removeIngredient = async (ingredientId: string) => {
    await supabase.from('ingredients').delete().eq('id', ingredientId)
    setIngredients((prev) => prev.filter((item) => item.id !== ingredientId))
  }

  const saveMessageCount = async (nextCount: number) => {
    if (!userId) {
      return
    }

    if (messageCountId) {
      await supabase.from('message_counts').update({ count: nextCount }).eq('id', messageCountId)
      return
    }

    const { data } = await supabase
      .from('message_counts')
      .insert({
        user_id: userId,
        date: todayDate,
        count: nextCount
      })
      .select('*')
      .single()

    if (data) {
      setMessageCountId(data.id)
    }
  }

  const createUpgradeNotice = (): ChatMessage => ({
    id: `upgrade-${Date.now()}`,
    role: 'assistant',
    content:
      "You've hit your daily limit of 10 messages. Upgrade to Pro for unlimited access.",
    created_at: new Date().toISOString(),
    isUpgradeNotice: true
  })

  const extractMacrosFromMessage = (content: string) => {
    const caloriesMatch = content.match(/(\d+)\s*(cal|kcal|calories)/i)
    const proteinMatch = content.match(/(\d+)g\s*protein/i)
    const carbsMatch = content.match(/(\d+)g\s*(carbs|carbohydrates)/i)
    const fatMatch = content.match(/(\d+)g\s*fat/i)

    return {
      calories: caloriesMatch ? Number(caloriesMatch[1]) : 0,
      protein: proteinMatch ? Number(proteinMatch[1]) : 0,
      carbs: carbsMatch ? Number(carbsMatch[1]) : 0,
      fat: fatMatch ? Number(fatMatch[1]) : 0
    }
  }

  const containsMealData = (content: string) => {
    return /(\d+)\s*(cal|kcal|calories)/i.test(content) && /\d+g\s*protein/i.test(content)
  }

  async function saveMeal(content: string) {
    const nameMatch = content.match(/\*\*(.+?)\*\*/) || content.match(/^(.+?)\n/)
    const calMatch = content.match(/(\d+)\s*(cal|kcal|calories)/i)
    const proteinMatch = content.match(/(\d+)g\s*protein/i)
    const carbsMatch = content.match(/(\d+)g\s*(carbs|carbohydrates)/i)
    const fatMatch = content.match(/(\d+)g\s*fat/i)

    const meal = {
      user_id: (await supabase.auth.getSession()).data.session?.user.id,
      name: nameMatch?.[1] ?? 'Saved Meal',
      recipe: content,
      calories: calMatch ? parseInt(calMatch[1]) : null,
      protein: proteinMatch ? parseInt(proteinMatch[1]) : null,
      carbs: carbsMatch ? parseInt(carbsMatch[1]) : null,
      fat: fatMatch ? parseInt(fatMatch[1]) : null,
      ingredients: []
    }

    await supabase.from('saved_meals').insert(meal)
    setSavedMealToast(true)
    setTimeout(() => setSavedMealToast(false), 3000)
  }

  const handleSend = async (overrideMessage?: string) => {
    const messageText = (overrideMessage ?? input).trim()

    if (!messageText || loading || !userId) {
      return
    }

    if (!profile?.is_pro && messageCount >= 10) {
      setMessages((prev) => [...prev, createUpgradeNotice()])
      return
    }

    setLoading(true)

    const optimisticUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString()
    }

    setMessages((prev) => [...prev, optimisticUserMessage])
    setInput('')

    await supabase.from('messages').insert({
      user_id: userId,
      role: 'user',
      content: messageText
    })

    const nextCount = todayMessageCount + 1
    setTodayMessageCount(nextCount)
    await saveMessageCount(nextCount)

    const historyForApi = [...messages, optimisticUserMessage].slice(-10)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: messageText,
        profile,
        ingredients,
        messageHistory: historyForApi
      })
    })

    const data = await response.json()
    const assistantText =
      data?.response ?? data?.reply ?? data?.message ?? 'I had trouble generating a response.'

    const extractedMacros = extractMacrosFromMessage(assistantText)
    setLoggedCalories((prev) => prev + extractedMacros.calories)
    setLoggedProtein((prev) => prev + extractedMacros.protein)
    setLoggedCarbs((prev) => prev + extractedMacros.carbs)
    setLoggedFat((prev) => prev + extractedMacros.fat)

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: assistantText,
      created_at: new Date().toISOString()
    }

    setMessages((prev) => [...prev, assistantMessage])

    await supabase.from('messages').insert({
      user_id: userId,
      role: 'assistant',
      content: assistantText
    })

    setLoading(false)
  }

  const submitQuickPrompt = (prompt: string) => {
    setInput(prompt)
    void handleSend(prompt)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleEnterToSend = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  if (isInitializing) {
    return <div className="min-h-screen bg-black" />
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const remainingMessages = Math.max(0, 10 - todayMessageCount)

  return (
    <div className="flex min-h-screen flex-row bg-black text-white">
      <aside className="fixed top-0 left-0 flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <p className="gradient-text text-lg font-bold">MacroMunch AI</p>
        </div>

        <div className="border-b border-zinc-800 p-4">
          <p className="mb-3 text-xs text-zinc-500">TODAY&apos;S TARGETS</p>
          <div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">🔥 Calories</span>
                <span className="text-white">{loggedCalories} / {profile?.daily_calories ?? 2000}</span>
              </div>
              <div
                className={`w-full rounded-full h-1.5 mt-1 mb-3 ${loggedCalories > (profile?.daily_calories ?? 2000) ? 'bg-red-950' : 'bg-zinc-800'}`}
              >
                <div
                  className={`${loggedCalories > (profile?.daily_calories ?? 2000) ? 'bg-red-500' : 'bg-blue-500'} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((loggedCalories / (profile?.daily_calories ?? 2000)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">🥩 Protein</span>
                <span className="text-white">{loggedProtein} / {profile?.daily_protein ?? 150}</span>
              </div>
              <div
                className={`w-full rounded-full h-1.5 mt-1 mb-3 ${loggedProtein > (profile?.daily_protein ?? 150) ? 'bg-red-950' : 'bg-zinc-800'}`}
              >
                <div
                  className={`${loggedProtein > (profile?.daily_protein ?? 150) ? 'bg-red-500' : 'bg-emerald-500'} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((loggedProtein / (profile?.daily_protein ?? 150)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">🍚 Carbs</span>
                <span className="text-white">{loggedCarbs} / {profile?.daily_carbs ?? 200}</span>
              </div>
              <div
                className={`w-full rounded-full h-1.5 mt-1 mb-3 ${loggedCarbs > (profile?.daily_carbs ?? 200) ? 'bg-red-950' : 'bg-zinc-800'}`}
              >
                <div
                  className={`${loggedCarbs > (profile?.daily_carbs ?? 200) ? 'bg-red-500' : 'bg-yellow-500'} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((loggedCarbs / (profile?.daily_carbs ?? 200)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-400">🥑 Fat</span>
                <span className="text-white">{loggedFat} / {profile?.daily_fat ?? 65}</span>
              </div>
              <div
                className={`w-full rounded-full h-1.5 mt-1 mb-3 ${loggedFat > (profile?.daily_fat ?? 65) ? 'bg-red-950' : 'bg-zinc-800'}`}
              >
                <div
                  className={`${loggedFat > (profile?.daily_fat ?? 65) ? 'bg-red-500' : 'bg-orange-500'} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((loggedFat / (profile?.daily_fat ?? 65)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setLoggedCalories(0)
                setLoggedProtein(0)
                setLoggedCarbs(0)
                setLoggedFat(0)
              }}
              className="text-zinc-600 hover:text-zinc-400 text-xs mt-1"
            >
              Reset today
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border-b border-zinc-800 p-4">
          <p className="mb-3 text-xs text-zinc-500">MY FRIDGE</p>

          <div className="mb-3 flex gap-2">
            <input
              value={ingredientInput}
              onChange={(event) => setIngredientInput(event.target.value)}
              placeholder="Add ingredient..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black"
            >
              Add
            </button>
          </div>

          <div>
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between py-1 text-sm text-zinc-300">
                <span>{ingredient.name}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient.id)}
                  className="text-xs text-zinc-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-zinc-800 p-4">
          <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-2 w-full text-left text-sm text-zinc-400 hover:text-white"
          >
            Sign Out
          </button>
          <a href="/meals" className="text-zinc-400 hover:text-white text-sm mt-1 block">
            🍽️ Saved Meals
          </a>
          <Link href="/settings" className="mt-1 block text-sm text-zinc-400 hover:text-white">
            ⚙️ Settings
          </Link>

          {isPro ? (
            <span className="mt-3 inline-block rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">
              PRO
            </span>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Free Plan{' '}
              <Link href="/upgrade" className="text-emerald-400 hover:text-emerald-300">
                Upgrade →
              </Link>
            </p>
          )}
        </div>
      </aside>

      <main className="ml-64 flex h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 p-4">
          <div>
            <p className="font-semibold text-white">🥗 MacroMunch Chef</p>
            <p className="text-xs text-zinc-500">Powered by AI • Knows your macros</p>
          </div>
          <div>
            {profile?.is_pro ? (
              <p className="text-sm font-medium text-emerald-400">Unlimited</p>
            ) : (
              <p className="text-sm text-zinc-500">{remainingMessages} / 10 messages today</p>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-6xl">🥗</p>
              <h2 className="mt-4 text-xl font-bold">
                Hey {firstName}! I&apos;m your MacroMunch chef.
              </h2>
              <p className="mt-2 max-w-md text-center text-zinc-400">
                I know your macros and what&apos;s in your fridge. Ask me anything
                about meals, recipes, or nutrition.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  '🍳 What can I make for breakfast?',
                  '💪 High protein lunch ideas',
                  '📋 Plan my meals for today'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitQuickPrompt(prompt)}
                    className="cursor-pointer rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-lg rounded-2xl rounded-br-sm bg-emerald-500 px-4 py-3 text-sm font-medium text-black">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm">
                    🥗
                  </div>
                  <div className="max-w-lg whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-3 text-sm text-white">
                    <>
                      {message.isUpgradeNotice ? (
                        <>
                          You&apos;ve hit your daily limit of 10 messages. Upgrade to
                          Pro for unlimited access.{` `}
                          <Link href="/upgrade" className="text-emerald-400 hover:text-emerald-300">
                            Upgrade Now →
                          </Link>
                        </>
                      ) : (
                        message.content
                      )}

                      {containsMealData(message.content) && (
                        <button
                          onClick={() => saveMeal(message.content)}
                          className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-600 rounded-lg px-3 py-1 transition-colors"
                        >
                          + Save this meal
                        </button>
                      )}
                    </>
                  </div>
                </div>
              )
            )
          )}

          {loading && (
            <div className="flex justify-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm">
                🥗
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-75" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-150" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleEnterToSend}
              placeholder="Ask your chef anything... 'I have 30g protein left today, what's a quick snack?'"
              className="min-h-[48px] max-h-[200px] w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!input.trim() || loading}
              className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              →
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-600">
            MacroMunch AI can make mistakes. Always verify nutritional info.
          </p>
        </div>
      </main>

      {upgradeToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black shadow-lg">
          🎉 Welcome to Pro! All limits removed.
        </div>
      )}

      {savedMealToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold px-6 py-3 rounded-2xl shadow-lg z-50 text-sm">
          Meal saved to your library!
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
