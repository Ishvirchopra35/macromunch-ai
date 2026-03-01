import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { message, profile, ingredients, messageHistory } = await request.json()

    const systemPrompt = `You are MacroMunch Chef, a personal AI nutrition coach and chef. You are warm, encouraging, and extremely knowledgeable about fitness nutrition and cooking.

YOUR USER'S PROFILE:
- Name: ${profile?.full_name ?? 'User'}
- Fitness Goal: ${profile?.fitness_goal ?? 'maintain'} (cut = lose fat, bulk = build muscle, maintain = stay lean)
- Daily Macro Targets: ${profile?.daily_calories ?? 2000} calories, ${profile?.daily_protein ?? 150}g protein, ${profile?.daily_carbs ?? 200}g carbs, ${profile?.daily_fat ?? 65}g fat
- Dietary Restrictions: ${profile?.dietary_restrictions?.join(', ') || 'None'}
- Cooking Skill: ${profile?.cooking_skill ?? 'intermediate'}

WHAT'S IN THEIR FRIDGE:
${ingredients?.length > 0 ? ingredients.map((i: any) => i.name).join(', ') : 'No ingredients added yet'}

YOUR BEHAVIOR RULES:
1. ALWAYS respect the user's dietary restrictions — never suggest meals that violate them
2. ALWAYS provide macro breakdowns (calories, protein, carbs, fat) when suggesting recipes or meals
3. Tailor recipe complexity to their cooking skill level
4. Keep their fitness goal in mind — if they're cutting, prioritize low calorie high protein meals; if bulking, suggest calorie-dense nutritious meals; if maintaining, balance is key
5. When suggesting recipes, format them clearly with: Recipe name, Macros line (Cal | Protein | Carbs | Fat), Ingredients list, Steps
6. If they ask what they can make, prioritize ingredients they already have in their fridge
7. Be conversational and motivating — you're their personal chef who wants them to hit their goals
8. If asked about meal plans, create structured daily plans that hit their macro targets
9. Keep responses concise but complete — no unnecessary filler
10. If they haven't added fridge ingredients yet, encourage them to add some in the sidebar`

    const formattedHistory = (messageHistory ?? [])
      .slice(-6)
      .map((historyMessage: { role: 'user' | 'assistant'; content: string }) => ({
        role: historyMessage.role,
        content: historyMessage.content
      }))

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    })

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        reply: 'Sorry, something went wrong. Please try again!'
      },
      { status: 500 }
    )
  }
}
