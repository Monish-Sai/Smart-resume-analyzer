"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "../../utils/supabaseClient";

type HistoryItem = {
  id?: string;
  original_id?: string;
  role: string;
  score: number;
  date?: string;
  original_created_at?: string;
  deleted_at?: string;
  strengths?: string;
  missing?: string;
  improvements?: string;
  custom_title?: string;
};

export default function TrashPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  
  const [deletedHistory, setDeletedHistory] = useState<HistoryItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  // Fetch true history from the Supabase Cloud
  useEffect(() => {
    async function loadDeletedData() {
      if (userId) {
        const { data } = await supabase
          .from('resume_history_deleted')
          .select('*')
          .eq('user_id', userId)
          .order('deleted_at', { ascending: false });
        
        if (data) setDeletedHistory(data);
      }
    }
    loadDeletedData();
  }, [userId]);

  // Restore item from Cloud Trash to Cloud Active
  const handleRestoreHistory = async (indexToRestore: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const itemToRestore = deletedHistory[indexToRestore];
    
    // UI Update immediately
    const newDeletedHistory = deletedHistory.filter((_, idx) => idx !== indexToRestore);
    setDeletedHistory(newDeletedHistory);
    setExpandedItem(null);

    // DB Transfer
    if (itemToRestore.id) {
       await supabase.from('resume_history').insert([{
           user_id: userId,
           role: itemToRestore.role,
           score: itemToRestore.score,
           strengths: itemToRestore.strengths,
           missing: itemToRestore.missing,
           improvements: itemToRestore.improvements,
           custom_title: itemToRestore.custom_title
       }]);

       await supabase.from('resume_history_deleted').delete().eq('id', itemToRestore.id);
    }
  };

  // Hard Delete permanently from Cloud
  const handleHardDelete = async (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to permanently delete this analysis? This cannot be undone.")) {
      return; 
    }
    
    const itemToDelete = deletedHistory[indexToDelete];
    const newDeletedHistory = deletedHistory.filter((_, idx) => idx !== indexToDelete);
    setDeletedHistory(newDeletedHistory);
    setExpandedItem(null);

    if (itemToDelete.id) {
       await supabase.from('resume_history_deleted').delete().eq('id', itemToDelete.id);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="w-full flex-1 w-full max-w-6xl flex justify-center mx-auto">
      <div className="w-full max-w-4xl flex flex-col pt-10 px-6 animate-fadeIn mx-auto">
        {/* Back Button */}
        <div className="w-full mb-8 flex justify-start">
          <Link 
            href="/dashboard"
            className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 px-4 py-2 rounded-xl w-fit transition-colors duration-300"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* Content Container */}
        <div className="backdrop-blur-xl bg-white dark:bg-white/5 border border-red-500/20 dark:border-red-500/10 rounded-2xl p-6 shadow-lg flex-1 shadow-[0_0_50px_rgba(239,68,68,0.03)] flex flex-col transition-colors duration-300">
          
          <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-6 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗑️</span>
              <div>
                 <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-200 tracking-tight transition-colors duration-300">Trash Bin</h1>
                 <p className="text-slate-500 dark:text-gray-500 text-sm mt-1 transition-colors duration-300">Permanently erase or restore your deleted analyses.</p>
              </div>
            </div>
            
            {(deletedHistory.length > 0) && (
              <span className="text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                {deletedHistory.length} files detected
              </span>
            )}
          </div>

          <div className="space-y-4">
            {deletedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10 shadow-lg transition-colors duration-300">
                  <span className="text-3xl opacity-50">🍃</span>
                </div>
                <h4 className="text-slate-700 dark:text-gray-300 font-medium text-xl mb-2 transition-colors duration-300">Trash is completely empty</h4>
                <p className="text-slate-500 dark:text-gray-500 text-sm max-w-xs mx-auto transition-colors duration-300">Items you soft-delete from your Dashboard will automatically be securely stored here.</p>
              </div>
            ) : (
              deletedHistory.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                  className={`flex flex-col gap-3 p-5 rounded-xl border border-red-500/20 dark:border-white/10 cursor-pointer transition-all duration-300 group ${expandedItem === index ? 'bg-red-50 dark:bg-white/10 shadow-[0_0_30px_rgba(239,68,68,0.1)] border-red-500/40 dark:border-red-500/30' : 'bg-red-500/10 dark:bg-red-500/5 hover:bg-red-500/20 dark:hover:bg-red-500/10 hover:border-red-500/50 dark:hover:border-red-500/40 hover:scale-[1.01]'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-800 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition line-through decoration-red-500/80 dark:decoration-red-500/50">{item.custom_title || item.role}</span>
                      <span className="text-xs text-slate-600 dark:text-gray-500 bg-slate-200 dark:bg-black/40 px-2 py-1 rounded-md border border-slate-300 dark:border-white/5 transition-colors duration-300">
                        {new Date(item.deleted_at || item.original_created_at || item.date || "").toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Conditional Action Buttons */}
                      <div className="flex gap-2">
                         <button 
                           onClick={(e) => handleRestoreHistory(index, e)}
                           className="text-emerald-700 dark:text-emerald-500 bg-emerald-500/20 dark:bg-emerald-500/10 hover:bg-emerald-500/40 dark:hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 text-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                           title="Restore Analysis"
                         >
                           <span>♻️</span> Restore
                         </button>
                         <button 
                           onClick={(e) => handleHardDelete(index, e)}
                           className="text-red-700 dark:text-red-500 bg-red-500/20 dark:bg-red-500/10 hover:bg-red-500/40 dark:hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 text-sm shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                           title="Permanently Delete"
                         >
                           <span>🚨</span> Erase
                         </button>
                      </div>

                      <span className="text-blue-600 dark:text-blue-400 font-bold px-3 py-1 bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-white/5 rounded-lg text-sm grayscale opacity-70 transition-colors duration-300">{item.score}/100</span>
                      <span className={`text-slate-500 dark:text-gray-500 transform transition-transform duration-300 ${expandedItem === index ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                  
                  {/* Expandable Content Area */}
                  {expandedItem === index && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-4 animate-fadeIn grayscale opacity-80 transition-colors duration-300">
                      {/* Strengths */}
                      <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 p-4 rounded-xl px-5 transition-colors duration-300">
                        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2"><span>✨</span> Core Strengths</h4>
                        <p className="text-slate-700 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed transition-colors duration-300">{item.strengths || "Analysis did not record specific strengths for this session."}</p>
                      </div>

                      {/* Missing */}
                      <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 p-4 rounded-xl px-5 transition-colors duration-300">
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-500 mb-2 flex items-center gap-2"><span>⚠️</span> Missing Skills</h4>
                        <p className="text-slate-700 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed transition-colors duration-300">{item.missing || "Analysis did not record missing skills for this session."}</p>
                      </div>

                      {/* Improvements */}
                      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/10 p-4 rounded-xl px-5 transition-colors duration-300">
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2"><span>📈</span> Recommended Improvements</h4>
                        <p className="text-slate-700 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed transition-colors duration-300">{item.improvements || "Analysis did not record required improvements for this session."}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
