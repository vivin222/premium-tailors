# Tailor Shop Appointment & Order Management System

A premium, modern, fully responsive web application for a real tailoring shop, designed to manage high customer volumes during festival seasons.

## Features

* **Customer Portal**
  * Browse services
  * Multi-step booking wizard with multi-item support
  * Demo UPI payment for ₹50 booking deposit
  * Mobile number based demo authentication
  * Real-time order tracking with visual progress
  * QR code generation for order lookup

* **Shopkeeper Portal**
  * Premium dashboard with analytics and slot overview
  * Secure login (Supabase Auth)
  * Real-time order management and status updates
  * Custom measurements entry (preset + custom)
  * Per-item pricing and automatic total calculation
  * Appointments and blocked slots management
  * Customer history
  * Reporting (charts and stats)
  * Shop settings and cancellation rules

## Tech Stack

* **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
* **Icons & Charts:** Lucide React, Recharts
* **Backend & Database:** Supabase (PostgreSQL)
* **Realtime:** Supabase Realtime subscriptions
* **Deployment:** Vercel (recommended)

## Local Setup

### 1. Supabase Project Setup
1. Create a free account and project at [Supabase](https://supabase.com/).
2. Go to the SQL Editor in your Supabase dashboard.
3. Copy the contents of `supabase/migrations/00001_initial_schema.sql` and run it.
4. Copy the contents of `supabase/migrations/00002_seed_data.sql` and run it to add realistic demo data.

### 2. Environment Variables
1. Clone or download this repository.
2. Rename `.env.example` to `.env.local`.
3. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
*(You can find these in your Supabase dashboard under Settings > API).*

### 3. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demo Credentials
* **Customer:** Enter any 10-digit mobile number (e.g., `9876543210`) to simulate login.
* **Shopkeeper:** (Demo Mode) The shopkeeper portal can be accessed directly or you can enable Supabase Auth for the `/shopkeeper` routes.

## Deployment

This project is configured for easy deployment on platforms like Vercel or Netlify.

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in the Vercel dashboard.
4. Deploy.

## Real-time Sync
This application uses Supabase Realtime. When a customer books a slot, or the shopkeeper updates an order status, the changes reflect instantly across both portals without refreshing the page.
