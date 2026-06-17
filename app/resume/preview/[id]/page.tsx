"use client";

import { useEffect, useState } from "react";
import { useAuth, useSession } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { supabase, createClerkSupabaseClient } from "../../../../utils/supabaseClient";
import ResumePreview from "../../../../components/ResumePreview";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ResumePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  
  const [resumeData, setResumeData] = useState<any>(null);
  const [template, setTemplate] = useState<string>('modern_sidebar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResume() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push('/');
        return;
      }
      if (session && id) {
        try {
          const token = await session.getToken({ template: 'supabase' });
          const supabaseAuth = token ? createClerkSupabaseClient(token) : supabase;
          const { data, error } = await supabaseAuth
            .from('generated_resumes')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

          if (error || !data) {
            console.error("Error fetching resume:", error);
            alert("Resume not found or you don't have permission to view it.");
            router.push('/dashboard');
          } else {
            setResumeData(data.resume_data);
            setTemplate(data.template_id);
          }
        } catch (error) {
          console.error("Exception fetching resume:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchResume();
  }, [id, session, isLoaded, isSignedIn, userId, router]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!resumeData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 print:bg-white text-zinc-900 dark:text-zinc-100 flex flex-col items-center py-10 print:py-0 print:block">
      
      {/* Controls Bar - Hidden on Print */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4 print:hidden">
        <button 
          onClick={() => router.back()}
          className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
        >
          <span>←</span> Back
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Resume Container */}
      <div className="w-full max-w-4xl bg-white shadow-2xl print:shadow-none mx-auto print:m-0 print:p-0 overflow-hidden">
        <div id="resume-preview-container">
          <ResumePreview data={resumeData} template={template as any} />
        </div>
      </div>

    </div>
  );
}
