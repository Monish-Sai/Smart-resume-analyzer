"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../utils/supabaseClient";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Define the shape of our history
type HistoryItem = {
  id?: string;
  role: string;
  score: number;
  date?: string;
  created_at?: string;
  strengths?: string;
  missing?: string;
  improvements?: string;
  is_favorite?: boolean;
  custom_title?: string;
};

export default function DashboardPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>("");

  // Fetch true history from the Supabase Cloud
  useEffect(() => {
    async function loadData() {
      if (userId) {
        const { data } = await supabase
          .from('resume_history')
          .select('*')
          .eq('user_id', userId)
          .order('is_favorite', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });
        
        if (data) setHistory(data);
      }
    }
    loadData();
  }, [userId]);

  // Favorite Interaction
  const handleToggleFavorite = async (indexToToggle: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = history[indexToToggle];
    const newFavoriteState = !item.is_favorite;
    
    // Aggressive Optimistic UI with Deep State Isolation
    const updatedHistory = [...history];
    updatedHistory[indexToToggle] = { ...item, is_favorite: newFavoriteState };
    
    // Auto re-sort structurally client-side with native Temporal fallback
    updatedHistory.sort((a, b) => {
       if (a.is_favorite === b.is_favorite) {
           // Fallback chronological sort so arrays don't randomly flip
           return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
       }
       return a.is_favorite ? -1 : 1;
    });
    
    setHistory(updatedHistory);
    setExpandedItem(null); // Reset layout to prevent UI bounds glitching

    if (item.id) {
       await supabase.from('resume_history').update({ is_favorite: newFavoriteState }).eq('id', item.id);
    }
  };

  // Title Mutation (Rename)
  const handleUpdateTitle = async (indexToEdit: number, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const item = history[indexToEdit];
    if (!item.id || !editTitleInput.trim()) {
      setEditingItemId(null);
      return;
    }

    // Optimistic Push
    const updatedHistory = [...history];
    updatedHistory[indexToEdit] = { ...item, custom_title: editTitleInput.trim() };
    setHistory(updatedHistory);
    setEditingItemId(null); // Close Editor

    await supabase.from('resume_history').update({ custom_title: editTitleInput.trim() }).eq('id', item.id);
  };

  // Handle Cloud data deletion safely (Soft Delete)
  const handleDeleteHistory = async (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents accordion expansion
    
    // Get item that is being deleted
    const itemToDelete = history[indexToDelete];
    
    // Optimistic UI Update
    const newHistory = history.filter((_, idx) => idx !== indexToDelete);
    setHistory(newHistory);
    
    // Shift the active accordion bounds securely
    if (expandedItem === indexToDelete) {
      setExpandedItem(null);
    } else if (expandedItem !== null && expandedItem > indexToDelete) {
      setExpandedItem(expandedItem - 1);
    }

    // Cloud Re-Routing
    if (itemToDelete.id) {
       const { error: insertError } = await supabase.from('resume_history_deleted').insert([{
           original_id: itemToDelete.id,
           user_id: userId,
           role: itemToDelete.role,
           score: itemToDelete.score,
           strengths: itemToDelete.strengths,
           missing: itemToDelete.missing,
           improvements: itemToDelete.improvements,
           custom_title: itemToDelete.custom_title
       }]);

       if (insertError) {
         console.error("Failed to map to trash bin:", insertError);
       } else {
         await supabase.from('resume_history').delete().eq('id', itemToDelete.id);
       }
    }
  };

  // Convert and compile text outputs into an instantly downloadable PDF
  const handleDownloadPDF = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();

    const doc = new jsPDF();
    const primaryColor = "#3b82f6";
    const textColor = "#1f2937";
    const lightText = "#6b7280";

    // Title Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primaryColor);
    doc.text("Resume Analysis Report", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightText);
    doc.text(`Target Role: ${item.role}`, 20, 30);
    doc.text(`Date Analyzed: ${new Date(item.created_at || item.date || "").toLocaleDateString()}`, 20, 37);

    // Score Render
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(item.score >= 75 ? "#10b981" : item.score >= 50 ? "#f59e0b" : "#ef4444");
    doc.text(`Overall Score: ${item.score}/100`, 140, 30);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);

    // Dynamic Multi-Line Mapping
    let yPos = 55;
    const splitText = (text: string) => doc.splitTextToSize(text || "Not recorded.", 170);

    // Core Strengths Segment
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Core Strengths:", 20, yPos);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightText);
    const strengthsLines = splitText(item.strengths || "");
    doc.text(strengthsLines, 20, yPos + 7);
    yPos += (strengthsLines.length * 6) + 15;

    // Missing Skills Segment
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Missing Skills:", 20, yPos);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightText);
    const missingLines = splitText(item.missing || "");
    doc.text(missingLines, 20, yPos + 7);
    yPos += (missingLines.length * 6) + 15;

    // Trigger PDF multi-paging if necessary before Improvements
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // Improvements Segment
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text("Recommended Improvements:", 20, yPos);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightText);
    const improvementLines = splitText(item.improvements || "");
    doc.text(improvementLines, 20, yPos + 7);

    doc.save(`Resume_Analysis_${item.role.replace(/\s+/g, '_')}.pdf`);
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="w-full flex-1 max-w-6xl flex justify-center mx-auto">
      <div className="w-full max-w-4xl flex flex-col pt-6 md:pt-10 px-4 md:px-6 animate-fadeIn mx-auto">
        {/* Back Button */}
        <div className="w-full mb-6 flex justify-start">
          <Link 
            href="/"
            className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 px-4 py-2 rounded-xl w-fit transition-colors duration-300"
          >
            <span>←</span> Back to Analyzer
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12 pb-6 transition-colors duration-300">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Dashboard Overview</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm md:text-base">Track your AI extraction performance</p>
          </div>

          <Link
            href="/"
            className="w-full sm:w-auto text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] hover:shadow-md transition-all px-6 py-2.5 rounded-xl font-medium cursor-pointer"
          >
            New Analysis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-8 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1 transition-colors duration-300">Total Analyses</p>
              <h2 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">{history.length}</h2>
            </div>
            <div className="text-4xl opacity-50">📊</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-8 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1 transition-colors duration-300">Best Score</p>
              <h2 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">
                {history.length > 0 ? Math.max(...history.map(h => h.score)) : 0}%
              </h2>
            </div>
            <div className="text-4xl opacity-50">🏆</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-8 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1 transition-colors duration-300">Average Score</p>
              <h2 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">
                {history.length > 0 ? Math.floor(history.reduce((a, b) => a + b.score, 0) / history.length) : 0}%
              </h2>
            </div>
            <div className="text-4xl opacity-50">📈</div>
          </div>
        </div>

        {/* Temporal Recharts Sequence */}
        {history.length > 1 && (
          <div className="w-full h-auto bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] mb-10 flex flex-col">
            <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100 mb-6 tracking-tight">
              Analysis Progression Trend
            </h3>
            <div className="w-full h-[250px] relative mt-2">
              <ResponsiveContainer width="99%" height={250}>
                <LineChart data={[...history].reverse().map((h, i) => ({ name: `Analysis ${i + 1}`, date: new Date(h.created_at || h.date || "").toLocaleDateString(), score: h.score, role: h.role }))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Aggregated Skills Analytics */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="backdrop-blur-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 rounded-2xl p-6 shadow-lg transition-colors duration-300">
               <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2"><span>✨</span> Core Strengths Tracker</h3>
               <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                 {history.slice(0, 3).map(h => h.strengths).join(' ').substring(0, 300) + "..."}
               </p>
             </div>
             <div className="backdrop-blur-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 rounded-2xl p-6 shadow-lg transition-colors duration-300">
               <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2"><span>⚠️</span> Frequent Missing Skills</h3>
               <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                 {history.slice(0, 3).map(h => h.missing).join(' ').substring(0, 300) + "..."}
               </p>
             </div>
          </div>
        )}
        
        {/* History Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex-1 transition-colors duration-300 flex flex-col mb-10">
          
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
            <h3 className="font-semibold text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">
              Previous Analyses Records
            </h3>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeIn">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10 shadow-lg transition-colors duration-300">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="text-slate-700 dark:text-gray-300 font-medium text-lg mb-1 transition-colors duration-300">
                  No analyses yet
                </h4>
                <p className="text-slate-500 dark:text-gray-500 text-sm max-w-xs mx-auto transition-colors duration-300">
                  Upload your first resume and compare it against a job description to see your score.
                </p>
              </div>
            ) : (
              history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                  className={`group flex flex-col gap-3 p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${expandedItem === index ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 shadow-md' : 'border-zinc-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="text" 
                            className="bg-black/60 border border-blue-500/50 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px] sm:max-w-[200px]"
                            value={editTitleInput}
                            autoFocus
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleUpdateTitle(index, e) }}
                          />
                          <button onClick={(e) => handleUpdateTitle(index, e)} className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white px-2 py-1.5 rounded transition">Save</button>
                          <button onClick={() => setEditingItemId(null)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1.5 rounded transition">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition">
                            {item.custom_title || item.role}
                          </span>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditTitleInput(item.custom_title || item.role); 
                              setEditingItemId(item.id || null);
                            }}
                            className="text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Rename"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      
                      {editingItemId !== item.id && (
                        <span className="text-xs text-slate-600 dark:text-gray-500 bg-slate-200 dark:bg-black/40 px-2 py-1 rounded-md border border-slate-300 dark:border-white/5 whitespace-nowrap transition-colors duration-300">
                          {new Date(item.created_at || item.date || "").toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => handleToggleFavorite(index, e)}
                        className={`p-1.5 rounded transition ${item.is_favorite ? 'text-yellow-400 hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                        title={item.is_favorite ? "Unpin Favorite" : "Pin to Top"}
                      >
                         {item.is_favorite ? '⭐' : '☆'}
                      </button>

                      {/* PDF Export Button */}
                      <button 
                        onClick={(e) => handleDownloadPDF(item, e)}
                        className="text-slate-500 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-1.5 rounded transition-colors duration-300"
                        title="Download PDF Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>

                      {/* Delete Action Button */}
                      <button 
                        onClick={(e) => handleDeleteHistory(index, e)}
                        className="text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded transition-colors duration-300"
                        title="Move to Trash"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                      </button>

                      <span className="text-blue-600 dark:text-blue-400 font-bold px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-sm transition-colors duration-300">{item.score}/100</span>
                      <span className={`text-slate-500 dark:text-gray-400 transform transition-transform duration-300 ${expandedItem === index ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar Component */}
                  <div className="w-full bg-slate-200 dark:bg-gray-700/50 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 mt-1 group-hover:bg-slate-300 dark:group-hover:bg-gray-700/80 transition-colors duration-300">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${item.score}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
                    </div>
                  </div>

                  {/* Expandable Content Area */}
                  <AnimatePresence>
                    {expandedItem === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-4 transition-colors duration-300">
                          {/* Strengths */}
                          <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 p-4 rounded-xl hover:bg-green-100 dark:hover:bg-green-500/10 transition px-5 duration-300">
                            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2"><span>✨</span> Core Strengths</h4>
                            <p className="text-slate-700 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed transition-colors duration-300">{item.strengths || "Analysis did not record specific strengths for this session."}</p>
                          </div>

                          {/* Missing */}
                          <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 p-4 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/10 transition px-5 duration-300">
                            <h4 className="text-sm font-semibold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2"><span>⚠️</span> Missing Skills</h4>
                            <p className="text-slate-700 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed transition-colors duration-300">{item.missing || "Analysis did not record missing skills for this session."}</p>
                          </div>

                          {/* Improvements */}
                          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/10 p-4 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/10 transition px-5 duration-300">
                            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2"><span>📈</span> Recommended Improvements</h4>
                            <p className="text-slate-700 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed transition-colors duration-300">{item.improvements || "Analysis did not record required improvements for this session."}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
