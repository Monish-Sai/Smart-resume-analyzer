import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, role, jobDescription } = await req.json();

    if (!text || !role) {
      return NextResponse.json({ result: "Missing data ❌" }, { status: 400 });
    }

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
${trimmedText}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

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
        max_tokens: 1000,
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    let output = "No response";
    if (data.choices && data.choices.length > 0) {
      output = data.choices[0].message.content;

      // 🔥 Robust Regex-based Section Extraction
      const extractSection = (content: string, regexLabel: string, nextLabels: string[]) => {
        // nextLabels are used as lookaheads to stop capturing
        const lookahead = nextLabels.length > 0 
          ? `(?=\\n\\d?\\.?\\s*(?:${nextLabels.join('|')})|$)` 
          : '(?=$)';
        const pattern = new RegExp(`(?:${regexLabel})[:\\-]?\\s*([\\s\\S]*?)${lookahead}`, 'i');
        const match = content.match(pattern);
        return match ? match[1].trim().replace(/^\d\.\s*/, '') : "";
      };

      const extractedBreakdown = extractSection(output, "Score Breakdown", ["Matched Skills", "Strengths", "Missing", "Suggestions"]);
      const extractedStrengths = extractSection(output, "Matched Skills|Strengths", ["Missing Skills?", "Suggestions?"]);
      const extractedMissing = extractSection(output, "Missing Skills?", ["Suggestions?"]);
      const extractedImprovements = extractSection(output, "Suggestions?", []);
      
      // Server-side score extraction
      let parsedScore = 0;
      const scoreMatch = output.match(/(?:ATS Score|Match Percentage).*?(\d{1,3})/i) || output.match(/Score:.*?(\d{1,3})/i);
      if (scoreMatch && scoreMatch[1]) {
        parsedScore = parseInt(scoreMatch[1], 10);
      }
      
      return NextResponse.json({ 
        result: output,
        structured: {
          score: parsedScore > 100 ? 100 : parsedScore,
          breakdown: extractedBreakdown,
          strengths: extractedStrengths,
          missing: extractedMissing,
          suggestions: extractedImprovements
        }
      });

    } else if (data.error) {
      output = data.error.message || data.error;
    }

    return NextResponse.json({ result: output });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ result: "Server crashed ❌" }, { status: 500 });
  }
}
