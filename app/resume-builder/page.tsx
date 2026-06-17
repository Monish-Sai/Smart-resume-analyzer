"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, useSession } from "@clerk/nextjs";
import { supabase, createClerkSupabaseClient } from "../../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import ResumePreview from "../../components/ResumePreview";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const degreeOptions = [
  { group: "Engineering & Technology", options: ["Bachelor of Technology (B.Tech)", "Bachelor of Engineering (B.E.)", "Master of Technology (M.Tech)", "Master of Engineering (M.E.)", "Diploma in Engineering"] },
  { group: "Computer Applications", options: ["Bachelor of Computer Applications (BCA)", "Master of Computer Applications (MCA)"] },
  { group: "Science", options: ["Bachelor of Science (B.Sc)", "Master of Science (M.Sc)"] },
  { group: "Commerce", options: ["Bachelor of Commerce (B.Com)", "Master of Commerce (M.Com)"] },
  { group: "Management", options: ["Bachelor of Business Administration (BBA)", "Master of Business Administration (MBA)"] },
  { group: "Arts & Humanities", options: ["Bachelor of Arts (BA)", "Master of Arts (MA)"] },
  { group: "Law", options: ["Bachelor of Laws (LLB)", "Master of Laws (LLM)"] },
  { group: "Medical & Healthcare", options: ["Bachelor of Medicine and Bachelor of Surgery (MBBS)", "Bachelor of Dental Surgery (BDS)", "Bachelor of Pharmacy (B.Pharm)", "Master of Pharmacy (M.Pharm)", "Bachelor of Physiotherapy (BPT)"] },
  { group: "Education", options: ["Bachelor of Education (B.Ed)", "Master of Education (M.Ed)"] },
  { group: "Finance & Accounting", options: ["Chartered Accountant (CA)", "Company Secretary (CS)", "Cost and Management Accountant (CMA)"] },
  { group: "Research", options: ["Doctor of Philosophy (PhD)"] },
  { group: "Vocational", options: ["Polytechnic Diploma", "Industrial Training Institute (ITI)"] },
  { group: "Other", options: ["Other"] },
];

