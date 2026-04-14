import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ThemeProvider } from "../utils/ThemeProvider";
import { Toaster } from "sonner";
import { SidebarNav } from "./components/SidebarNav";
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
  title: "AI Resume Analyzer",
  description: "Analyze your resume with AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Safe Server-Side Authentication Check
  const { userId } = await auth();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden flex flex-col font-sans transition-colors duration-300 text-zinc-900 bg-white dark:text-zinc-100 dark:bg-[#09090b]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ClerkProvider>
          <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-xl' }} />
          
          {/* Public Header (Logged Out) */}
          {!userId && (
            <>
              <header className="p-4 px-6 flex justify-between items-center bg-white/5 border-b border-white/10 backdrop-blur-xl relative z-50">
                <div className="font-semibold text-xl tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Resume AI</div>
                <div className="flex gap-4 items-center font-medium">
                  <SignInButton mode="modal"><button className="px-4 py-2 hover:bg-white/5 rounded-lg transition text-sm cursor-pointer border border-transparent hover:border-white/10">Login</button></SignInButton>
                  <SignUpButton mode="modal"><button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 rounded-xl transition text-sm shadow-lg shadow-blue-500/20 cursor-pointer">Sign Up</button></SignUpButton>
                </div>
              </header>
              <main className="flex-1 w-full bg-white dark:bg-[#09090b]">
                {children}
              </main>
            </>
          )}

          {/* SaaS Sidebar Layout (Logged In) */}
          {!!userId && (
            <div className="flex flex-1 h-full overflow-hidden bg-white dark:bg-[#09090b] transition-colors duration-300">
              {/* Floating Sidebar */}
              <div className="w-[280px] bg-zinc-50/50 dark:bg-[#09090b] flex flex-col py-8 relative z-20 backdrop-blur-3xl transition-colors duration-300 border-r border-zinc-200/50 dark:border-zinc-800/50">
                <div className="px-6 mb-10">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-500 bg-clip-text text-transparent tracking-tight">Resume AI</h1>
                </div>

                <SidebarNav />

                {/* Profile Section */}
                <div className="px-6 pt-6 border-t border-slate-200 dark:border-white/5 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-white/5 p-2 -ml-2 rounded-xl transition cursor-pointer">
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-slate-300 dark:border-white/10" } }} /> 
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">My Account</span>
                      <span className="text-xs text-slate-500 dark:text-gray-500">Manage Profile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Pane */}
              <main className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b] relative transition-colors duration-300 rounded-tl-3xl border-t border-l border-zinc-200/50 dark:border-zinc-800/50 shadow-[-10px_-10px_30px_rgba(0,0,0,0.02)] dark:shadow-[-10px_-10px_30px_rgba(0,0,0,0.2)]">
                <div className="absolute inset-0 pointer-events-none"></div>
                {children}
              </main>
            </div>
          )}

          </ClerkProvider>
          <Toaster position="top-center" richColors theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
