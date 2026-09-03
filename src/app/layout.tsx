import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Premium Tailors | Bespoke Craftsmanship",
  description: "Modern tailoring studio for perfect fits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-gray-50 text-gray-900 antialiased selection:bg-black selection:text-white`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
