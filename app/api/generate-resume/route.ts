import { NextResponse } from 'next/server';
import { AIService } from '../../../services/ai';

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();

    const finalResumeData = await AIService.generateSummary(body);

    return NextResponse.json({ 
      success: true, 
      resumeData: finalResumeData,
      message: "AI resume generated successfully."
    });

  } catch (error: any) {
    console.error("[GENERATE_RESUME_ERROR]", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "AI optimization is unavailable due to network/API issues."
    }, { status: 500 });
  }
}
