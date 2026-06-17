import { NextResponse } from 'next/server';
import { AIService } from '../../../services/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We expect body to contain { resumeData, targetRole }
    const parsed = await AIService.generateATSSuggestions(body);
    
    return NextResponse.json({ 
      success: true, 
      data: parsed
    });

  } catch (error: any) {
    console.error("[ANALYZE_GENERATED_RESUME_ERROR]", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to analyze resume"
    }, { status: 500 });
  }
}
