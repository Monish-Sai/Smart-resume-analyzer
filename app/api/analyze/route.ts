import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, role, jobDescription } = await req.json();

    if (!text || !role) {
      return NextResponse.json({ result: "Missing data ❌" }, { status: 400 });
    }

    const trimmedText = text.length > 10000 ? text.substring(0, 10000) : text;
    
    const prompt = `Analyze this resume for the ${role} role. Please be extremely concise and use simple language.
${jobDescription ? `\nAnalyze the resume against this specific Job Description:\n"${jobDescription}"\n` : ''}

Give me only:
1. ${jobDescription ? 'Match Percentage' : 'ATS Score'} (0-100)
2. ${jobDescription ? 'Matched Skills & Strengths' : 'Strengths'} (short bullet points)
3. Missing Skills & Keywords (short bullet points)
4. Suggestions to improve match (short, simple, actionable points)

Resume:
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
