// AI tool definitions sent to Gemini + executor functions that apply tool calls to the slide store

import type { GeminiTool } from './gemini'
import type { SlideElement, Theme } from '@/types'

export const SLIDE_TOOLS: GeminiTool[] = [
  {
    name: 'edit_element',
    description: 'Edit properties of an existing element on a slide',
    parameters: {
      type: 'object',
      properties: {
        slideIndex: { type: 'number' },
        elementId: { type: 'string' },
        changes: { type: 'object', description: 'Partial SlideElement properties to update' }
      },
      required: ['slideIndex', 'elementId', 'changes']
    }
  },
  {
    name: 'add_element',
    description: 'Add a new element to a slide',
    parameters: {
      type: 'object',
      properties: {
        slideIndex: { type: 'number' },
        element: { type: 'object', description: 'SlideElement without id' }
      },
      required: ['slideIndex', 'element']
    }
  },
  {
    name: 'delete_element',
    description: 'Remove an element from a slide',
    parameters: {
      type: 'object',
      properties: {
        slideIndex: { type: 'number' },
        elementId: { type: 'string' }
      },
      required: ['slideIndex', 'elementId']
    }
  },
  {
    name: 'add_slide',
    description: 'Insert a new slide after the given index',
    parameters: {
      type: 'object',
      properties: {
        afterIndex: { type: 'number' },
        content: { type: 'object', description: 'Optional partial Slide to pre-populate' }
      },
      required: ['afterIndex']
    }
  },
  {
    name: 'delete_slide',
    description: 'Delete a slide by index',
    parameters: {
      type: 'object',
      properties: { slideIndex: { type: 'number' } },
      required: ['slideIndex']
    }
  },
  {
    name: 'duplicate_slide',
    description: 'Duplicate a slide',
    parameters: {
      type: 'object',
      properties: { slideIndex: { type: 'number' } },
      required: ['slideIndex']
    }
  },
  {
    name: 'reorder_slides',
    description: 'Move a slide from one position to another',
    parameters: {
      type: 'object',
      properties: {
        fromIndex: { type: 'number' },
        toIndex: { type: 'number' }
      },
      required: ['fromIndex', 'toIndex']
    }
  },
  {
    name: 'set_slide_background',
    description: 'Set the background of a slide (CSS color or image URL)',
    parameters: {
      type: 'object',
      properties: {
        slideIndex: { type: 'number' },
        background: { type: 'string' }
      },
      required: ['slideIndex', 'background']
    }
  },
  {
    name: 'apply_theme',
    description: 'Update the global theme (colors, fonts)',
    parameters: {
      type: 'object',
      properties: {
        theme: { type: 'object', description: 'Partial Theme to merge' }
      },
      required: ['theme']
    }
  }
]

export type ToolCall = { name: string; args: Record<string, unknown> }

export function executeToolCall(
  _toolCall: ToolCall,
  _store: {
    addElement: (slideIndex: number, element: Omit<SlideElement, 'id'>) => void
    updateElement: (slideIndex: number, elementId: string, changes: Partial<SlideElement>) => void
    deleteElement: (slideIndex: number, elementId: string) => void
    addSlide: (afterIndex: number) => void
    deleteSlide: (index: number) => void
    duplicateSlide: (index: number) => void
    reorderSlides: (from: number, to: number) => void
    setSlideBackground: (index: number, bg: string) => void
    applyTheme: (theme: Partial<Theme>) => void
    pushHistory: () => void
  }
): void {
  // TODO: dispatch each tool name to the appropriate store action
}
