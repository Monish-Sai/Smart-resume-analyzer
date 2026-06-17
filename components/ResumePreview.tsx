import React from 'react';

export interface ResumeData {
 fullName: string;
 email: string;
 phone: string;
 location: string;
 linkedin: string;
 github: string;
 degree: string;
 specialization: string;
 college: string;
 cgpa: string;
 educationStartDate: string;
 educationEndDate: string;
 currentlyStudying: boolean;
 summary?: string;
 skills: {
 languages: string;
 frameworks: string;
 databases: string;
 tools: string;
 };
 projects: {
 name: string;
 technologies: string;
 description: string;
 githubLink?: string;
 liveLink?: string;
 }[];
 experience: {
 company: string;
 role: string;
 duration: string;
 description: string;
 }[];
}

export const formatEducationDuration = (start?: string, end?: string, current?: boolean) => {
 if (!start && !end) return "";
 
 const formatDate = (dateStr: string) => {
 if (!dateStr) return "";
 const [year, month] = dateStr.split('-');
 const date = new Date(parseInt(year), parseInt(month) - 1);
 return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
 };

 const startFormatted = formatDate(start || "");
 if (current) {
 return `${startFormatted} – Present`;
 } else if (end) {
 return `${startFormatted} – ${formatDate(end)}`;
 }
 return startFormatted;
};

interface ResumePreviewProps {
 data: ResumeData;
 template: 'modern_sidebar' | 'graduate' | 'executive' | 'developer' | 'executive_classic';
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
 
 if (template === 'modern_sidebar') return <ModernSidebar data={data} />;
 if (template === 'graduate') return <GraduateStudent data={data} />;
 if (template === 'executive') return <CanvaProfessional data={data} />;
 if (template === 'developer') return <DeveloperPortfolio data={data} />;
 if (template === 'executive_classic') return <ExecutiveClassic data={data} />;

 return <ModernSidebar data={data} />;
}

