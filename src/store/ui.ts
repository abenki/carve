import { create } from 'zustand'
import type { ChatMessage } from '@/types'

export type DrawTool = 'select' | 'pen' | 'rect' | 'arrow' | 'ellipse'

interface UIState {
  activeSlideIndex: number
  setActiveSlideIndex: (index: number) => void

  drawMode: boolean
  activeTool: DrawTool
  setDrawMode: (enabled: boolean) => void
  setActiveTool: (tool: DrawTool) => void

  pendingAnnotation: string | null  // base64 PNG of annotation snapshot
  setPendingAnnotation: (img: string | null) => void

  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void

  isAiThinking: boolean
  setIsAiThinking: (thinking: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeSlideIndex: 0,
  setActiveSlideIndex: (index) => set({ activeSlideIndex: index }),

  drawMode: false,
  activeTool: 'rect',
  setDrawMode: (enabled) => set({ drawMode: enabled }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  pendingAnnotation: null,
  setPendingAnnotation: (img) => set({ pendingAnnotation: img }),

  messages: [],
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  isAiThinking: false,
  setIsAiThinking: (thinking) => set({ isAiThinking: thinking })
}))
