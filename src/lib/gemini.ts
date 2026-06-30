import {
  GoogleGenerativeAI,
  SchemaType,
  FunctionCallingMode,
  type FunctionCall,
  type Content,
} from '@google/generative-ai'

// ─── Tool definitions ────────────────────────────────────────────────────────

const FUNCTION_DECLARATIONS = [
  {
    name: 'edit_element',
    description: 'Edit any property of an existing element on a slide (text, font, color, size, position, etc.)',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        slideIndex: { type: SchemaType.NUMBER, description: 'Zero-based slide index' },
        elementId:  { type: SchemaType.STRING, description: 'The element id from the slide JSON' },
        changes: {
          type: SchemaType.OBJECT,
          description: 'Partial SlideElement fields to update',
          nullable: false,
          properties: {
            content:     { type: SchemaType.STRING },
            fontSize:    { type: SchemaType.NUMBER },
            fontFamily:  { type: SchemaType.STRING },
            fontWeight:  { type: SchemaType.STRING },
            fontStyle:   { type: SchemaType.STRING },
            color:       { type: SchemaType.STRING },
            textAlign:   { type: SchemaType.STRING },
            lineHeight:  { type: SchemaType.NUMBER },
            x:           { type: SchemaType.NUMBER },
            y:           { type: SchemaType.NUMBER },
            width:       { type: SchemaType.NUMBER },
            height:      { type: SchemaType.NUMBER },
            opacity:     { type: SchemaType.NUMBER },
            fill:        { type: SchemaType.STRING },
            stroke:      { type: SchemaType.STRING },
            strokeWidth: { type: SchemaType.NUMBER },
            borderRadius:{ type: SchemaType.NUMBER },
          },
        },
      },
      required: ['slideIndex', 'elementId', 'changes'],
    },
  },
  {
    name: 'add_element',
    description: 'Add a new element (text, image, or shape) to a slide',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        slideIndex: { type: SchemaType.NUMBER },
        element: {
          type: SchemaType.OBJECT,
          nullable: false,
          properties: {
            type:        { type: SchemaType.STRING,  description: '"text", "image", or "shape"' },
            x:           { type: SchemaType.NUMBER,  description: 'Left position as % of slide width (0–100)' },
            y:           { type: SchemaType.NUMBER,  description: 'Top position as % of slide height (0–100)' },
            width:       { type: SchemaType.NUMBER,  description: 'Width as % of slide width (0–100)' },
            height:      { type: SchemaType.NUMBER,  description: 'Height as % of slide height (0–100)' },
            content:     { type: SchemaType.STRING,  description: 'Text content (text elements)' },
            fontSize:    { type: SchemaType.NUMBER,  description: 'Font size in px' },
            fontFamily:  { type: SchemaType.STRING,  description: 'Font family name' },
            fontWeight:  { type: SchemaType.STRING,  description: '"400", "600", "700", etc.' },
            fontStyle:   { type: SchemaType.STRING,  description: '"normal" or "italic"' },
            color:       { type: SchemaType.STRING,  description: 'Text color hex (#RRGGBB)' },
            textAlign:   { type: SchemaType.STRING,  description: '"left", "center", or "right"' },
            lineHeight:  { type: SchemaType.NUMBER,  description: 'Line height multiplier, e.g. 1.4' },
            fill:        { type: SchemaType.STRING,  description: 'Fill color for shapes' },
            stroke:      { type: SchemaType.STRING,  description: 'Border color for shapes' },
            strokeWidth: { type: SchemaType.NUMBER,  description: 'Border width in px' },
            borderRadius:{ type: SchemaType.NUMBER,  description: 'Border radius in px' },
            opacity:     { type: SchemaType.NUMBER,  description: 'Opacity 0–1' },
          },
          required: ['type', 'x', 'y', 'width', 'height'],
        },
      },
      required: ['slideIndex', 'element'],
    },
  },
  {
    name: 'delete_element',
    description: 'Remove an element from a slide',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        slideIndex: { type: SchemaType.NUMBER },
        elementId:  { type: SchemaType.STRING },
      },
      required: ['slideIndex', 'elementId'],
    },
  },
  {
    name: 'add_slide',
    description: 'Insert a new blank slide after the given index',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        afterIndex: { type: SchemaType.NUMBER, description: 'Insert after this zero-based index' },
      },
      required: ['afterIndex'],
    },
  },
  {
    name: 'delete_slide',
    description: 'Delete a slide by index',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { slideIndex: { type: SchemaType.NUMBER } },
      required: ['slideIndex'],
    },
  },
  {
    name: 'duplicate_slide',
    description: 'Duplicate a slide and insert it directly after the original',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { slideIndex: { type: SchemaType.NUMBER } },
      required: ['slideIndex'],
    },
  },
  {
    name: 'reorder_slides',
    description: 'Move a slide from one position to another',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        fromIndex: { type: SchemaType.NUMBER },
        toIndex:   { type: SchemaType.NUMBER },
      },
      required: ['fromIndex', 'toIndex'],
    },
  },
  {
    name: 'set_slide_background',
    description: 'Set the background of a slide (CSS color value)',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        slideIndex:  { type: SchemaType.NUMBER },
        background:  { type: SchemaType.STRING, description: 'CSS color, e.g. "#1A1A2E" or "linear-gradient(...)"' },
      },
      required: ['slideIndex', 'background'],
    },
  },
  {
    name: 'apply_theme',
    description: 'Update the global presentation theme (colors and fonts)',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        theme: {
          type: SchemaType.OBJECT,
          nullable: false,
          properties: {
            primary:     { type: SchemaType.STRING, description: 'Primary color hex' },
            secondary:   { type: SchemaType.STRING, description: 'Secondary color hex' },
            accent:      { type: SchemaType.STRING, description: 'Accent color hex' },
            background:  { type: SchemaType.STRING, description: 'Default slide background color' },
            bodyFont:    { type: SchemaType.STRING, description: 'Body font family name' },
            headingFont: { type: SchemaType.STRING, description: 'Heading font family name' },
          },
        },
      },
      required: ['theme'],
    },
  },
]

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(slideContextJson: string): string {
  return `You are the AI assistant inside Carve, a slide editor app. You help users create and edit beautiful HTML presentations.

CURRENT SLIDE STATE:
${slideContextJson}

YOUR JOB:
- Understand what the user wants to change
- Call the appropriate tool(s) to make the edit
- Reply with a short, helpful explanation of what you did (1–2 sentences max)
- You may call multiple tools in a single turn to accomplish a request

RULES:
- Always reference element IDs exactly as they appear in the slide JSON above
- Positions (x, y) and sizes (width, height) are percentages of the slide dimensions (0–100)
- Font sizes are in pixels
- Colors are CSS hex values (#RRGGBB or #RRGGBBAA)
- For text elements, set sensible defaults if the user doesn't specify (e.g. fontSize: 32, color: "#1A1A1A")
- If the user annotated the slide with a drawing, the highlighted area indicates WHICH element they're referring to
- Don't ask clarifying questions — make a best-effort edit and explain what you did`
}