const specializationOptions = [
  { group: "Technology", options: ["Computer Science", "Information Technology", "Artificial Intelligence", "Data Science", "Cyber Security", "Software Engineering", "Machine Learning", "Cloud Computing"] },
  { group: "Engineering", options: ["Electronics and Communication", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Aerospace Engineering"] },
  { group: "Business & Commerce", options: ["Finance", "Marketing", "Human Resources", "Accounting", "Economics", "Business Analytics"] },
  { group: "Science", options: ["Physics", "Chemistry", "Mathematics", "Biotechnology"] },
  { group: "Medical", options: ["Medicine", "Pharmacy", "Physiotherapy"] },
  { group: "Other", options: ["Other"] },
];

const universityOptions = [
  {
    group: "India", options: [
      "Indian Institute of Technology Bombay (IIT Bombay)",
      "Indian Institute of Technology Delhi (IIT Delhi)",
      "Indian Institute of Technology Madras (IIT Madras)",
      "Indian Institute of Technology Kharagpur (IIT Kharagpur)",
      "Indian Institute of Technology Kanpur (IIT Kanpur)",
      "Indian Institute of Technology Roorkee (IIT Roorkee)",
      "National Institute of Technology Trichy (NIT Trichy)",
      "National Institute of Technology Warangal (NIT Warangal)",
      "National Institute of Technology Surathkal (NITK)",
      "Birla Institute of Technology and Science Pilani (BITS Pilani)",
      "Vellore Institute of Technology (VIT)",
      "SRM Institute of Science and Technology (SRM)",
      "Manipal Academy of Higher Education (MAHE)",
      "Delhi Technological University (DTU)",
      "Jawaharlal Nehru Technological University (JNTU)",
      "Osmania University",
      "Anna University",
      "University of Hyderabad",
      "Andhra University",
      "NxtWave Institute of Advanced Technologies"
    ]
  },
  {
    group: "International", options: [
      "Harvard University",
      "Stanford University",
      "Massachusetts Institute of Technology (MIT)",
      "Carnegie Mellon University",
      "University of California Berkeley",
      "California Institute of Technology (Caltech)",
      "University of Oxford",
      "University of Cambridge",
      "Imperial College London",
      "ETH Zurich",
      "National University of Singapore (NUS)",
      "Nanyang Technological University (NTU)"
    ]
  }
];

const programmingLanguages = ["JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "SQL"];
const frameworksLibraries = ["React", "Next.js", "Angular", "Vue.js", "Node.js", "Express.js", "NestJS", "Django", "Flask", "Spring Boot", "Laravel", "FastAPI", "Tailwind CSS", "Bootstrap"];
const databasesList = ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Supabase", "Firebase", "Redis", "Oracle", "SQL Server"];
const toolsPlatforms = ["Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Vercel", "Netlify", "Postman", "Figma", "Jira", "Linux", "VS Code"];

const projectTechnologies = ["React", "Next.js", "Node.js", "Express.js", "TypeScript", "JavaScript", "Python", "Java", "C++", "MongoDB", "MySQL", "PostgreSQL", "Supabase", "Firebase", "AWS", "Docker", "Tailwind CSS", "Bootstrap", "GitHub", "Vercel", "Netlify", "Hugging Face", "OpenAI"];

const roleOptions = [
  { group: "Software & Development", options: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "React Developer", "Next.js Developer", "Node.js Developer", "Python Developer", "Java Developer", "Mobile App Developer"] },
  { group: "Data & AI", options: ["Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer"] },
  { group: "Infrastructure & Security", options: ["DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst"] },
  { group: "Product & Design", options: ["Product Manager", "UI/UX Designer", "QA Engineer"] },
  { group: "Other", options: ["Intern"] }
];

const months = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 40 }, (_, i) => currentYear + 5 - i);

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxResults,
  showLogo,
  showManualEntry
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { group: string; options: string[] }[];
  placeholder: string;
  maxResults?: number;
  showLogo?: boolean;
  showManualEntry?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== query) setQuery(value);
  }, [value]);

  let matchCount = 0;
  const filteredOptions = options.map(group => {
    const matchedOptions = group.options.filter(opt => {
      if (maxResults && matchCount >= maxResults) return false;
      const isMatch = opt.toLowerCase().includes(query.toLowerCase());
      if (isMatch) matchCount++;
      return isMatch;
    });
    return { group: group.group, options: matchedOptions };
  }).filter(group => group.options.length > 0);

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightMatch = (text: string, q: string) => {
    if (!q) return <>{text}</>;
    const escapedQ = escapeRegExp(q);
    const parts = text.split(new RegExp(`(${escapedQ})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span key={i} className="text-indigo-600 dark:text-indigo-400 font-bold">{part}</span>
          ) : part
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
        placeholder={placeholder}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[100%] mt-2 left-0 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 dark:text-gray-400 text-center">No options found. Press enter to use custom value.</div>
            ) : (
              filteredOptions.map((group, i) => (
                <div key={i}>
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50 dark:bg-black/20 sticky top-0 backdrop-blur-md z-10">
                    {group.group}
                  </div>
                  {group.options.map((opt, j) => (
                    <div
                      key={j}
                      onClick={() => {
                        setQuery(opt);
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className="px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      {showLogo && (
                        <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 font-bold text-xs shrink-0 border border-slate-300 dark:border-zinc-700">
                          {opt.charAt(0)}
                        </div>
                      )}
                      <div>
                        {highlightMatch(opt, query)}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}

            {showManualEntry && query && filteredOptions.length === 0 && (
              <div
                className="px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer border-t border-slate-100 dark:border-white/5 flex items-center gap-2 font-medium"
                onClick={() => {
                  onChange(query);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg">+</span> University not listed? Use "{query}"
              </div>
            )}
            {showManualEntry && filteredOptions.length > 0 && (
              <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 text-center bg-slate-50 dark:bg-black/20 sticky bottom-0 backdrop-blur-md z-10">
                University not listed? Type it manually and press enter.
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiSelectDropdown({
  label,
  value,
  onChange,
  options,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedList = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: string) => {
    if (!selectedList.includes(opt)) {
      const newList = [...selectedList, opt];
      onChange(newList.join(', '));
    }
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (opt: string) => {
    const newList = selectedList.filter(item => item !== opt);
    onChange(newList.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      handleSelect(query.trim());
    } else if (e.key === 'Backspace' && !query && selectedList.length > 0) {
      handleRemove(selectedList[selectedList.length - 1]);
    }
  };

  const filteredOptions = options.filter(opt => 
    !selectedList.includes(opt) && opt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">{label}</label>
      
      <div 
        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2.5 min-h-[50px] flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedList.map(item => (
          <span key={item} className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-sm font-semibold border border-indigo-200 dark:border-indigo-500/30 transition-colors">
            {item}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
              className="hover:bg-indigo-200 dark:hover:bg-indigo-500/40 rounded-full w-4 h-4 flex items-center justify-center transition-colors font-bold"
            >
              ×
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 py-0.5"
          placeholder={selectedList.length === 0 ? placeholder : ""}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[100%] mt-2 left-0 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 dark:text-gray-400 text-center">
                {query ? "Press Enter to add custom skill" : "No more options available"}
              </div>
            ) : (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className="px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition-colors"
                >
                  {opt}
                </div>
              ))
            )}
            
            {query && filteredOptions.length === 0 && (
              <div
                className="px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer border-t border-slate-100 dark:border-white/5 font-medium flex items-center gap-2"
                onClick={() => handleSelect(query)}
              >
                <span className="text-lg leading-none">+</span> Add "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResumeBuilderPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session } = useSession();

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("Generating Resume ✨...");
  const [generatedResume, setGeneratedResume] = useState<any | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern_sidebar' | 'graduate' | 'executive' | 'executive_classic' | 'developer'>('modern_sidebar');
  const [generateAISummary, setGenerateAISummary] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dateError, setDateError] = useState("");
  const [formData, setFormData] = useState({
    summary: "",
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    degree: "",
    specialization: "",
    college: "",
    cgpa: "",
    educationStartDate: "",
    educationEndDate: "",
    currentlyStudying: false,
    skills: {
      languages: "",
      frameworks: "",
      databases: "",
      tools: "",
    },
    projects: [
      { name: "", technologies: "", description: "", githubLink: "", liveLink: "", generateAIDescription: true, isGenerating: false }
    ],
    experience: [
      { company: "", role: "", duration: "", description: "" }
    ]
  });

  const handleNext = () => {
    if (step === 3) {
      if (!formData.currentlyStudying && formData.educationEndDate && formData.educationStartDate && formData.educationEndDate < formData.educationStartDate) {
        setDateError("End Date cannot be earlier than Start Date.");
        return;
      }
      setDateError("");
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      skills: { ...formData.skills, [e.target.name]: e.target.value }
    });
  };

  const handleProjectChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index] = { ...updatedProjects[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, projects: updatedProjects });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: "", technologies: "", description: "", githubLink: "", liveLink: "", generateAIDescription: true, isGenerating: false }]
    });
  };

  const removeProject = (index: number) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  };

  const generateProjectDescription = async (index: number) => {
    const project = formData.projects[index];
    
    const updatedProjects = [...formData.projects];
    updatedProjects[index] = { ...updatedProjects[index], isGenerating: true };
    setFormData({ ...formData, projects: updatedProjects });

    try {
      const res = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          technologies: project.technologies,
          liveLink: project.liveLink,
          githubLink: project.githubLink,
          role: formData.experience?.[0]?.role || "Software Engineer"
        })
      });
      const data = await res.json();
      if (data.success && data.description) {
        setFormData(prev => {
          const newProjects = [...prev.projects];
          newProjects[index] = { ...newProjects[index], description: data.description, isGenerating: false };
          return { ...prev, projects: newProjects };
        });
        setAiError(null);
      } else {
        setFormData(prev => {
          const newProjects = [...prev.projects];
          newProjects[index] = { ...newProjects[index], generateAIDescription: false, isGenerating: false };
          return { ...prev, projects: newProjects };
        });
        setAiError("⚠ AI generation is temporarily experiencing issues. Please manually enter your project description.");
      }
    } catch (error) {
      console.error(error);
      setFormData(prev => {
        const newProjects = [...prev.projects];
        newProjects[index] = { ...newProjects[index], generateAIDescription: false, isGenerating: false };
        return { ...prev, projects: newProjects };
      });
      setAiError("⚠ AI services are currently unavailable. You can continue manually and try again later.");
    }
  };

  const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, experience: updatedExperience });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: "", role: "", duration: "", description: "" }]
    });
  };

  const removeExperience = (index: number) => {
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: updatedExperience });
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="w-full flex-1 max-w-6xl flex justify-center mx-auto">
      <div className="w-full max-w-4xl flex flex-col pt-10 px-6 animate-fadeIn mx-auto">

        {/* Back to Dashboard */}
        <div className="w-full mb-8 flex justify-start print:hidden">
          <Link
            href="/dashboard"
            className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 px-4 py-2 rounded-xl w-fit transition-colors duration-300"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* Content Container */}
        <div className="backdrop-blur-xl bg-white dark:bg-white/5 border border-indigo-500/20 dark:border-indigo-500/10 rounded-3xl p-8 sm:p-12 shadow-xl shadow-[0_0_50px_rgba(99,102,241,0.03)] flex flex-col transition-colors duration-300 mb-10 relative overflow-hidden print:overflow-visible print:border-none print:shadow-none print:bg-none print:backdrop-blur-none print:p-0 print:m-0">

          <div className="flex flex-col items-center text-center mb-10 print:hidden">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-500/20 shadow-lg transition-colors duration-300">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight mb-2 transition-colors duration-300">
              AI Resume Builder
            </h1>
            <p className="text-slate-600 dark:text-gray-400 max-w-lg leading-relaxed transition-colors duration-300">
              Create a professional ATS-friendly resume using AI.
            </p>
          </div>

          {generatedResume ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full rounded-2xl md:p-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
                  <span>Your AI Resume ✨</span>
                </h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setGeneratedResume(null)}
                    className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Edit Details
                  </button>
                  <button 
                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    Print / Save PDF
                  </button>
                </div>
              </div>

              {/* Template Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide print:hidden">
                {[
                  { id: 'modern_sidebar', label: 'Modern Sidebar' },
                  { id: 'graduate', label: 'Graduate Student' },
                  { id: 'executive', label: 'Executive Professional' },
                  { id: 'executive_classic', label: 'Executive Classic' },
                  { id: 'developer', label: 'Developer Portfolio' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      selectedTemplate === t.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                        : 'bg-white dark:bg-black/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto rounded-xl shadow-inner text-left pb-10">
                <div id="builder-resume-preview-container">
                  <ResumePreview data={generatedResume} template={selectedTemplate} />
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' : step > s ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10'}`}>
                      {step > s ? '✓' : s}
                    </div>
                    {s !== 6 && (
                      <div className={`w-12 h-1 rounded-full transition-colors duration-300 ${step > s ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}></div>
                    )}
                  </div>
                ))}
              </div>

          {/* Form Area */}
          <div className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 transition-colors duration-300 min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-1 transition-colors duration-300">Personal Information</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">Let's start with the basics. Recruiters need to know how to reach you.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">Full Name</label>
                      <input
                        name="fullName" value={formData.fullName} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">Email Address</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">Phone Number</label>
                      <input
                        name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">Location</label>
                      <input
                        name="location" value={formData.location} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="City, State"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">LinkedIn URL</label>
                      <input
                        name="linkedin" value={formData.linkedin} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">GitHub URL</label>
                      <input
                        name="github" value={formData.github} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="github.com/johndoe"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
                    >
                      Next Step <span>→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-1 transition-colors duration-300">Professional Summary</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">Summarize your professional background and goals.</p>
                  </div>
                  
                  {aiError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn flex items-start gap-3">
                      <span className="text-lg">⚠</span>
                      <p>{aiError}</p>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="generateAISummary" 
                        checked={generateAISummary}
                        onChange={(e) => setGenerateAISummary(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 transition-all cursor-pointer"
                      />
                      <label htmlFor="generateAISummary" className="text-sm font-semibold text-slate-700 dark:text-gray-300 cursor-pointer">
                        ☑ Generate Professional Summary with AI
                      </label>
                    </div>

                    {!generateAISummary ? (
                      <div className="flex flex-col gap-1.5 flex-1 relative">
                        <textarea
                          name="summary"
                          value={formData.summary}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              handleChange(e as any);
                            }
                          }}
                          rows={6}
                          className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm resize-none"
                          placeholder="Example: Results-driven Computer Science student with experience in web development, AI-powered applications, and modern JavaScript frameworks. Passionate about building scalable software solutions and delivering exceptional user experiences."
                        />
                        <div className={`text-xs text-right mt-1 font-medium ${formData.summary.length >= 500 ? 'text-red-500' : 'text-slate-500 dark:text-gray-400'}`}>
                          {formData.summary.length} / 500
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 p-8 text-center animate-pulse">
                        <div className="w-12 h-12 bg-white dark:bg-black/20 rounded-full flex items-center justify-center mb-3 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                          <span className="text-xl">✨</span>
                        </div>
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">AI Summary Generation Enabled</h3>
                        <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 max-w-sm">
                          Our AI will automatically craft a powerful 3-sentence professional summary based on your profile and experience when you generate the resume.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5"
                    >
                      <span>←</span> Previous
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
                    >
                      Next Step <span>→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-1 transition-colors duration-300">Education</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">Tell us about your academic background.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 content-start">
                    <div className="md:col-span-2">
                      <SearchableDropdown
                        label="College / University Name"
                        value={formData.college}
                        onChange={(val) => setFormData({ ...formData, college: val })}
                        options={universityOptions}
                        placeholder="Search or type your college (e.g., Harvard University)"
                        maxResults={10}
                        showLogo={true}
                        showManualEntry={true}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <SearchableDropdown
                        label="Degree"
                        value={formData.degree}
                        onChange={(val) => setFormData({ ...formData, degree: val })}
                        options={degreeOptions}
                        placeholder="Search or type your degree (e.g., Bachelor of Technology)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <SearchableDropdown
                        label="Specialization"
                        value={formData.specialization}
                        onChange={(val) => setFormData({ ...formData, specialization: val })}
                        options={specializationOptions}
                        placeholder="Search or type your specialization (e.g., Computer Science)"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">CGPA</label>
                      <input
                        name="cgpa" value={formData.cgpa} onChange={handleChange}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="3.8 / 4.0"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5 border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50/50 dark:bg-black/20">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors duration-300">Education Duration</label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <input 
                            type="checkbox" 
                            name="currentlyStudying"
                            checked={formData.currentlyStudying}
                            onChange={(e) => setFormData({ ...formData, currentlyStudying: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-black/40 dark:border-white/20 transition-all cursor-pointer"
                          />
                          Currently Studying
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-slate-500 dark:text-gray-400">Start Date</label>
                          <div className="flex gap-2">
                            <select
                              value={formData.educationStartDate ? formData.educationStartDate.split("-")[1] || "" : ""}
                              onChange={(e) => {
                                const year = formData.educationStartDate ? formData.educationStartDate.split("-")[0] : currentYear;
                                const month = e.target.value;
                                setFormData({ ...formData, educationStartDate: month ? `${year}-${month}` : "" });
                              }}
                              className="w-1/2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                            >
                              <option value="">Month</option>
                              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select
                              value={formData.educationStartDate ? formData.educationStartDate.split("-")[0] || "" : ""}
                              onChange={(e) => {
                                const month = formData.educationStartDate ? formData.educationStartDate.split("-")[1] : "01";
                                const year = e.target.value;
                                setFormData({ ...formData, educationStartDate: year ? `${year}-${month}` : "" });
                              }}
                              className="w-1/2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                            >
                              <option value="">Year</option>
                              {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-slate-500 dark:text-gray-400">End Date</label>
                          <div className="flex gap-2">
                            <select
                              disabled={formData.currentlyStudying}
                              value={formData.educationEndDate ? formData.educationEndDate.split("-")[1] || "" : ""}
                              onChange={(e) => {
                                const year = formData.educationEndDate ? formData.educationEndDate.split("-")[0] : currentYear;
                                const month = e.target.value;
                                setFormData({ ...formData, educationEndDate: month ? `${year}-${month}` : "" });
                              }}
                              className="w-1/2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Month</option>
                              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select
                              disabled={formData.currentlyStudying}
                              value={formData.educationEndDate ? formData.educationEndDate.split("-")[0] || "" : ""}
                              onChange={(e) => {
                                const month = formData.educationEndDate ? formData.educationEndDate.split("-")[1] : "01";
                                const year = e.target.value;
                                setFormData({ ...formData, educationEndDate: year ? `${year}-${month}` : "" });
                              }}
                              className="w-1/2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Year</option>
                              {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      {dateError && <span className="text-red-500 text-sm mt-1">{dateError}</span>}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5"
                    >
                      <span>←</span> Previous
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
                    >
                      Next Step <span>→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-1 transition-colors duration-300">Skills</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">List your technical skills separated by commas.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 flex-1 content-start">
                    <MultiSelectDropdown
                      label="Programming Languages"
                      value={formData.skills.languages}
                      onChange={(val) => setFormData({ ...formData, skills: { ...formData.skills, languages: val } })}
                      options={programmingLanguages}
                      placeholder="Search or add languages (e.g. JavaScript, Python)..."
                    />
                    
                    <MultiSelectDropdown
                      label="Frameworks & Libraries"
                      value={formData.skills.frameworks}
                      onChange={(val) => setFormData({ ...formData, skills: { ...formData.skills, frameworks: val } })}
                      options={frameworksLibraries}
                      placeholder="Search or add frameworks (e.g. React, Next.js)..."
                    />

                    <MultiSelectDropdown
                      label="Databases"
                      value={formData.skills.databases}
                      onChange={(val) => setFormData({ ...formData, skills: { ...formData.skills, databases: val } })}
                      options={databasesList}
                      placeholder="Search or add databases (e.g. PostgreSQL, MongoDB)..."
                    />

                    <MultiSelectDropdown
                      label="Tools & Platforms"
                      value={formData.skills.tools}
                      onChange={(val) => setFormData({ ...formData, skills: { ...formData.skills, tools: val } })}
                      options={toolsPlatforms}
                      placeholder="Search or add tools (e.g. Git, Docker, AWS)..."
                    />
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5"
                    >
                      <span>←</span> Previous
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
                    >
                      Next Step <span>→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-1 transition-colors duration-300">Projects</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">Showcase your best work and personal projects.</p>
                    </div>
                    <button
                      onClick={addProject}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 text-sm bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                    >
                      <span className="text-lg leading-none">+</span> Add Project
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 flex-1 content-start overflow-y-auto pr-2 pb-4">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 relative group transition-colors duration-300 shadow-sm hover:shadow-md">
                        {formData.projects.length > 1 && (
                          <button
                            onClick={() => removeProject(index)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 border border-red-100 dark:border-red-500/20"
                            title="Remove Project"
                          >
                            ✕
                          </button>
                        )}
                        <h3 className="font-semibold text-slate-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                          <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          Project Details
                        </h3>
                        <div className="grid grid-cols-1 gap-5">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Project Name</label>
                            <input
                              name="name" value={project.name} onChange={(e) => handleProjectChange(index, e)}
                              className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                              placeholder="E-commerce Platform"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">GitHub Link</label>
                              <input
                                name="githubLink" value={project.githubLink || ""} onChange={(e) => handleProjectChange(index, e)}
                                className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                                placeholder="github.com/yourusername/project"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Live Demo Link</label>
                              <input
                                name="liveLink" value={project.liveLink || ""} onChange={(e) => handleProjectChange(index, e)}
                                className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                                placeholder="project.vercel.app"
                              />
                            </div>
                          </div>
                          <MultiSelectDropdown
                            label="Technologies Used"
                            value={project.technologies}
                            onChange={(val) => {
                              const updatedProjects = [...formData.projects];
                              updatedProjects[index] = { ...updatedProjects[index], technologies: val };
                              setFormData({ ...formData, projects: updatedProjects });
                            }}
                            options={projectTechnologies}
                            placeholder="Search or add technologies (e.g. React, Node.js)..."
                          />
                          <div className="flex flex-col gap-1.5 border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50/50 dark:bg-black/20">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Project Description</label>
                              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={project.generateAIDescription}
                                  onChange={(e) => {
                                    const updatedProjects = [...formData.projects];
                                    updatedProjects[index] = { ...updatedProjects[index], generateAIDescription: e.target.checked };
                                    setFormData({ ...formData, projects: updatedProjects });
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-black/40 dark:border-white/20 transition-all cursor-pointer"
                                />
                                Generate Description with AI
                              </label>
                            </div>

                            {project.generateAIDescription ? (
                              <div className="flex flex-col gap-3">
                                {project.description ? (
                                  <div className="relative">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                      <button 
                                        onClick={() => generateProjectDescription(index)}
                                        disabled={project.isGenerating}
                                        className="text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:text-indigo-600 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1.5 disabled:opacity-70 transition-all"
                                      >
                                        {project.isGenerating ? (
                                          <>
                                            <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                          </>
                                        ) : "🔄 Regenerate"}
                                      </button>
                                    </div>
                                    <textarea
                                      name="description" 
                                      value={project.description} 
                                      onChange={(e) => handleProjectChange(index, e)}
                                      rows={5}
                                      className={`w-full bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-xl px-4 py-3 pt-12 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm resize-none ${project.isGenerating ? 'animate-pulse text-slate-400 dark:text-gray-500' : ''}`}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl bg-white dark:bg-black/40">
                                    <button 
                                      onClick={() => generateProjectDescription(index)}
                                      disabled={project.isGenerating}
                                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] shadow-md flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                      {project.isGenerating ? (
                                        <>
                                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Generating Description...
                                        </>
                                      ) : "✨ Generate Description"}
                                    </button>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-3 text-center max-w-sm">
                                      We'll generate 3 professional, ATS-optimized bullet points based on your project name and selected technologies.
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <textarea
                                name="description" value={project.description} onChange={(e) => handleProjectChange(index, e)}
                                rows={4}
                                className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm resize-none"
                                placeholder="Describe what you built and the problems it solved..."
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5"
                    >
                      <span>←</span> Previous
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
                    >
                      Next Step <span>→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-1 transition-colors duration-300">Experience</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-500 transition-colors duration-300">Detail your work history and professional experience.</p>
                    </div>
                    <button 
                      onClick={addExperience}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 text-sm bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                    >
                      <span className="text-lg leading-none">+</span> Add Experience
                    </button>
                  </div>

                  <div className="flex flex-col gap-6 flex-1 content-start overflow-y-auto pr-2 pb-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 relative group transition-colors duration-300 shadow-sm hover:shadow-md">
                        {formData.experience.length > 1 && (
                          <button 
                            onClick={() => removeExperience(index)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 border border-red-100 dark:border-red-500/20"
                            title="Remove Experience"
                          >
                            ✕
                          </button>
                        )}
                        <h3 className="font-semibold text-slate-800 dark:text-gray-200 mb-5 flex items-center gap-2">
                          <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          Experience Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Company</label>
                            <input 
                              name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)}
                              className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" 
                              placeholder="Tech Corp Inc." 
                            />
                          </div>
                          <SearchableDropdown
                            label="Role"
                            value={exp.role}
                            onChange={(val) => {
                              const updatedExperience = [...formData.experience];
                              updatedExperience[index] = { ...updatedExperience[index], role: val };
                              setFormData({ ...formData, experience: updatedExperience });
                            }}
                            options={roleOptions}
                            placeholder="Search or type role (e.g. Software Engineer)"
                            showManualEntry={true}
                          />
                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Duration</label>
                            <input 
                              name="duration" value={exp.duration} onChange={(e) => handleExperienceChange(index, e)}
                              className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" 
                              placeholder="Jan 2022 - Present" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Description</label>
                            <textarea 
                              name="description" value={exp.description} onChange={(e) => handleExperienceChange(index, e)}
                              rows={4}
                              className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm resize-none" 
                              placeholder="Describe your responsibilities and achievements..." 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <button 
                      onClick={handleBack}
                      className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5"
                    >
                      <span>←</span> Previous
                    </button>
                    <button 
                      onClick={async () => {
                        setIsGenerating(true);
                        setGenerationStatus("Generating Resume ✨...");
                        try {
                          const res = await fetch('/api/generate-resume', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...formData, generateAISummary })
                          });
                          const data = await res.json();
                          if (!data.success) {
                            setAiError("⚠ AI services are currently unavailable. Please write your summary manually and try again.");
                            setGenerateAISummary(false);
                            setIsGenerating(false);
                            return; // Stop execution, reveal manual textareas
                          }
                          setAiError(null);
                          const finalResume = data.resumeData;
                          
                          setGenerationStatus("Analyzing ATS Score 📊...");
                          const analysisRes = await fetch('/api/analyze-generated-resume', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ resumeData: finalResume, targetRole: finalResume.experience?.[0]?.role || "Software Engineer" })
                          });
                          const analysisData = await analysisRes.json();
                          
                          setGenerationStatus("Saving Securely 🔒...");
                          if (userId && session) {
                             const token = await session.getToken({ template: 'supabase' });
                             const supabaseAuth = token ? createClerkSupabaseClient(token) : supabase;
                             
                             const record = {
                               user_id: userId,
                               resume_name: finalResume.fullName ? `${finalResume.fullName}'s Resume` : "My Resume",
                               resume_data: finalResume,
                               template_id: "modern_sidebar", // default initial template
                               ats_score: analysisData?.data?.score || 0,
                               strengths: analysisData?.data?.strengths || "Analysis unavailable",
                               missing: analysisData?.data?.missing || "Analysis unavailable",
                               improvements: analysisData?.data?.improvements || "Analysis unavailable",
                             };
                             
                             const { error } = await supabaseAuth.from('generated_resumes').insert([record]);
                             if (error) {
                               console.error("Error saving resume to Supabase:", error);
                             }
                          }
                          
                          setGeneratedResume(finalResume);
                        } catch (e) {
                          console.error("Error generating resume:", e);
                          setAiError("⚠ AI services are currently unavailable. Please enter details manually.");
                          setGenerateAISummary(false);
                        } finally {
                          setIsGenerating(false);
                          setGenerationStatus("Generating Resume ✨...");
                        }
                      }}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {generationStatus}
                        </span>
                      ) : (
                        <>Generate Resume <span>✨</span></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
