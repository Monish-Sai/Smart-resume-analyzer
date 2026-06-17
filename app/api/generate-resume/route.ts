import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();

    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found, returning original data");
      return NextResponse.json({ success: true, resumeData: body, message: "No API key" });
    }

    const generateSummary = body.generateAISummary !== false;

    const prompt = `You are an expert ATS resume writer. I will give you a user's raw resume data. Your task is to rewrite and optimize it.
Please return ONLY valid JSON matching this exact structure:
{
${generateSummary ? `  "summary": "A powerful 3-sentence professional summary.",` : ''}
  "projects": [
    {
      "name": "Project Name",
      "technologies": "Technologies Used",
      "description": "Improved, action-oriented bullet points (use markdown lists or just bullet points like - Action...)"
    }
    // YOU MUST RETURN ALL PROJECTS FROM THE RAW DATA
  ],

  "skills": {
    "languages": "Optimized list of languages",
    "frameworks": "Optimized list",
    "databases": "Optimized list",
    "tools": "Optimized list"
  }
}

Here is the raw data:
${JSON.stringify({
  name: body.fullName,
  degree: body.degree,
  specialization: body.specialization,
  projects: body.projects,

  skills: body.skills,
  role: body.experience?.[0]?.role || "Professional"
})}

Output ONLY valid JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error: ${response.status} ${response.statusText} - ${errText}`);
      // Fallback to original data if API fails
      return NextResponse.json({ 
        success: true, 
        resumeData: body,
        message: "AI optimization temporarily unavailable. Showing original format."
      });
    }

    const result = await response.json();
    let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let optimizedData;
    try {
      optimizedData = JSON.parse(generatedText);
    } catch (e) {
      console.error("Failed to parse AI JSON response", generatedText);
      // Fallback
      optimizedData = {};
    }

    // Merge optimized data into original body
    const finalResumeData = {
      ...body,
      // We overwrite specific fields if they were successfully generated
      skills: optimizedData.skills || body.skills,
      projects: body.projects.map((originalProject: any, i: number) => {
        const p = optimizedData.projects?.[i] || {};
        if (originalProject?.generateAIDescription && originalProject?.description) {
          // If the user used the inline AI generator (or preserved its output), we do not overwrite it with the global generator.
          return { ...originalProject, name: p.name || originalProject.name, technologies: p.technologies || originalProject.technologies };
        }
        return { ...originalProject, description: p.description || originalProject.description, name: p.name || originalProject.name, technologies: p.technologies || originalProject.technologies };
      }),
      experience: body.experience,
    };
    
    if (generateSummary) {
      finalResumeData.summary = optimizedData.summary || "Results-oriented professional with a strong background in technology. Proven ability to build and deploy scalable applications and drive business results.";
    } else {
      finalResumeData.summary = body.summary || "";
    }

    return NextResponse.json({ 
      success: true, 
      resumeData: finalResumeData,
      message: "AI resume generated successfully."
    });

  } catch (error) {
    console.error("[GENERATE_RESUME_ERROR]", error);
    // If there is a complete network failure, gracefully fallback
    return NextResponse.json({ 
      success: true, 
      resumeData: body,
      message: "AI optimization is unavailable due to network/API issues. Showing original format."
    });
  }
}
