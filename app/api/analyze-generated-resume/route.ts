import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found.");
      return NextResponse.json({ success: false, message: "No API key" }, { status: 500 });
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ success: false, message: "Failed to connect to AI" }, { status: 500 });
    }

    const result = await response.json();
    let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Strip markdown formatting if the model returns ```json ... ```
    generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(generatedText);
      return NextResponse.json({ success: true, data: parsed });
    } catch (e) {
      console.error("Failed to parse AI JSON response", generatedText);
      return NextResponse.json({ success: false, message: "Invalid AI response format" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in analyze-generated-resume:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
