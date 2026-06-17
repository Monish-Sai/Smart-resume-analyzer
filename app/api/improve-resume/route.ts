import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found.");
      return NextResponse.json({ success: false, message: "No API key" }, { status: 500 });
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ success: false, message: `Gemini API Error: ${errorText}` }, { status: 500 });
    }

    const result = await response.json();
    let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Strip markdown formatting if the model returns ```json ... ```
    generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(generatedText);
      // Ensure we keep the original names and contact info if AI dropped them
      parsed.fullName = parsed.fullName || resumeData.fullName;
      parsed.email = parsed.email || resumeData.email;
      parsed.phone = parsed.phone || resumeData.phone;
      
      return NextResponse.json({ success: true, resumeData: parsed });
    } catch (e) {
      console.error("Failed to parse AI JSON response", generatedText);
      return NextResponse.json({ success: false, message: "Invalid AI response format" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in improve-resume:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
