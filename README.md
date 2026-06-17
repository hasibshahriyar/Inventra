# Inventra 📦

Inventra is a premium, modern inventory management web application built with **Next.js 15** and **Supabase**. It features a stunning glassmorphism UI with flawless Dark and Light modes, real-time database updates, and AI-powered semantic search.

## ✨ Features

- **Premium UI/UX**: Built with Tailwind CSS v4, featuring glassmorphism cards, dynamic gradients, and seamless Dark/Light mode toggling.
- **Secure Authentication**: Fully integrated with Supabase Auth (Email/Password, Profile Management, Security updates).
- **Real-Time Inventory Management**: Complete CRUD capabilities for your products. Changes reflect instantly across all clients using Supabase Realtime subscriptions.
- **AI Vector Search**: Find products naturally using semantic search powered by Supabase `pgvector` and Edge Functions.
- **Cloud Storage**: Upload and manage product images directly via Supabase Storage.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI / Search**: Supabase pgvector

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/hasibshahriyar/Inventra.git
cd Inventra
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the code provided in `supabase/schema.sql` to generate the necessary tables, Row Level Security (RLS) policies, and Vector Search functions.
3. In your Supabase Dashboard, create a new Storage bucket named `product-images` and make it public.

### 4. Environment Variables
Rename `.env.local.example` to `.env.local` (or create a new `.env.local` file) and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License
This project is licensed under the MIT License.
