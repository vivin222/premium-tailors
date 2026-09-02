import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Sparkles, Database } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premium Tailors",
  description: "Appointment and Order Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isSupabaseConfigured && (
          <div className="bg-red-600 text-white p-4 text-center font-bold flex flex-col items-center justify-center z-50 relative shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-lg">
               <Database className="w-6 h-6" /> DATABASE CONNECTION REQUIRED
            </div>
            <p className="font-medium text-red-100 max-w-2xl">
              Strict Mode Enabled: Fake/Demo data has been disabled. You must provide a real <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file for the application to function.
            </p>
          </div>
        )}
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
