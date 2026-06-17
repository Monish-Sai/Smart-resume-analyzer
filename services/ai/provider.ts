export interface AIProvider {
  name: string;
  generateSummary(data: any): Promise<any>;
  generateProjectDescription(data: any): Promise<any>;
  generateATSSuggestions(data: any): Promise<any>;
  improveResume(data: any): Promise<any>;
  analyzePDFResume(text: string, role: string, jobDescription?: string): Promise<any>;
}
