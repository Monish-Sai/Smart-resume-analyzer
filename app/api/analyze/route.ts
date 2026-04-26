import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, role, jobDescription } = await req.json();

    if (!text || !role) {
      return NextResponse.json({ result: "Missing data ❌" }, { status: 400 });
    }

    const trimmedText = text.length > 10000 ? text.substring(0, 10000) : text;
    
    const prompt = `You are an elite, senior-level Recruitment Engineer and ATS Logic Engine. 
Your goal is to provide a hyper-realistic, data-driven analysis of the provided resume for the role of ${role}.

${jobDescription ? `### Target Job Description:\n"${jobDescription}"\n` : ''}

### Scoring Rubric (Strictly follow this to calculate the final score):
1. **Technical Hard Skills (50%)**: Match exactly against required keywords. Do not give credit for "similar" skills unless they are industry-standard synonyms.
2. **Relevant Experience (30%)**: Analyze years of experience and seniority level. Is it a match for a ${role}?
3. **Education & Structural Clarity (20%)**: Does the resume follow a professional hierarchy? Is it parsable?

### Critical Instructions:
- **Avoid "Safe" Rounding**: Do NOT provide scores ending in 0 or 5 (e.g., avoid 60, 65, 70). Provide precise, granular scores based on evidence (e.g., 63, 72, 58, 81).
- **Ruthless Honesty**: If the resume is a poor match, score it below 40. If it is perfect, score it above 90.
- **Data-Driven**: Every point in the score must be justifiable by the content.

### Response Format (Strictly follow):
1. ${jobDescription ? 'Match Percentage' : 'ATS Score'}: [Provide exact granular score 0-100]
2. ${jobDescription ? 'Matched Skills' : 'Strengths'}: [A single comma-separated list of ONLY verified technical keywords found in the text]
3. Missing Skills: [A single comma-separated list of skills missing that are vital for a ${role}]
4. Suggestions: [3-4 actionable, high-impact bullet points for improvement]

Resume Content:
${trimmedText}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      console.error("Missing HUGGINGFACE_API_KEY environment variable.");
      return NextResponse.json({ result: "Server misconfiguration ❌" }, { status: 500 });
    }

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, // 🔁 securely loaded from env
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    let output = "No response";
    if (data.choices && data.choices.length > 0) {
      output = data.choices[0].message.content;
    } else if (data.error) {
      output = data.error.message || data.error;
    }

    return NextResponse.json({ result: output });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ result: "Server crashed ❌" }, { status: 500 });
  }
}
