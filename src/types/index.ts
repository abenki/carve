export interface Project {
  id: string
  name: string
  theme: Theme
  slides: Slide[]
  createdAt: string
  updatedAt: string
}

export interface Slide {
  id: string
  background: string
  elements: SlideElement[]
}

export type SlideElementType = 'text' | 'image' | 'shape'

export interface SlideElement {
  id: string
  type: SlideElementType
  x: number       // % of slide width
  y: number       // % of slide height
  width: number   // % of slide width
  height: number  // % of slide height
  // text
  content?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  // image
  src?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  // shape
  shapeType?: 'rect' | 'circle' | 'line'
  fill?: string
  stroke?: string
  strokeWidth?: number
  borderRadius?: number
  opacity?: number
}

export interface Theme {
  primary: string
  secondary: string
  accent: string
  background: string
  bodyFont: string
  headingFont: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageBase64?: string  // annotated slide screenshot attached to user message
  timestamp: string
}

export interface AppSettings {
  apiKey: string
  model: string
  slideSize: '16:9' | '4:3'
}

export interface RecentProject {
  name: string
  path: string
  updatedAt: string
}
