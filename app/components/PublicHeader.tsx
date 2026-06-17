"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function PublicHeader() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide the header entirely if the user is signed in (prevents stale layout clicks)
  if (!mounted || isSignedIn) return null;

  return (
    <header className="p-4 px-6 flex justify-between items-center bg-white/5 border-b border-white/10 backdrop-blur-xl relative z-50">
      <div className="font-semibold text-xl tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Resume AI</div>
      <div className="flex gap-4 items-center font-medium">
        <SignInButton mode="modal">
          <button className="px-4 py-2 hover:bg-white/5 rounded-lg transition text-sm cursor-pointer border border-transparent hover:border-white/10">
            Login
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 rounded-xl transition text-sm shadow-lg shadow-blue-500/20 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </header>
  );
}
