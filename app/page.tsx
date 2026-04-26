"use client";

import { useState, useEffect } from "react";
import { useAuth, SignUpButton, SignInButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { supabase } from "../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Zap, ChevronRight, CheckCircle2, FileSearch, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function Home() {
  const { isSignedIn, userId } = useAuth();
  const [result, setResult] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [sections, setSections] = useState({
    strengths: "",
    missing: "",
    improvements: ""
  });

  // Pull settings from local simulation
  useEffect(() => {
    if (userId) {
      const savedRole = localStorage.getItem(`default_role_${userId}`);
      if (savedRole) setRole(savedRole);
    }
  }, [userId]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setText(""); // Clear previous text immediately
      extractText(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const rolesList = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Python Developer",
    "Data Analyst",
    "Machine Learning Engineer",
    "Software Engineer",
    "DevOps Engineer",
    "UI/UX Designer"
  ];

  const extractText = async (file: File) => {
    const parsingToast = toast.loading("Extracting text from resume...");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");

      if (isPdf) {
        // PDF Extraction
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => ('str' in item ? (item as unknown as { str: string }).str : ""));
          fullText += strings.join(" ") + " ";
        }
        
        if (!fullText.trim()) {
          throw new Error("No readable text found in PDF. It might be an image-based scan.");
        }
        
        setText(fullText);
        toast.success("Resume text extracted successfully!", { id: parsingToast });
      } else if (isDocx) {
        // DOCX Extraction
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        if (!result.value.trim()) {
          throw new Error("No readable text found in Word document.");
        }
        
        setText(result.value);
        toast.success("Resume text extracted successfully!", { id: parsingToast });
      } else {
        toast.error("Unsupported file type. Please upload a PDF or DOCX.", { id: parsingToast });
      }
    } catch (error: any) {
      console.error("Extraction Error:", error);
      toast.error(error.message || "Failed to extract text from file.", { id: parsingToast });
    }
  };


  const parseChips = (text: string) => {
    if (!text) return [];
    return text
      .split(/,|\n/)
      .map(s => s.replace(/^[-*•]\s*/, '').trim())
      .filter(s => s.length > 0 && s.toLowerCase() !== 'none');
  };

  const handleAnalyze = async () => {
    if (!text) {
      toast.error("Please upload your Resume document first!");
      return;
    }
    if (!role) {
      toast.error("Entering a Target Role (e.g., Software Engineer) is strictly required.");
      return;
    }

    setLoading(true);
    setResult("");
    setScore(null);
    setSections({ strengths: "", missing: "", improvements: "" });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, role, jobDescription })
      });

      const data = await res.json();
      const output = data.result;
      setResult(output);

      // 🔥 Extract ATS Score Safely
      let parsedScore = 0;
      const atsLine = output.split('\n').find((line: string) => line.toLowerCase().includes('score') || line.toLowerCase().includes('percentage'));
      if (atsLine) {
        const nums = atsLine.match(/\d+/g);
        if (nums) {
          const validScores = nums.map((n: string) => parseInt(n, 10)).filter((n: number) => n >= 0 && n <= 100 && n !== 1);
          if (validScores.length > 0) {
            parsedScore = validScores[0];
          } else {
             parsedScore = parseInt(nums[0], 10);
          }
        }
      }
      setScore(parsedScore > 100 ? 100 : parsedScore);

      // 🔥 Extract sections using dynamic Regex bindings guarding against prompt variations
      let extractedStrengths = "";
      let extractedMissing = "";
      let extractedImprovements = "";
      
      const sections = output.split(/(?=\d\.\s)/); 
      
      sections.forEach((sec: string) => {
        if (sec.startsWith("2.")) {
          extractedStrengths = sec.replace(/^2\.\s*/, '').replace(/^.*?(Skills|Strengths).*?[:\-]\s*/i, '').trim();
          // Fallback if no colon was provided and it just started listing
          if (extractedStrengths.toLowerCase().startsWith('matched') || extractedStrengths.toLowerCase().startsWith('strengths')) {
              extractedStrengths = extractedStrengths.replace(/^(Matched Skills|Strengths)[\s\n]*/i, '');
          }
        }
        if (sec.startsWith("3.")) {
          extractedMissing = sec.replace(/^3\.\s*/, '').replace(/^.*?Missing.*?[:\-]\s*/i, '').trim();
          if (extractedMissing.toLowerCase().startsWith('missing')) {
              extractedMissing = extractedMissing.replace(/^Missing Skills[\s\n]*/i, '');
          }
        }
        if (sec.startsWith("4.")) {
          extractedImprovements = sec.replace(/^4\.\s*/, '').replace(/^.*?(Suggestions|Improvements).*?[:\-]\s*/i, '').trim();
        }
      });
      
      // Fallback Legacy Splitter
      if (!extractedStrengths && !extractedMissing && !extractedImprovements) {
          extractedStrengths = output.split(/Strengths:?/i)[1]?.split(/Missing/i)[0]?.trim() || "";
          extractedMissing = output.split(/Missing.*?:?/i)[1]?.split(/Improvement|Suggestion/i)[0]?.trim() || "";
          extractedImprovements = output.split(/Improvement.*?:?|Suggestion.*?:?/i)[1]?.trim() || "";
      }

      setSections({
        strengths: extractedStrengths,
        missing: extractedMissing,
        improvements: extractedImprovements
      });

      // 🔥 Broadcast to Supabase Cloud Cluster
      if (userId) {
        const { error: uploadError } = await supabase
          .from('resume_history')
          .insert([{
            user_id: userId,
            role: role,
            score: parsedScore,
            strengths: extractedStrengths,
            missing: extractedMissing,
            improvements: extractedImprovements
          }]);

        if (uploadError) {
           console.error("Cloud Synchronization Failed:", uploadError);
        }

        // Handle Auto-Export Setting
        if (localStorage.getItem(`auto_export_${userId}`) === "true") {
           const doc = new jsPDF();
           const primaryColor = "#3b82f6";
           
           doc.setFont("helvetica", "bold");
           doc.setFontSize(22);
           doc.setTextColor(primaryColor);
           doc.text("Resume Analysis Report", 20, 20);

           doc.setFontSize(12);
           doc.setFont("helvetica", "normal");
           doc.setTextColor("#6b7280");
           doc.text(`Target Role: ${role}`, 20, 30);
           
           doc.setFontSize(16);
           doc.setFont("helvetica", "bold");
           doc.setTextColor(parsedScore >= 75 ? "#10b981" : parsedScore >= 50 ? "#f59e0b" : "#ef4444");
           doc.text(`Overall Score: ${parsedScore}/100`, 140, 30);
           
           doc.setDrawColor(200, 200, 200);
           doc.line(20, 45, 190, 45);

           const yPos = 55;
           const splitText = (text: string) => doc.splitTextToSize(text || "Not recorded.", 170);

           doc.setFontSize(14);
           doc.setTextColor("#1f2937");
           doc.text("Overall Feedback Extract:", 20, yPos);
           
           doc.setFontSize(12);
           doc.setFont("helvetica", "normal");
           doc.setTextColor("#6b7280");
           const blockLines = splitText(output);
           doc.text(blockLines, 20, yPos + 7);

           doc.save(`AutoExport_${role.replace(/\s+/g, '_')}.pdf`);
        }
      }

    } catch (error) {
      console.error(error);
      setResult("Error analyzing ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col items-center px-4 md:px-6 py-8 md:py-10 w-full relative animate-fadeIn transition-colors duration-300">

      {/* Unauthenticated Premium SaaS Landing Experience */}
      {!isSignedIn && (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[85vh] space-y-20 py-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center space-y-6 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">
              <Zap className="w-4 h-4" />
              <span>The Next Generation ATS Engine</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
              Land your dream job with <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Precision AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Drop your resume, paste the job description, and let our deep-learning engine uncover exactly what skills you&apos;re missing before you ever apply.
            </p>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center"
            >
              <SignUpButton mode="modal">
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300">
                  Analyze Resume Now <ChevronRight className="w-5 h-5" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl font-semibold text-slate-700 dark:text-white text-lg transition-all duration-300">
                  Sign In
                </button>
              </SignInButton>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4"
          >
            {[
              { icon: Target, title: "ATS Score Analysis", desc: "Instantly calculate your strict resume match percentage against modern parsing algorithms." },
              { icon: FileSearch, title: "Skill Gap Detection", desc: "Identify exact missing keywords required by the target job description to bypass filters." },
              { icon: CheckCircle2, title: "AI Suggestions", desc: "Receive highly actionable, bulleted modifications to dramatically boost your candidacy." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                className="flex flex-col items-center text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Authenticated App Interface */}
      {isSignedIn && (
        <div className="w-full flex items-center flex-col animate-fadeIn relative">
          {/* Header Section */}
          <div className="text-center w-full mb-10 space-y-4 transition-colors duration-300">
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-500 bg-clip-text text-transparent">
              Smart Resume Analyzer
            </h1>
            <div className="text-slate-500 dark:text-gray-400 text-sm transition-colors duration-300">
              Upload your resume and get instant AI feedback on:
              <div className="flex justify-center gap-4 mt-3 text-xs text-slate-700 dark:text-gray-200">
                <span className="bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-full transition-colors duration-300">ATS Score</span>
                <span className="bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-full transition-colors duration-300">Skills</span>
                <span className="bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-full transition-colors duration-300">Improvements</span>
              </div>
            </div>
          </div>

          {/* Premium High-Tier Card */}
          <motion.div layout className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:border-zinc-700/50">

            {/* File Upload Dropzone */}
            <div 
              {...getRootProps()} 
              className={`relative group p-6 md:p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-500/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${isDragActive ? 'text-blue-500' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-blue-400'}`} />
              {file ? (
                <div className="flex flex-col items-center text-center">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[250px]">{file.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    {file.size < 1024 * 100 
                      ? `${(file.size / 1024).toFixed(1)} KB` 
                      : `${(file.size / 1024 / 1024).toFixed(2)} MB`} • Ready to Parse
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {isDragActive ? 'Drop your PDF here...' : 'Drag & drop your resume PDF here'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1">or click to browse your files</p>
                </div>
              )}
            </div>

            {/* Role Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter role (Frontend Developer)"
                value={role}
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-zinc-100 transition-all duration-300"
                onChange={(e) => {
                  const value = e.target.value;
                  setRole(value);

                  const filtered = rolesList.filter((r) =>
                    r.toLowerCase().includes(value.toLowerCase())
                  );

                  setFilteredRoles(filtered);
                }}
              />

              {/* Suggestions */}
              {filteredRoles.length > 0 && (
                <div className="absolute w-full mt-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg border border-slate-200 dark:border-white/10 z-10 transition-colors duration-300">
                  {filteredRoles.map((r, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer text-sm text-slate-800 dark:text-gray-200 transition-colors duration-300"
                      onClick={() => {
                        setRole(r);
                        setFilteredRoles([]);
                      }}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job Description Optional Input */}
            <div className="relative">
              <textarea
                placeholder="Optional: Paste the target Job Description to generate a direct Match Score percentage & highlight specific missing keywords..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-zinc-100 transition-all duration-300 min-h-[120px] resize-y text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>

            {/* Manual Text Fallback Toggle */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-500">Problem extracting?</span>
              <button 
                onClick={() => setFile(null)} 
                className="text-xs text-blue-500 hover:underline"
              >
                Clear & Paste Text Instead
              </button>
            </div>

            {/* Resume Text Area (Manual Fallback) */}
            {!file && (
              <div className="relative">
                <textarea
                  placeholder="Paste your resume text here directly if extraction fails..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-zinc-900 dark:text-zinc-100 transition-all duration-300 min-h-[150px] resize-y text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
                <div className="absolute top-3 right-3 text-[10px] text-zinc-400 font-mono">MANUAL MODE</div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
                loading
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                  : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.01] hover:shadow-md"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                "Analyze Now"
              )}
            </button>

          </motion.div>

          {/* Result Section mapped via AnimatePresence */}
          <div className="w-full max-w-2xl mt-8 space-y-6">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
                >
                  <div className="flex items-center gap-4 animate-pulse">
                     <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                     <div className="flex-1 space-y-3">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800/50 rounded w-1/2"></div>
                     </div>
                  </div>
                  <div className="space-y-3 pt-4">
                     <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded w-full animate-pulse"></div>
                     <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded w-5/6 animate-pulse"></div>
                     <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded w-4/6 animate-pulse"></div>
                  </div>
                </motion.div>
              )}

              {!loading && result !== "" && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* SCORE CARD */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                    <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Match Percentage</h3>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-4 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-zinc-900 dark:bg-white h-full rounded-full"
                      />
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{score}/100</p>
                  </div>

                  {/* STRENGTHS */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="text-emerald-600 dark:text-emerald-400 font-semibold mb-4 text-lg flex items-center gap-2">
                       <CheckCircle2 size={18} /> Skills Detected
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parseChips(sections.strengths).length > 0 ? (
                         parseChips(sections.strengths).map((chip, idx) => (
                           <motion.span 
                             key={idx}
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: idx * 0.05 }}
                             className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 rounded-lg text-sm font-medium shadow-sm hover:scale-105 transition-transform cursor-default"
                           >
                              {chip}
                           </motion.span>
                         ))
                      ) : (
                         <p className="text-zinc-500 dark:text-zinc-400 text-sm italic">No matching skills detected.</p>
                      )}
                    </div>
                  </div>

                  {/* MISSING SKILLS */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="text-red-600 dark:text-red-400 font-semibold mb-4 text-lg flex items-center gap-2">
                       <Zap size={18} /> Missing Skills (Gaps)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parseChips(sections.missing).length > 0 ? (
                         parseChips(sections.missing).map((chip, idx) => (
                           <motion.span 
                             key={idx}
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: idx * 0.05 }}
                             className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 rounded-lg text-sm font-medium shadow-sm hover:scale-105 transition-transform cursor-default"
                           >
                              {chip}
                           </motion.span>
                         ))
                      ) : (
                         <p className="text-zinc-500 dark:text-zinc-400 text-sm italic">No missing skills identified!</p>
                      )}
                    </div>
                  </div>


                  {/* IMPROVEMENTS */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-4 text-lg">Actionable Suggestions</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {sections.improvements || "No improvements identified."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

    </div>
  );
}
