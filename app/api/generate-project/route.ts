import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found.");
      return NextResponse.json({ success: false, message: "No API key" }, { status: 500 });
    }

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
  "description": "• Bullet point 1\n\n• Bullet point 2\n\n• Bullet point 3"
}

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
      return NextResponse.json({ success: false, message: "AI optimization temporarily unavailable." }, { status: 500 });
    }

    const result = await response.json();
    let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let optimizedData;
    try {
      optimizedData = JSON.parse(generatedText);
    } catch (e) {
      console.error("Failed to parse AI JSON response", generatedText);
      optimizedData = { description: "" };
    }

    return NextResponse.json({ 
      success: true, 
      description: optimizedData.description
    });

  } catch (error) {
    console.error("[GENERATE_PROJECT_ERROR]", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error"
    }, { status: 500 });
  }
}
