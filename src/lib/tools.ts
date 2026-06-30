import type { FunctionCall } from '@google/generative-ai'
import type { SlideElement, Theme } from '@/types'

interface SlideStore {
  addElement: (slideIndex: number, element: Omit<SlideElement, 'id'>) => void
  updateElement: (slideIndex: number, elementId: string, changes: Partial<SlideElement>) => void
  deleteElement: (slideIndex: number, elementId: string) => void
  addSlide: (afterIndex: number) => void
  deleteSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  reorderSlides: (from: number, to: number) => void
  setSlideBackground: (index: number, bg: string) => void
  applyTheme: (theme: Partial<Theme>) => void
}

export function executeToolCalls(toolCalls: FunctionCall[], store: SlideStore): void {
  for (const call of toolCalls) {
    console.log('[Tool]', call.name, JSON.stringify(call.args, null, 2))
    const args = call.args as Record<string, unknown>

    switch (call.name) {
      case 'edit_element':
        store.updateElement(
          args.slideIndex as number,
          args.elementId as string,
          args.changes as Partial<SlideElement>,
        )
        break

      case 'add_element':
        store.addElement(
          args.slideIndex as number,
          args.element as Omit<SlideElement, 'id'>,
        )
        break

      case 'delete_element':
        store.deleteElement(
          args.slideIndex as number,
          args.elementId as string,
        )
        break

      case 'add_slide':
        store.addSlide(args.afterIndex as number)
        break

      case 'delete_slide':
        store.deleteSlide(args.slideIndex as number)
        break

      case 'duplicate_slide':
        store.duplicateSlide(args.slideIndex as number)
        break

      case 'reorder_slides':
        store.reorderSlides(
          args.fromIndex as number,
          args.toIndex as number,
        )
        break

      case 'set_slide_background':
        store.setSlideBackground(
          args.slideIndex as number,
          args.background as string,
        )
        break

      case 'apply_theme':
        store.applyTheme(args.theme as Partial<Theme>)
        break

      default:
        console.warn('Unknown tool call:', call.name)
    }
  }
}
