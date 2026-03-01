# MacroMunch AI

An AI-powered meal planning chatbot that knows your macros and plans every meal around your fitness goals.

## Overview

MacroMunch AI goes beyond a basic recipe app. It learns your **macro targets, fitness goal, dietary restrictions, and what's in your fridge**, then has a real conversation with you about food — suggesting recipes, planning full days of eating, and breaking down exact macros for everything it recommends.

Built as a full-stack SaaS web app.

Screenshots
<div align="center">
Landing Page
<img width="1919" alt="Landing page" src="" />
AI-powered landing page with pricing and feature overview
Onboarding Flow
<img width="1919" alt="Onboarding" src="" />
4-step setup capturing your goals, macros, restrictions, and skill level
Dashboard & Chat
<img width="1919" alt="Dashboard" src="" />
Conversational AI chef with fridge sidebar and macro targets
</div>

## Features

- **Macro-Aware Chat** — every AI response is personalized to your exact calorie, protein, carbs, and fat targets
- **Fridge Memory** — add your ingredients once and MacroMunch always knows what you have available
- **Fitness Goal Modes** — cut, bulk, or maintain — the AI adjusts its recommendations accordingly
- **Dietary Restrictions** — vegetarian, vegan, keto, halal, gluten-free and more — never suggested a meal you can't eat
- **Weekly Meal Planning** — ask for a full day or week of meals and get a structured plan that hits your macros
- **Grocery List Generation** — get a minimal shopping list for only what you're missing
- **Cooking Skill Matching** — beginner, intermediate, or advanced recipes based on your skill level
- **Message Limit System** — free tier gets 10 messages per day, Pro gets unlimited
- **Freemium Model** — free tier with daily limits, Pro plan via Stripe at $9.99/month
- **Onboarding Flow** — 4-step setup that captures your goals, macros, restrictions, and skill level
- **Settings Page** — update your profile, macros, and goals anytime

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Backend:** Supabase (PostgreSQL database + authentication)
- **AI:** Groq API — llama-3.3-70b-versatile
- **Payments:** Stripe
- **Hosting:** Vercel

## Architecture

```
User → Next.js App Router → Supabase (auth + database)
                         → Groq API (AI chat)
                         → Stripe (payments)
```

## Database Schema

```sql
profiles
  id, email, full_name, daily_calories, daily_protein,
  daily_carbs, daily_fat, fitness_goal, dietary_restrictions,
  cooking_skill, is_pro, stripe_customer_id, stripe_subscription_id

messages
  id, user_id, role, content, created_at

ingredients
  id, user_id, name, quantity, unit, created_at

saved_meals
  id, user_id, name, recipe, calories, protein, carbs, fat, ingredients

message_counts
  id, user_id, date, count
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Groq API key (free at console.groq.com)
- Stripe account (for payments)
- Vercel account (for deployment)

### Installation

```bash
git clone https://github.com/Ishvirchopra35/macromunch-ai.git
cd macromunch-ai
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run this in your Supabase SQL Editor:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  daily_calories integer default 2000,
  daily_protein integer default 150,
  daily_carbs integer default 200,
  daily_fat integer default 65,
  fitness_goal text default 'maintain',
  dietary_restrictions text[] default '{}',
  disliked_foods text[] default '{}',
  cooking_skill text,
  is_pro boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create table ingredients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  quantity text,
  unit text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table saved_meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  recipe text not null,
  calories integer,
  protein integer,
  carbs integer,
  fat integer,
  ingredients text[],
  created_at timestamp with time zone default timezone('utc', now())
);

create table message_counts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  date date default current_date,
  count integer default 0,
  unique(user_id, date)
);
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pricing Logic

```
Free Tier  → 10 AI messages per day, basic features
Pro Tier   → Unlimited messages, full meal planning, grocery lists
Price      → $9.99/month via Stripe
```

## Deployment

The app is deployed on Vercel. Connect your GitHub repo, add all environment variables in Vercel project settings, and deploy.

For the Stripe webhook, set the endpoint to:
```
https://your-domain.vercel.app/api/stripe/webhook
```

## Roadmap

- [ ] Macro progress tracking throughout the day
- [ ] Saved meal library with one-click re-add
- [ ] Photo-based ingredient scanning
- [ ] Mobile app
- [ ] Google Fit / Apple Health integration
- [ ] Weekly nutrition summary emails

## License

This project is open source and available for educational purposes.

---

**Author:** Ishvir Singh Chopra  
**Contact:** ishvir.chopra@gmail.com  
**Live App:** Coming soon