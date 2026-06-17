import { NextResponse } from 'next/server';
import { AIService } from '../../../services/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = await AIService.improveResume(body);

    return NextResponse.json({ success: true, resumeData: parsed });

  } catch (error: any) {
    console.error("Error in improve-resume:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
