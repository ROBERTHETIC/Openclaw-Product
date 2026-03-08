import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSmartSummary(data: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Based on the following execution data, generate a concise smart summary for an AI Copilot dashboard in Chinese. 
              Include:
              1. A general summary of performance (executions, success rate).
              2. 3 TODO items based on active PAs or scheduled tasks.
              3. 3 DONE items based on recent successful history.
              4. Any risks (e.g., failed executions, low token balance).
              5. 2-3 optimization suggestions.
              
              Data: ${JSON.stringify(data)}
              
              Format the output strictly as Markdown with these sections: 总结, TODO, DONE, 风险点, 建议. 
              Keep it professional and encouraging.`
            }
          ]
        }
      ]
    });
    
    if (!response || !response.text) {
      throw new Error("Empty response from Gemini");
    }
    
    return response.text;
  } catch (error: any) {
    // Check for 429 error in various formats
    const isQuotaError = 
      error?.message?.includes("429") || 
      error?.status === 429 || 
      error?.error?.code === 429 ||
      error?.error?.status === "RESOURCE_EXHAUSTED";

    if (isQuotaError) {
      console.warn("Gemini Quota Exceeded (429).");
      return "系统繁忙（配额限制），请稍后再试。";
    }

    console.error("Gemini Error:", error);
    return "无法生成智能总结，请稍后再试。";
  }
}