// ─── Main send function ───────────────────────────────────────────────────────

export interface GeminiMessage {
  role: 'user' | 'assistant'
  text: string
  imageBase64?: string
}

export interface GeminiResponse {
  text: string
  toolCalls: FunctionCall[]
}

export async function sendToGemini(
  apiKey: string,
  model: string,
  message: string,
  slideContextJson: string,
  imageBase64?: string,
): Promise<GeminiResponse> {
  const genAI = new GoogleGenerativeAI(apiKey)

  const genModel = genAI.getGenerativeModel({
    model: model || 'gemini-2.5-pro',
    tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
    systemInstruction: buildSystemPrompt(slideContextJson),
  })

  const parts: Content['parts'] = [{ text: message }]

  if (imageBase64) {
    // Strip data URL prefix if present
    const data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    parts.push({ inlineData: { mimeType: 'image/png', data } })
  }

  const result = await genModel.generateContent({ contents: [{ role: 'user', parts }] })
  const response = result.response

  // text() throws when the response contains only function call parts
  let text = ''
  try { text = response.text() } catch { text = '' }

  const toolCalls = response.functionCalls() ?? []

  console.log('[Gemini] text:', JSON.stringify(text), '| toolCalls:', toolCalls.length, toolCalls.map(c => c.name))

  return { text, toolCalls }
}
