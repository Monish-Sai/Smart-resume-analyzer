"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { supabase } from "../../utils/supabaseClient";

export default function SettingsPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [defaultRole, setDefaultRole] = useState<string>("");
  const [autoExport, setAutoExport] = useState<boolean>(false);
  const [pendingTheme, setPendingTheme] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // eslint-disable-next-line
  useEffect(() => {
    setMounted(true);
  }, []);

  // eslint-disable-next-line
  useEffect(() => {
    // Only initialize pendingTheme once on mount to avoid overriding manual user previews
    if (mounted && !pendingTheme && theme) setPendingTheme(theme);
  }, [theme, mounted, pendingTheme]);

  // Handle Real-time Visual Theme Preview without saving globally
  useEffect(() => {
    if (!mounted || !pendingTheme) return;
    
    // Preview mode manipulation
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(pendingTheme);
    document.documentElement.style.colorScheme = pendingTheme;

    // Strict Revert Hook: When leaving the settings page, revert to actual saved db theme!
    return () => {
      if (theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        document.documentElement.style.colorScheme = theme;
      }
    };
  }, [pendingTheme, theme, mounted]);

  // Load properties securely from db simulation
  useEffect(() => {
    if (userId) {
      const savedRole = localStorage.getItem(`default_role_${userId}`);
      // eslint-disable-next-line
      if (savedRole) setDefaultRole(savedRole);

      const savedExport = localStorage.getItem(`auto_export_${userId}`);
      // eslint-disable-next-line
      if (savedExport === "true") setAutoExport(true);
    }
  }, [userId]);

  // Hook save logic into localstorage securely
  const handleSavePreferences = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`default_role_${userId}`, defaultRole);
      localStorage.setItem(`auto_export_${userId}`, autoExport.toString());
      if (pendingTheme) setTheme(pendingTheme);
      setIsSaving(false);
      toast.success("Preferences updated successfully.");
    }, 600);
  };

  const handleWipeActiveData = () => {
    toast.error("Wipe Active Dashboard?", {
      description: "This will permanently delete all active AI history blocks on your Dashboard. This CANNOT be undone!",
      action: {
        label: "Confirm Purge",
        onClick: async () => {
          if (userId) {
            await supabase.from('resume_history').delete().eq('user_id', userId);
            toast.success("Active history sequence deleted from cloud.");
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const handleWipeTrashData = () => {
    toast.error("Empty Trash Containers?", {
      description: "This will permanently purge your Trash bin containers. Are you absolutely sure?",
      action: {
        label: "Confirm Empty",
        onClick: async () => {
          if (userId) {
             await supabase.from('resume_history_deleted').delete().eq('user_id', userId);
             toast.success("Trash records wiped completely from cloud.");
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  if (!mounted || !isLoaded) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]" />;
  }

  if (!isSignedIn) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]" />;
  }

  return (
    <div className="w-full flex-1 w-full max-w-5xl flex justify-center mx-auto">
      <div className="w-full max-w-3xl flex flex-col pt-10 px-6 animate-fadeIn mx-auto">
        
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
             <div>
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Preferences</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Configure your automated Analyzer behaviors.</p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           
           {/* Behavior Settings */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden transition-colors duration-300">
              
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-2 relative z-10 transition-colors duration-300">
                Workflow Automation
              </h3>

              <div className="space-y-6 relative z-10">
                 <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 transition-colors duration-300">Default Target Role</label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-3 transition-colors duration-300">If configured, the Core Analyzer will immediately pre-fill this role upon loading.</p>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={defaultRole}
                      onChange={(e) => setDefaultRole(e.target.value)}
                    />
                 </div>

                 <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-300">
                    <div>
                       <h4 className="font-medium text-zinc-800 dark:text-zinc-300 transition-colors duration-300">Auto-Download Export PDF</h4>
                       <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 max-w-sm transition-colors duration-300">Automatically trigger the PDF Report Compiler immediately upon the conclusion of every AI Analysis attempt.</p>
                    </div>
                    <button 
                      onClick={() => setAutoExport(!autoExport)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoExport ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-zinc-50 dark:bg-zinc-950 transition-transform ${autoExport ? 'translate-x-6' : 'translate-x-1'} shadow`} />
                    </button>
                 </div>

                 {mounted && (
                   <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-300">
                      <div>
                         <h4 className="font-medium text-zinc-800 dark:text-zinc-300 transition-colors duration-300">Global Display Theme</h4>
                         <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 max-w-sm transition-colors duration-300">Toggle between Light and Dark mode rendering layers globally.</p>
                      </div>
                      <div className="flex gap-2 bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-300/50 dark:border-zinc-700/50 transition-colors duration-300">
                        <button 
                          onClick={() => setPendingTheme('light')}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${pendingTheme === 'light' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                          Light
                        </button>
                        <button 
                          onClick={() => setPendingTheme('dark')}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${pendingTheme === 'dark' ? 'bg-[#09090b] shadow-sm text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                          Dark
                        </button>
                      </div>
                   </div>
                 )}
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end relative z-10 transition-colors duration-300">
                 <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                 >
                    {isSaving ? "Saving..." : "Save Preferences"}
                 </button>
              </div>
           </div>

           {/* Destructive Methods */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col transition-colors duration-300">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2 transition-colors duration-300">
                Danger Zone
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-6 transition-colors duration-300">Irreversible database purge operations. Use these with extreme caution.</p>

              <div className="flex flex-col md:flex-row gap-4">
                 <button 
                   onClick={handleWipeActiveData}
                   className="flex-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white px-4 py-3 rounded-xl transition duration-300 text-sm font-medium"
                 >
                   Purge Active Dashboard
                 </button>
                 <button 
                   onClick={handleWipeTrashData}
                   className="flex-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white px-4 py-3 rounded-xl transition duration-300 text-sm font-medium"
                 >
                   Empty Trash Containers
                 </button>
              </div>
           </div>

           {/* Account Authentication */}
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col transition-colors duration-300">
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-2 transition-colors duration-300">
                Authentication
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-6 transition-colors duration-300">Manage your active device sessions and sign out securely.</p>

              <div className="flex">
                 <SignOutButton redirectUrl="/">
                   <button className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-xl transition duration-300 font-medium select-none">
                     Sign Out of Account
                   </button>
                 </SignOutButton>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
