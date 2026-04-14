"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { UserButton } from "@clerk/nextjs";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Resume AI
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />

            {/* Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-zinc-900 z-[70] shadow-2xl flex flex-col py-8"
            >
              <div className="px-6 mb-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                  Resume AI
                </h1>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SidebarNav />
              </div>

              <div className="px-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
                <div className="flex items-center gap-3 p-2 -ml-2 rounded-xl">
                  <UserButton 
                    appearance={{ 
                      elements: { 
                        userButtonAvatarBox: "w-10 h-10 border-2 border-zinc-300 dark:border-zinc-800" 
                      } 
                    }} 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white">My Account</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">Manage Profile</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