// -----------------------------------------------------------------
// 1. Modern Sidebar
// -----------------------------------------------------------------
function ModernSidebar({ data }: { data: ResumeData }) {
 return (
 <div className="bg-white text-[#333333] shadow-2xl mx-auto font-sans w-full max-w-[850px] min-h-[1100px] flex flex-col overflow-hidden">
 
 {/* HEADER (Full Width Banner) */}
 <header className="bg-[#1F3A5F] text-white py-10 px-8 text-center flex-shrink-0">
 <h1 className="text-[40px] font-bold tracking-[0.1em] mb-2 leading-none text-[#D4B872]">{data.fullName || "Your Name"}</h1>
 </header>

 {/* TWO COLUMN LAYOUT */}
 <div className="flex flex-1">
 
 {/* LEFT SIDEBAR (30%) */}
 <aside className="w-[33%] bg-white p-8 border-r border-gray-100 flex flex-col gap-8">
 


 {/* CONTACT INFO */}
 <section>
 <h2 className="text-[14.5px] font-serif font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">Contact</h2>
 <div className="text-[12.5px] flex flex-col gap-3 font-medium">
 {data.phone && <div className="flex items-center gap-3">
 <div className="w-4 flex justify-center text-[#1F3A5F] font-bold">☏</div>
 <span className="text-[#555555]">{data.phone}</span>
 </div>}
 {data.email && <div className="flex items-center gap-3">
 <div className="w-4 flex justify-center text-[#1F3A5F] font-bold">✉</div>
 <span className="text-[#555555] break-all">{data.email}</span>
 </div>}
 {data.location && <div className="flex items-center gap-3">
 <div className="w-4 flex justify-center text-[#1F3A5F] font-bold">⌂</div>
 <span className="text-[#555555]">{data.location}</span>
 </div>}
 {data.linkedin && <div className="flex items-center gap-3">
 <div className="w-4 flex justify-center text-[#1F3A5F] font-bold">in</div>
 <a href={data.linkedin} className="text-[#555555] hover:text-[#1F3A5F]">{data.linkedin.replace(/^https?:\/\//, '')}</a>
 </div>}
 {data.github && <div className="flex items-center gap-3">
 <div className="w-4 flex justify-center text-[#1F3A5F] font-bold">gh</div>
 <a href={data.github} className="text-[#555555] hover:text-[#1F3A5F]">{data.github.replace(/^https?:\/\//, '')}</a>
 </div>}
 </div>
 </section>

 {/* EDUCATION */}
 <section>
 <h2 className="text-[14.5px] font-serif font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">Education</h2>
 <div className="text-[12.5px] flex flex-col gap-4 font-medium">
 <div>
 <strong className="block text-[#1F3A5F] mb-1 font-bold">{data.college || "University Name"}</strong>
 <span className="block text-[#333333] mb-1">{data.degree || "Degree"} {data.specialization ? `- ${data.specialization}` : ''}</span>
 <span className="block text-[#555555] mb-1">{formatEducationDuration(data.educationStartDate, data.educationEndDate, data.currentlyStudying) || "Education Duration"}</span>
 {data.cgpa && <span className="block text-[#555555] mt-1">GPA: {data.cgpa}</span>}
 </div>
 </div>
 </section>

 {/* SKILLS */}
 <section>
 <h2 className="text-[14.5px] font-serif font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">Skills</h2>
 <div className="text-[12.5px] flex flex-col gap-4">
 {data.skills.languages && (
 <ul className="text-[#555555] font-medium space-y-1 list-none ml-0">
 {data.skills.languages.split(',').map((s, i) => (
 <li key={i} className="flex items-center gap-2">
 <span className="w-1 h-1 bg-[#1F3A5F] rounded-full"></span>
 {s.trim()}
 </li>
 ))}
 </ul>
 )}
 {data.skills.frameworks && (
 <ul className="text-[#555555] font-medium space-y-1 list-none ml-0">
 {data.skills.frameworks.split(',').map((s, i) => (
 <li key={i} className="flex items-center gap-2">
 <span className="w-1 h-1 bg-[#1F3A5F] rounded-full"></span>
 {s.trim()}
 </li>
 ))}
 </ul>
 )}
 {data.skills.databases && (
 <ul className="text-[#555555] font-medium space-y-1 list-none ml-0">
 {data.skills.databases.split(',').map((s, i) => (
 <li key={i} className="flex items-center gap-2">
 <span className="w-1 h-1 bg-[#1F3A5F] rounded-full"></span>
 {s.trim()}
 </li>
 ))}
 </ul>
 )}
 {data.skills.tools && (
 <ul className="text-[#555555] font-medium space-y-1 list-none ml-0">
 {data.skills.tools.split(',').map((s, i) => (
 <li key={i} className="flex items-center gap-2">
 <span className="w-1 h-1 bg-[#1F3A5F] rounded-full"></span>
 {s.trim()}
 </li>
 ))}
 </ul>
 )}
 </div>
 </section>

 </aside>

 {/* RIGHT CONTENT (67%) */}
 <main className="w-[67%] p-10 flex flex-col gap-8 bg-white">
 
 {/* PROFESSIONAL SUMMARY */}
 {(data.summary) && (
 <section>
 <h2 className="text-[15px] font-serif font-bold uppercase tracking-[0.15em] text-[#333333] mb-4">
 Summary
 </h2>
 <p className="text-[13px] leading-[1.8] text-[#555555] font-medium text-justify">
 {data.summary}
 </p>
 </section>
 )}

 {/* EXPERIENCE */}
 {(data.experience && data.experience.length > 0 && data.experience[0].company !== "") && (
 <section>
 <h2 className="text-[15px] font-serif font-bold uppercase tracking-[0.15em] text-[#333333] mb-6">
 Work Experience
 </h2>
 <div className="flex flex-col gap-6">
 {data.experience.map((exp, idx) => (
 <div key={idx} className="relative pl-5 border-l-[1.5px] border-[#e0e0e0]">
 {/* Timeline Dot */}
 <div className="absolute w-[10px] h-[10px] bg-[#1F3A5F] rounded-full -left-[6px] top-1.5 border-[2px] border-white"></div>
 
 <div className="mb-2">
 <div className="text-[13px] text-[#333333] font-bold mb-1">({exp.duration})</div>
 <h3 className="font-bold text-[14px] text-[#333333] uppercase">{exp.role}</h3>
 <div className="text-[13px] text-[#555555] font-medium">{exp.company}</div>
 </div>
 <ul className="text-[13px] leading-[1.8] text-[#555555] font-medium list-none ml-0 space-y-1 mt-3">
 {exp.description.split('\n').map((line, i) => line.trim() ? (
 <li key={i} className="flex items-start gap-2">
 <span className="w-1 h-1 bg-[#555555] rounded-full mt-2 shrink-0"></span>
 <span className="flex-1">{line.replace(/^- /, '')}</span>
 </li>
 ) : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* PROJECTS */}
 {(data.projects && data.projects.length > 0 && data.projects[0].name !== "") && (
 <section>
 <h2 className="text-[15px] font-serif font-bold uppercase tracking-[0.15em] text-[#333333] mb-6">
 Projects
 </h2>
 <div className="flex flex-col gap-6">
 {data.projects.map((proj, idx) => (
 <div key={idx} className="relative pl-5 border-l-[1.5px] border-[#e0e0e0]">
 {/* Timeline Dot */}
 <div className="absolute w-[10px] h-[10px] bg-[#1F3A5F] rounded-full -left-[6px] top-1.5 border-[2px] border-white"></div>
 
 <div className="mb-2">
 <div className="flex gap-2 text-[12px] font-bold text-[#1F3A5F] mb-1">
 {proj.githubLink && <a href={proj.githubLink.startsWith('http') ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
 {proj.liveLink && <a href={proj.liveLink.startsWith('http') ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noreferrer" className="hover:underline">Live Demo</a>}
 </div>
 <h3 className="font-bold text-[14px] text-[#333333] uppercase">{proj.name}</h3>
 <div className="text-[13px] text-[#555555] font-medium italic">{proj.technologies}</div>
 </div>
 <ul className="text-[13px] leading-[1.8] text-[#555555] font-medium list-none ml-0 space-y-1 mt-3">
 {proj.description.split('\n').map((line, i) => line.trim() ? (
 <li key={i} className="flex items-start gap-2">
 <span className="w-1 h-1 bg-[#555555] rounded-full mt-2 shrink-0"></span>
 <span className="flex-1">{line.replace(/^- /, '')}</span>
 </li>
 ) : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}

 </main>
 </div>
 </div>
 );
}

// -----------------------------------------------------------------
// 2. Modern Tech
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// 4. Developer Portfolio
// -----------------------------------------------------------------
function DeveloperPortfolio({ data }: { data: ResumeData }) {
 const badgeClasses = "inline-block px-2 py-0.5 rounded text-[11.5px] font-mono font-semibold bg-white/10 text-gray-300 border border-white/10";

 return (
 <div className="bg-[#000000] text-gray-300 p-8 sm:p-12 shadow-2xl mx-auto font-sans max-w-[850px] min-h-[1100px] ">
 
 {/* HEADER: Modern aesthetic */}
 <header className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-white/10 pb-8 ">
 <div className="space-y-2.5">
 <h1 className="text-[34px] font-bold tracking-tight text-white leading-none">{data.fullName || "Your Name"}</h1>
 <div className="text-[13px] font-medium text-gray-400 flex flex-wrap gap-x-4 gap-y-2 mt-1">
 {data.location && <div className="flex items-center gap-1.5"><span className="opacity-60 text-white ">⚲</span> {data.location}</div>}
 {data.email && <div className="flex items-center gap-1.5"><span className="opacity-60 text-white ">✉</span> {data.email}</div>}
 {data.phone && <div className="flex items-center gap-1.5"><span className="opacity-60 text-white ">☏</span> {data.phone}</div>}
 </div>
 </div>
 <div className="flex flex-col gap-2 text-[13px] text-right font-mono text-gray-400 mt-1">
 {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex justify-end gap-1.5 items-center"><span>linkedin.com/in/{data.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/^https?:\/\//, '')}</span> <span className="opacity-50">↗</span></a>}
 {data.github && <a href={data.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex justify-end gap-1.5 items-center"><span>github.com/{data.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/^https?:\/\//, '')}</span> <span className="opacity-50">↗</span></a>}
 </div>
 </header>

 {/* SUMMARY */}
 {(data.summary) && (
 <section className="mb-10">
 <p className="text-[14px] leading-[1.7] text-gray-400 font-medium">
 {data.summary}
 </p>
 </section>
 )}

 {/* TWO COLUMN GRID FOR CONTENT */}
 <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">
 
 {/* LEFT COLUMN: Projects & Experience */}
 <div className="space-y-10">
 
 {/* PROJECTS: Premium Cards */}
 {(data.projects && data.projects.length > 0 && data.projects[0].name !== "") && (
 <section>
 <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 mb-5 border-b border-white/10 pb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Selected Projects</h2>
 <div className="grid gap-4">
 {data.projects.map((proj, idx) => (
 <div key={idx} className="p-5 rounded-lg bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-colors ">
 <div className="flex justify-between items-start mb-2">
 <h3 className="font-semibold text-white text-[15px]">{proj.name}</h3>
 <div className="flex gap-2 text-[12px] font-mono text-gray-400 ">
 {proj.githubLink && <a href={proj.githubLink.startsWith('http') ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub ↗</a>}
 {proj.liveLink && <a href={proj.liveLink.startsWith('http') ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Live ↗</a>}
 </div>
 </div>
 <ul className="text-[13.5px] text-gray-400 list-none space-y-1 mb-4 leading-relaxed">
 {proj.description.split('\n').map((line, i) => line.trim() ? <li key={i} className="flex gap-2"><span className="text-white/20 mt-[2px]">-</span> <span>{line.replace(/^- /, '')}</span></li> : null)}
 </ul>
 <div className="flex flex-wrap gap-1.5">
 {proj.technologies.split(',').map((tech, i) => tech.trim() ? <span key={i} className={badgeClasses + " ','] '']"}>{tech.trim()}</span> : null)}
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* EXPERIENCE: Timeline style */}
 {(data.experience && data.experience.length > 0 && data.experience[0].company !== "") && (
 <section>
 <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 mb-5 border-b border-white/10 pb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-600 inline-block"></span> Work Experience</h2>
 <div className="relative border-l border-white/10 ml-3 space-y-8 mt-2">
 {data.experience.map((exp, idx) => (
 <div key={idx} className="relative pl-6">
 {/* Timeline Dot */}
 <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-white/20 "></span>
 
 <div className="flex flex-col mb-1.5">
 <h3 className="text-[15px] font-semibold text-white ">{exp.role}</h3>
 <div className="flex flex-wrap items-center gap-2 text-[13.5px] mt-0.5">
 <span className="font-medium text-gray-300 ">{exp.company}</span>
 <span className="text-gray-600 text-[10px]">●</span>
 <span className="text-gray-500 font-mono text-[12px]">{exp.duration}</span>
 </div>
 </div>
 <ul className="text-[13.5px] text-gray-400 list-none space-y-1 mt-2 leading-relaxed">
 {exp.description.split('\n').map((line, i) => line.trim() ? <li key={i} className="flex gap-2"><span className="text-white/20 mt-[2px]">-</span> <span>{line.replace(/^- /, '')}</span></li> : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}
 </div>

 {/* RIGHT COLUMN: Skills & Education */}
 <div className="space-y-10">
 
 {/* SKILLS: Badges */}
 <section>
 <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 mb-5 border-b border-white/10 pb-2">Tech Stack</h2>
 <div className="space-y-6">
 {data.skills.languages && (
 <div>
 <h3 className="text-[12px] font-medium text-white mb-2.5 opacity-60 uppercase tracking-wider">Languages</h3>
 <div className="flex flex-wrap gap-1.5">
 {data.skills.languages.split(',').map((item, i) => <span key={i} className={badgeClasses + " ','] '']"}>{item.trim()}</span>)}
 </div>
 </div>
 )}
 {data.skills.frameworks && (
 <div>
 <h3 className="text-[12px] font-medium text-white mb-2.5 opacity-60 uppercase tracking-wider">Frameworks</h3>
 <div className="flex flex-wrap gap-1.5">
 {data.skills.frameworks.split(',').map((item, i) => <span key={i} className={badgeClasses + " ','] '']"}>{item.trim()}</span>)}
 </div>
 </div>
 )}
 {data.skills.databases && (
 <div>
 <h3 className="text-[12px] font-medium text-white mb-2.5 opacity-60 uppercase tracking-wider">Databases</h3>
 <div className="flex flex-wrap gap-1.5">
 {data.skills.databases.split(',').map((item, i) => <span key={i} className={badgeClasses + " ','] '']"}>{item.trim()}</span>)}
 </div>
 </div>
 )}
 {data.skills.tools && (
 <div>
 <h3 className="text-[12px] font-medium text-white mb-2.5 opacity-60 uppercase tracking-wider">Tools</h3>
 <div className="flex flex-wrap gap-1.5">
 {data.skills.tools.split(',').map((item, i) => <span key={i} className={badgeClasses + " ','] '']"}>{item.trim()}</span>)}
 </div>
 </div>
 )}
 </div>
 </section>

 {/* EDUCATION */}
 <section>
 <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 mb-5 border-b border-white/10 pb-2">Education</h2>
 <div className="p-4 rounded-lg bg-[#0a0a0a] border border-white/10 ">
 <h3 className="font-semibold text-[14px] text-white ">{data.college || "University"}</h3>
 <div className="text-[13px] text-gray-400 mt-1">{data.degree || "Degree"} {data.specialization ? `in ${data.specialization}` : ''}</div>
 <div className="flex justify-between items-center text-[12px] font-mono text-gray-500 mt-3 pt-3 border-t border-white/10 ">
 <span>{formatEducationDuration(data.educationStartDate, data.educationEndDate, data.currentlyStudying)}</span>
 {data.cgpa && <span>GPA {data.cgpa}</span>}
 </div>
 </div>
 </section>

 </div>
 </div>
 </div>
 );
}

// -----------------------------------------------------------------
// 3. Student Fresher
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// 2. Graduate Student
// -----------------------------------------------------------------
function GraduateStudent({ data }: { data: ResumeData }) {
 return (
 <div className="bg-[#fdfdfd] text-gray-900 p-8 sm:p-12 mx-auto font-serif max-w-[850px] min-h-[1100px] shadow-2xl ">
 
 {/* HEADER */}
 <header className="mb-6 text-center border-b-[2px] border-gray-800 pb-5">
 <h1 className="text-[30px] font-bold tracking-widest uppercase mb-1">{data.fullName || "Your Name"}</h1>
 <div className="flex flex-wrap justify-center items-center gap-3 text-[14px] font-sans font-medium text-gray-700">
 {data.email && <span>{data.email}</span>}
 {data.email && data.phone && <span>|</span>}
 {data.phone && <span>{data.phone}</span>}
 {(data.email || data.phone) && data.location && <span>|</span>}
 {data.location && <span>{data.location}</span>}
 </div>
 <div className="flex flex-wrap justify-center items-center gap-3 text-[13px] font-sans mt-2">
 {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-black">{data.linkedin.replace(/^https?:\/\//, '')}</a>}
 {data.linkedin && data.github && <span>|</span>}
 {data.github && <a href={data.github} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-black">{data.github.replace(/^https?:\/\//, '')}</a>}
 </div>
 </header>

 {/* EDUCATION (Top Priority) */}
 <section className="mb-6">
 <h2 className="text-[16px] font-bold uppercase tracking-widest border-b-[1px] border-gray-400 mb-3 pb-1 text-gray-900">Education</h2>
 <div className="flex justify-between items-start mb-2">
 <div>
 <h3 className="font-bold text-[17px]">{data.college || "University Name"}</h3>
 <div className="italic text-[15px] mt-0.5">{data.degree || "Degree"} {data.specialization ? `in ${data.specialization}` : ''}</div>
 </div>
 <div className="text-right text-[14px]">
 <div className="font-semibold">{data.location && data.location.split(',')[0]}</div>
 <div>{formatEducationDuration(data.educationStartDate, data.educationEndDate, data.currentlyStudying) || "Education Duration"}</div>
 </div>
 </div>
 {data.cgpa && <div className="text-[14px] font-medium mt-1">Cumulative GPA: {data.cgpa}</div>}
 </section>

 {/* RESEARCH & ACADEMIC PROJECTS */}
 {(data.projects && data.projects.length > 0 && data.projects[0].name !== "") && (
 <section className="mb-6">
 <h2 className="text-[16px] font-bold uppercase tracking-widest border-b-[1px] border-gray-400 mb-3 pb-1 text-gray-900">Academic Projects & Research</h2>
 <div className="flex flex-col gap-5">
 {data.projects.map((proj, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-baseline mb-1">
 <h3 className="font-bold text-[16px] flex items-center gap-2">
 {proj.name}
 <div className="flex gap-2 text-[12px] font-normal tracking-normal text-blue-700">
 {proj.githubLink && <a href={proj.githubLink.startsWith('http') ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
 {proj.liveLink && <a href={proj.liveLink.startsWith('http') ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noreferrer" className="hover:underline">Live</a>}
 </div>
 </h3>
 <div className="text-[13px] font-sans font-semibold text-gray-600">{proj.technologies}</div>
 </div>
 <ul className="text-[14.5px] list-disc list-outside ml-5 space-y-1 mt-1.5 text-gray-800">
 {proj.description.split('\n').map((line, i) => line.trim() ? <li key={i}>{line.replace(/^- /, '')}</li> : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* TECHNICAL SKILLS */}
 <section className="mb-6">
 <h2 className="text-[16px] font-bold uppercase tracking-widest border-b-[1px] border-gray-400 mb-3 pb-1 text-gray-900">Technical Skills</h2>
 <div className="grid grid-cols-1 gap-2 text-[14.5px] font-sans">
 {data.skills.languages && <div><span className="font-bold mr-2 w-32 inline-block">Languages:</span>{data.skills.languages}</div>}
 {data.skills.frameworks && <div><span className="font-bold mr-2 w-32 inline-block">Frameworks:</span>{data.skills.frameworks}</div>}
 {data.skills.databases && <div><span className="font-bold mr-2 w-32 inline-block">Databases:</span>{data.skills.databases}</div>}
 {data.skills.tools && <div><span className="font-bold mr-2 w-32 inline-block">Tools:</span>{data.skills.tools}</div>}
 </div>
 </section>

 {/* EXPERIENCE (Internships - Bottom) */}
 {(data.experience && data.experience.length > 0 && data.experience[0].company !== "") && (
 <section className="mb-6">
 <h2 className="text-[16px] font-bold uppercase tracking-widest border-b-[1px] border-gray-400 mb-3 pb-1 text-gray-900">Experience & Internships</h2>
 <div className="flex flex-col gap-5">
 {data.experience.map((exp, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-baseline">
 <h3 className="font-bold text-[16px]">{exp.company}</h3>
 <div className="text-[14px] font-semibold">{exp.duration}</div>
 </div>
 <div className="italic text-[15px] mb-2">{exp.role}</div>
 <ul className="text-[14.5px] list-disc list-outside ml-5 space-y-1 text-gray-800">
 {exp.description.split('\n').map((line, i) => line.trim() ? <li key={i}>{line.replace(/^- /, '')}</li> : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}

 </div>
 );
}

// -----------------------------------------------------------------
// 4. Premium Minimal
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// 3. Executive Professional
// -----------------------------------------------------------------
function CanvaProfessional({ data }: { data: ResumeData }) {
 const firstName = data.fullName ? data.fullName.split(' ')[0] : 'PAULA';
 const lastName = data.fullName ? data.fullName.split(' ').slice(1).join(' ') : 'WILSON';

 return (
 <div className="bg-white text-[#222222] p-10 sm:p-12 shadow-2xl mx-auto font-sans w-full max-w-[850px] min-h-[1100px] ">
 
 {/* HEADER */}
 <header className="mb-6 text-center">
 <h1 className="text-[38px] tracking-[0.15em] mb-2 uppercase flex justify-center gap-3">
 <span className="font-bold text-[#B89B3C]">{firstName}</span>
 <span className="font-semibold text-[#222222]">{lastName}</span>
 </h1>
 <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[12px] text-[#555555] tracking-wide mt-2">
 {data.location && <span>{data.location}</span>}
 {data.location && (data.phone || data.email) && <span className="text-[#C8B26A]">|</span>}
 {data.phone && <span>{data.phone}</span>}
 {data.phone && data.email && <span className="text-[#C8B26A]">|</span>}
 {data.email && <span>{data.email}</span>}
 </div>
 <div className="w-full h-[1px] bg-[#C8B26A] mt-5 mb-1"></div>
 </header>

 {/* PROFILE SUMMARY */}
 {(data.summary) && (
 <section className="mb-6">
 <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#B89B3C] mb-3">Profile Summary</h2>
 <p className="text-[12px] leading-[1.8] text-[#222222] text-justify">
 {data.summary}
 </p>
 <div className="w-full h-[1px] bg-[#C8B26A] mt-5 mb-1"></div>
 </section>
 )}

 {/* SKILLS */}
 <section className="mb-6">
 <div className="grid grid-cols-2 gap-8">
 <div>
 <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#B89B3C] mb-4">Professional Skill</h2>
 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-[#222222]">
 {data.skills.languages && data.skills.languages.split(',').map((item, i) => <div key={i}>{item.trim()}</div>)}
 {data.skills.frameworks && data.skills.frameworks.split(',').map((item, i) => <div key={i}>{item.trim()}</div>)}
 </div>
 </div>
 <div>
 <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#B89B3C] mb-4">Technical Skill</h2>
 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-[#222222]">
 {data.skills.databases && data.skills.databases.split(',').map((item, i) => <div key={i}>{item.trim()}</div>)}
 {data.skills.tools && data.skills.tools.split(',').map((item, i) => <div key={i}>{item.trim()}</div>)}
 </div>
 </div>
 </div>
 <div className="w-full h-[1px] bg-[#C8B26A] mt-6 mb-1"></div>
 </section>

 {/* EDUCATION */}
 <section className="mb-6">
 <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#B89B3C] mb-4">Education</h2>
 <div className="mb-4">
 <div className="flex justify-between items-baseline mb-1">
 <h3 className="font-bold text-[13px] text-[#222222]">{data.degree || "Degree"} {data.specialization ? `, ${data.specialization}` : ''}</h3>
 <div className="text-[12px] text-[#222222]">{formatEducationDuration(data.educationStartDate, data.educationEndDate, data.currentlyStudying)}</div>
 </div>
 <div className="text-[12px] text-[#555555] mb-1">{data.college || "University Name"} {data.cgpa && `(GPA: ${data.cgpa})`}</div>
 </div>
 <div className="w-full h-[1px] bg-[#C8B26A] mt-5 mb-1"></div>
 </section>

 {/* WORK EXPERIENCE */}
 {(data.experience && data.experience.length > 0 && data.experience[0].company !== "") && (
 <section className="mb-6">
 <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#B89B3C] mb-4">Work Experience</h2>
 <div className="flex flex-col gap-5">
 {data.experience.map((exp, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-baseline mb-1">
 <h3 className="font-bold text-[13px] text-[#222222]">{exp.role}</h3>
 <div className="text-[12px] text-[#222222]">{exp.duration}</div>
 </div>
 <div className="text-[12px] text-[#555555] mb-2">{exp.company}</div>
 <ul className="text-[12px] leading-[1.8] text-[#222222] list-disc list-outside ml-4 space-y-1">
 {exp.description.split('\n').map((line, i) => line.trim() ? <li key={i}>{line.replace(/^- /, '')}</li> : null)}
 </ul>
 </div>
 ))}
 </div>
 {data.projects && data.projects.length > 0 && data.projects[0].name !== "" && (
 <div className="w-full h-[1px] bg-[#C8B26A] mt-5 mb-1"></div>
 )}
 </section>
 )}

 {/* PROJECTS (Custom extension matching style) */}
 {(data.projects && data.projects.length > 0 && data.projects[0].name !== "") && (
 <section className="mb-6">
 <h2 className="text-[15px] font-bold uppercase tracking-[0.15em] text-[#B89B3C] mb-4">Projects</h2>
 <div className="flex flex-col gap-5">
 {data.projects.map((proj, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-baseline mb-1">
 <h3 className="font-bold text-[13px] text-[#222222]">{proj.name}</h3>
 <div className="flex gap-2 text-[11px] font-normal tracking-normal text-[#B89B3C]">
 {proj.githubLink && <a href={proj.githubLink.startsWith('http') ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
 {proj.liveLink && <a href={proj.liveLink.startsWith('http') ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noreferrer" className="hover:underline">Live Demo</a>}
 </div>
 </div>
 <div className="text-[12px] text-[#555555] mb-2 italic">{proj.technologies}</div>
 <ul className="text-[12px] leading-[1.8] text-[#222222] list-disc list-outside ml-4 space-y-1">
 {proj.description.split('\n').map((line, i) => line.trim() ? <li key={i}>{line.replace(/^- /, '')}</li> : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}

 </div>
 );
}

// -----------------------------------------------------------------
// 5. Executive Classic
// -----------------------------------------------------------------
function ExecutiveClassic({ data }: { data: ResumeData }) {
 return (
 <div className="bg-[#F6F2EC] text-[#222222] p-10 sm:p-12 shadow-2xl mx-auto font-sans w-full max-w-[850px] min-h-[1100px] ">
 
 {/* HEADER */}
 <header className="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4 pb-5 border-b-[2px] border-[#D9D1C7]">
 <div className="text-left">
 <h1 className="text-[44px] font-serif font-bold text-[#222222] leading-none mb-3">{data.fullName || "Your Name"}</h1>
 </div>
 <div className="text-right text-[13px] text-[#666666] flex flex-col gap-1 items-end">
 {data.email && <div>{data.email}</div>}
 {data.phone && <div>{data.phone}</div>}
 {data.location && <div>{data.location}</div>}
 <div className="flex gap-2 mt-1 text-[12px]">
 {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#222222]">{data.linkedin.replace(/^https?:\/\//, '')}</a>}
 {data.linkedin && data.github && <span>|</span>}
 {data.github && <a href={data.github} target="_blank" rel="noreferrer" className="hover:text-[#222222]">{data.github.replace(/^https?:\/\//, '')}</a>}
 </div>
 </div>
 </header>

 {/* SUMMARY */}
 {(data.summary) && (
 <section className="mb-8">
 <h2 className="text-[17px] font-serif font-bold uppercase tracking-widest text-[#222222] mb-3">Professional Summary</h2>
 <p className="text-[13.5px] leading-[1.8] text-[#222222] text-justify">
 {data.summary}
 </p>
 </section>
 )}

 {/* EXPERIENCE */}
 {(data.experience && data.experience.length > 0 && data.experience[0].company !== "") && (
 <section className="mb-8">
 <h2 className="text-[17px] font-serif font-bold uppercase tracking-widest text-[#222222] mb-5 border-b-[1.5px] border-[#D9D1C7] pb-1">Experience</h2>
 <div className="flex flex-col gap-7">
 {data.experience.map((exp, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-baseline mb-1.5">
 <h3 className="font-bold text-[15.5px] text-[#222222]">{exp.role}</h3>
 <div className="text-[13.5px] text-[#666666] font-medium">{exp.duration}</div>
 </div>
 <div className="text-[14px] text-[#666666] mb-3">{exp.company}</div>
 <ul className="text-[13.5px] leading-[1.7] text-[#222222] list-disc list-outside ml-4 space-y-1.5">
 {exp.description.split('\n').map((line, i) => line.trim() ? <li key={i}>{line.replace(/^- /, '')}</li> : null)}
 </ul>
 </div>
 ))}
 </div>
 </section>
 )}

 {/* BOTTOM SECTION: TWO COLUMNS */}
 <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-12">
 
 {/* LEFT: EDUCATION */}
 <section>
 <h2 className="text-[17px] font-serif font-bold uppercase tracking-widest text-[#222222] mb-5 border-b-[1.5px] border-[#D9D1C7] pb-1">Education</h2>
 <div className="mb-5">
 <h3 className="font-bold text-[14.5px] text-[#222222] mb-1.5 leading-snug">{data.degree || "Degree"} {data.specialization ? `in ${data.specialization}` : ''}</h3>
 <div className="text-[13.5px] text-[#222222] mb-2">{data.college || "University Name"}</div>
 <div className="text-[13px] text-[#666666] flex flex-col gap-1">
 <span>{formatEducationDuration(data.educationStartDate, data.educationEndDate, data.currentlyStudying)}</span>
 {data.cgpa && <span>GPA: {data.cgpa}</span>}
 </div>
 </div>
 </section>

 {/* RIGHT: SKILLS & PROJECTS (Proxy for Certifications/Awards) */}
 <section className="flex flex-col gap-8">
 <div>
 <h2 className="text-[17px] font-serif font-bold uppercase tracking-widest text-[#222222] mb-5 border-b-[1.5px] border-[#D9D1C7] pb-1">Expertise & Skills</h2>
 <div className="text-[13.5px] leading-[1.8] text-[#222222] flex flex-col gap-2.5">
 {data.skills.languages && <div><strong className="font-semibold text-[#666666]">Languages:</strong> {data.skills.languages}</div>}
 {data.skills.frameworks && <div><strong className="font-semibold text-[#666666]">Frameworks:</strong> {data.skills.frameworks}</div>}
 {data.skills.databases && <div><strong className="font-semibold text-[#666666]">Databases:</strong> {data.skills.databases}</div>}
 {data.skills.tools && <div><strong className="font-semibold text-[#666666]">Tools:</strong> {data.skills.tools}</div>}
 </div>
 </div>

 {(data.projects && data.projects.length > 0 && data.projects[0].name !== "") && (
 <div>
 <h2 className="text-[17px] font-serif font-bold uppercase tracking-widest text-[#222222] mb-5 border-b-[1.5px] border-[#D9D1C7] pb-1">Key Initiatives</h2>
 <div className="flex flex-col gap-6">
 {data.projects.map((proj, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-baseline mb-1">
 <h3 className="font-bold text-[14.5px] text-[#222222]">{proj.name}</h3>
 <div className="flex gap-2 text-[11.5px] font-normal tracking-normal text-[#666666]">
 {proj.githubLink && <a href={proj.githubLink.startsWith('http') ? proj.githubLink : `https://${proj.githubLink}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-[#222222]">GitHub</a>}
 {proj.liveLink && <a href={proj.liveLink.startsWith('http') ? proj.liveLink : `https://${proj.liveLink}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-[#222222]">Live</a>}
 </div>
 </div>
 <div className="text-[13px] text-[#666666] mb-2 italic">{proj.technologies}</div>
 <ul className="text-[13px] leading-[1.7] text-[#222222] list-disc list-outside ml-4 space-y-1.5">
 {proj.description.split('\n').map((line, i) => line.trim() ? <li key={i}>{line.replace(/^- /, '')}</li> : null)}
 </ul>
 </div>
 ))}
 </div>
 </div>
 )}
 </section>
 </div>

 </div>
 );
}
