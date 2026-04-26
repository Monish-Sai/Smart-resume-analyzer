import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, role, jobDescription } = await req.json();

    if (!text || !role) {
      return NextResponse.json({ result: "Missing data ❌" }, { status: 400 });
    }

    const trimmedText = text.length > 10000 ? text.substring(0, 10000) : text;
    
    const prompt = `You are a high-level Technical Hiring Manager and Senior Recruiter. 
Your task is to conduct a forensic, data-driven analysis of this resume for the position of ${role}.

${jobDescription ? `### Target Job Description Requirements:\n"${jobDescription}"\n` : ''}

### Step-by-Step Scoring Protocol (Mental Calculation):
1. **Initial Score: 0**
2. **Technical Skills (Max 50 pts)**: Award points for every direct technical match. Deduct 5 points for every "critical" missing skill.
3. **Professional Experience (Max 30 pts)**: Analyze relevance and seniority. Award points based on tenure and impact.
4. **Formatting & Keywords (20 pts)**: Award points for clear hierarchy and parsable keywords.

### Final Scoring Rules:
- **Zero Generic Scores**: Do NOT use numbers ending in 0 or 5. 
- **Unique Variance**: Each resume must have a unique score based on its specific contents. 
- **Verification**: Ensure the 'Matched Skills' list ONLY contains words actually present in the text.

### Output Format (Strictly Provide ONLY this):
[Reasoning: A 1-sentence internal summary of the calculation logic]
1. ${jobDescription ? 'Match Percentage' : 'ATS Score'}: [Provide exact granular score e.g. 64, 71, 42, 88]
2. ${jobDescription ? 'Matched Skills' : 'Strengths'}: [Comma-separated list of keywords found in resume]
3. Missing Skills: [Comma-separated list of missing vital keywords]
4. Suggestions: [3-4 high-impact bullet points]

Resume Data:
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
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
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
