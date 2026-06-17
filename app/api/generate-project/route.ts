import { NextResponse } from 'next/server';
import { AIService } from '../../../services/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await AIService.generateProjectDescription(body);

    return NextResponse.json({ 
      success: true, 
      description: data.description
    });

  } catch (error: any) {
    console.error("[GENERATE_PROJECT_ERROR]", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Internal server error"
    }, { status: 500 });
  }
}
