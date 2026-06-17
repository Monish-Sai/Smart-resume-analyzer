import { AIProvider } from './provider';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  private async makeRequest(prompt: string, temperature: number = 0.3) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${this.apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const result = await response.json();
    let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Strip markdown formatting if the model returns ```json ... ```
    generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(generatedText);
    } catch (e) {
      throw new Error(`Failed to parse AI JSON response: ${generatedText}`);
    }
  }

  async generateSummary(body: any): Promise<any> {
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

    const optimizedData = await this.makeRequest(prompt);

    const finalResumeData = {
      ...body,
      skills: optimizedData.skills || body.skills,
      projects: body.projects.map((originalProject: any, i: number) => {
        const p = optimizedData.projects?.[i] || {};
        if (originalProject?.generateAIDescription && originalProject?.description) {
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

    return finalResumeData;
  }

  async generateProjectDescription(body: any): Promise<any> {
    const { name, technologies, liveLink, githubLink, role } = body;

    const prompt = `You are an expert ATS resume writer. I need you to write a professional project description for a resume based on the following details:

Project Name: ${name || "Untitled Project"}
Technologies Used: ${technologies || "Not specified"}
Live Link: ${liveLink || "Not specified"}
GitHub Link: ${githubLink || "Not specified"}
Target Role: ${role || "Software Engineer"}

Generate EXACTLY 3 SHORT and SIMPLE bullet points summarizing this project.
Each bullet point MUST be very brief (maximum 1 sentence, ideally less than 15 words). Keep it concise, start with an action verb, and do not use long complex sentences.
Return ONLY valid JSON matching this exact structure:
{
  "description": "• Bullet point 1\\n\\n• Bullet point 2\\n\\n• Bullet point 3"
}

Output ONLY valid JSON.`;

    const optimizedData = await this.makeRequest(prompt);
    return { description: optimizedData.description };
  }

  async generateATSSuggestions(body: any): Promise<any> {
    const { resumeData, targetRole } = body;

    const prompt = `You are an expert ATS (Applicant Tracking System) software and senior technical recruiter.
I have a JSON object representing a candidate's generated resume.
Please analyze it against the target role of "${targetRole || 'Software Engineer'}".

Here is the candidate's resume data in JSON format:
${JSON.stringify(resumeData, null, 2)}

Calculate an ATS score from 0 to 100 based on standard criteria (impact, keywords, brevity, action verbs, quantitative results, structure).
Provide exactly the following fields in a raw JSON object (do not include markdown formatting or \`\`\`json wrappers):
{
  "score": (number between 0-100),
  "strengths": "(string) Top 2-3 strengths found in this resume.",
  "missing": "(string) Top missing keywords, skills, or sections.",
  "improvements": "(string) Top 3 actionable suggestions to improve the ATS score."
}`;

    const parsed = await this.makeRequest(prompt, 0.2);
    return parsed;
  }

  async improveResume(body: any): Promise<any> {
    const { resumeData, improvements } = body;

    const prompt = `You are an expert ATS (Applicant Tracking System) software and senior technical recruiter.
I have a candidate's resume in JSON format. Based on previous analysis, we need to improve this resume with the following actionable suggestions:
"${improvements}"

Here is the current candidate's resume data in JSON format:
${JSON.stringify(resumeData, null, 2)}

Please rewrite the resume data to incorporate these improvements.
Keep the JSON structure exactly identical.
Enhance the summary, experience descriptions, and project descriptions to be more impactful, use better action verbs, and include quantitative metrics where appropriate (without inventing completely fake jobs or completely fake projects; just rephrase and optimize). Ensure ATS friendliness.

Return ONLY the updated JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`.`;

    const parsed = await this.makeRequest(prompt, 0.3);
    
    parsed.fullName = parsed.fullName || resumeData.fullName;
    parsed.email = parsed.email || resumeData.email;
    parsed.phone = parsed.phone || resumeData.phone;
    
    return parsed;
  }

  async analyzePDFResume(text: string, role: string, jobDescription?: string): Promise<any> {
    const trimmedText = text.length > 10000 ? text.substring(0, 10000) : text;
    
    const prompt = `You are a world-class Technical Recruiter at a FAANG company. 
Your goal is to provide a BRUTALLY HONEST and HIGHLY ACCURATE ATS score for this resume for the role of ${role}.

${jobDescription ? `### Job Description (Target): \n"${jobDescription}"\n` : ''}

### Scoring Algorithm (Internal Calculation):
1. **Base Score: 0**
2. **Hard Skills (0-50 pts)**: Count direct keyword matches for ${role}. +5 per critical skill.
3. **Experience (0-30 pts)**: +10 for Junior, +20 for Mid, +30 for Senior matching ${role}.
4. **Impact/Formatting (0-20 pts)**: Award for measurable results (numbers, %) and readability.

### Response Requirements:
- **No Rounding**: Use precise numbers like 67, 43, 81.
- **Explain the Math**: You MUST include a "Score Breakdown" explaining exactly how you arrived at the number.

### Output Format (Strictly follow):
1. ${jobDescription ? 'Match Percentage' : 'ATS Score'}: [Score 0-100]
2. Score Breakdown: [Brief explanation: e.g., Skills: 30/50, Exp: 20/30, Format: 15/20]
3. ${jobDescription ? 'Matched Skills' : 'Strengths'}: [Comma list]
4. Missing Skills: [Comma list]
5. Suggestions: [3-4 actionable points]

Resume Data:
${trimmedText}

Respond ONLY with a JSON object. Ensure the format strictly follows this structure:
{
  "score": (number between 0-100),
  "breakdown": "(string) Brief explanation",
  "strengths": "(string) Comma list",
  "missing": "(string) Comma list",
  "suggestions": "(string) 3-4 actionable points separated by newlines"
}`;

    const parsed = await this.makeRequest(prompt, 0.1);
    
    return {
      result: `Match Percentage: ${parsed.score}\nScore Breakdown: ${parsed.breakdown}\nStrengths: ${parsed.strengths}\nMissing Skills: ${parsed.missing}\nSuggestions:\n${parsed.suggestions}`,
      structured: {
        score: parsed.score > 100 ? 100 : parsed.score,
        breakdown: parsed.breakdown,
        strengths: parsed.strengths,
        missing: parsed.missing,
        suggestions: parsed.suggestions
      }
    };
  }
}
