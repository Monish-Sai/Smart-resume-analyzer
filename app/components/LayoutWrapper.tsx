"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { SidebarNav } from "./SidebarNav";
import { MobileSidebar } from "./MobileSidebar";
import { PublicHeader } from "./PublicHeader";
import { useEffect, useState } from "react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return null; // Prevents layout hydration mismatch
  }

  if (!isSignedIn) {
    return (
      <>
        <PublicHeader />
        <main className="flex-1 w-full bg-white dark:bg-[#09090b]">
          {children}
        </main>
      </>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-screen overflow-hidden print:overflow-visible print:h-auto bg-white dark:bg-[#09090b] transition-colors duration-300">
      <div className="print:hidden"><MobileSidebar /></div>

      {/* Floating Sidebar (Desktop) */}
      <div className="hidden lg:flex print:hidden w-[280px] bg-zinc-50/50 dark:bg-[#09090b] flex-col py-8 relative z-20 backdrop-blur-3xl transition-colors duration-300 border-r border-zinc-200/50 dark:border-zinc-800/50">
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
      <main className="flex-1 overflow-y-auto print:overflow-visible bg-white dark:bg-[#09090b] relative transition-colors duration-300 lg:rounded-tl-3xl lg:border-t lg:border-l border-zinc-200/50 dark:border-zinc-800/50 shadow-[-10px_-10px_30px_rgba(0,0,0,0.02)] dark:shadow-[-10px_-10px_30px_rgba(0,0,0,0.2)] print:border-none print:shadow-none print:rounded-none">
        <div className="absolute inset-0 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
