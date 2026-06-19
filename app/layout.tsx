import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ThemeProvider } from "../utils/ThemeProvider";
import { Toaster } from "sonner";
import { LayoutWrapper } from "./components/LayoutWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeCraft",
  description: "Analyze your resume with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col font-sans transition-colors duration-300 text-zinc-900 bg-white dark:text-zinc-100 dark:bg-[#09090b]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ClerkProvider>
            <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-xl' }} />
            <LayoutWrapper>{children}</LayoutWrapper>
          </ClerkProvider>
          <Toaster position="top-center" richColors theme="system" />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
