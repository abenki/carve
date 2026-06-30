// Gemini API client
// Handles multimodal requests (text + annotated slide screenshot) and tool use

export interface GeminiRequest {
  message: string
  imageBase64?: string  // annotated slide screenshot
  slideContext: string  // JSON stringified current slide state
  tools: GeminiTool[]
}

export interface GeminiTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface GeminiResponse {
  text: string
  toolCalls: Array<{ name: string; args: Record<string, unknown> }>
}

export async function sendToGemini(
  _apiKey: string,
  _model: string,
  _request: GeminiRequest
): Promise<GeminiResponse> {
  // TODO: implement using @google/generative-ai SDK
  // 1. Build contents array with optional image part
  // 2. Attach tool definitions
  // 3. Send request
  // 4. Parse response for text + functionCalls
  throw new Error('Not implemented')
}
