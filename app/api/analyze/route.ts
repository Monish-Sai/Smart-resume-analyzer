import { NextResponse } from 'next/server';
import { AIService } from '../../../services/ai';

export async function POST(req: Request) {
  try {
    const { text, role, jobDescription } = await req.json();

    if (!text || !role) {
      return NextResponse.json({ result: "Missing data ❌" }, { status: 400 });
    }

    const data = await AIService.analyzePDFResume(text, role, jobDescription);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ result: error.message || "Server crashed ❌" }, { status: 500 });
  }
}
