import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json()

    const prompt = `Create a 7-day meal plan for this person:
- Fitness Goal: ${profile?.fitness_goal}
- Daily Targets: ${profile?.daily_calories} calories, ${profile?.daily_protein}g protein, ${profile?.daily_carbs}g carbs, ${profile?.daily_fat}g fat
- Dietary Restrictions: ${profile?.dietary_restrictions?.join(', ') || 'None'}
- Cooking Skill: ${profile?.cooking_skill}

Return ONLY a valid JSON object with this exact structure, no other text:
{
  "monday": {
    "breakfast": { "name": "Meal name", "calories": 400, "protein": 30, "carbs": 40, "fat": 10 },
    "lunch": { "name": "Meal name", "calories": 500, "protein": 40, "carbs": 50, "fat": 12 },
    "dinner": { "name": "Meal name", "calories": 600, "protein": 45, "carbs": 60, "fat": 15 }
  },
  "tuesday": { ... },
  "wednesday": { ... },
  "thursday": { ... },
  "friday": { ... },
  "saturday": { ... },
  "sunday": { ... }
}
Each day's meals should add up close to the daily targets.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || '{}'
    const cleanContent = content.replace(/```json|```/g, '').trim()
    const plan = JSON.parse(cleanContent)

    return NextResponse.json({ plan })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate plan', plan: {} }, { status: 500 })
  }
}
