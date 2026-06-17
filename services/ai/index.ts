import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { AIProvider } from './provider';

// Create a timeout promise that rejects after MS milliseconds
const timeout = (ms: number, providerName: string) => 
  new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(`${providerName} Request timed out after ${ms}ms`)), ms)
  );

// Generic fallback executor
async function executeWithFallback<T>(
  methodName: keyof AIProvider,
  args: any[]
): Promise<T> {
  const gemini = new GeminiProvider();
  const groq = new GroqProvider();

  console.log(`[AI_SERVICE] Attempting ${methodName} with Gemini...`);
  try {
    // Attempt Gemini with 10s timeout
    const result = await Promise.race([
      (gemini[methodName] as Function).bind(gemini)(...args),
      timeout(10000, 'Gemini')
    ]);
    console.log(`[AI_SERVICE] Gemini ${methodName} succeeded.`);
    return result as T;
  } catch (geminiError) {
    console.error(`[AI_SERVICE] Gemini ${methodName} failed:`, geminiError);
    console.log(`[AI_SERVICE] Attempting fallback to Groq for ${methodName}...`);
    
    try {
      // Attempt Groq with 10s timeout
      const result = await Promise.race([
        (groq[methodName] as Function).bind(groq)(...args),
        timeout(10000, 'Groq')
      ]);
      console.log(`[AI_SERVICE] Groq ${methodName} succeeded.`);
      return result as T;
    } catch (groqError) {
      console.error(`[AI_SERVICE] Groq ${methodName} failed:`, groqError);
      throw new Error(`AI Services Unavailable: Both Gemini and Groq failed for ${methodName}`);
    }
  }
}

export const AIService = {
  generateSummary: (data: any) => executeWithFallback<any>('generateSummary', [data]),
  generateProjectDescription: (data: any) => executeWithFallback<any>('generateProjectDescription', [data]),
  generateATSSuggestions: (data: any) => executeWithFallback<any>('generateATSSuggestions', [data]),
  improveResume: (data: any) => executeWithFallback<any>('improveResume', [data]),
  analyzePDFResume: (text: string, role: string, jobDescription?: string) => 
    executeWithFallback<any>('analyzePDFResume', [text, role, jobDescription])
};
