"use client";

import { useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Floating Hamburger / Pinned Header Trigger on Mobile */}
      <div className="fixed top-0 left-0 w-full h-[70px] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 z-[40] flex items-center px-4 justify-between lg:hidden shadow-sm">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-white"
        >
          <Menu size={22} className="opacity-80" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-500 bg-clip-text text-transparent tracking-tight">Resume AI</h1>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg border border-slate-300 dark:border-white/10" } }} /> 
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Drawer Sliding Side-Panel */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-[280px] h-full bg-zinc-50 dark:bg-[#09090b] flex flex-col py-8 shadow-[20px_0_40px_rgba(0,0,0,0.1)] border-r border-zinc-200 dark:border-zinc-800"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-4 p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X size={20} />
              </button>

              <div className="px-6 mb-10 mt-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-500 bg-clip-text text-transparent tracking-tight">Resume AI</h1>
              </div>

              {/* Navigation Menu (Clicks auto close the drawer!) */}
              <div onClick={() => setIsOpen(false)}>
                 <SidebarNav />
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
