import { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useSlidesStore } from '@/store/slides'
import { useUIStore } from '@/store/ui'
import { useSettingsStore } from '@/store/settings'
import { sendToGemini } from '@/lib/gemini'
import { executeToolCalls } from '@/lib/tools'
import { buildSlideContext } from '@/lib/slideRenderer'

export function useChat() {
  const slides = useSlidesStore()
  const ui = useUIStore()
  const { settings } = useSettingsStore()

  const send = useCallback(async (text: string, imageBase64?: string) => {
    if (!text.trim()) return

    if (!settings.apiKey) {
      ui.addMessage({
        id: uuid(),
        role: 'assistant',
        content: 'No API key set. Open Settings (⚙) and add your Google AI Studio API key.',
        timestamp: new Date().toISOString(),
      })
      return
    }

    // Push user message
    ui.addMessage({
      id: uuid(),
      role: 'user',
      content: text,
      imageBase64,
      timestamp: new Date().toISOString(),
    })

    ui.setIsAiThinking(true)

    try {
      const slideContextJson = buildSlideContext(slides.project, ui.activeSlideIndex)

      const { text: responseText, toolCalls } = await sendToGemini(
        settings.apiKey,
        settings.model,
        text,
        slideContextJson,
        imageBase64,
      )

      // Execute tool calls first (slide updates happen synchronously)
      if (toolCalls.length > 0) {
        executeToolCalls(toolCalls, {
          addElement: slides.addElement,
          updateElement: slides.updateElement,
          deleteElement: slides.deleteElement,
          addSlide: slides.addSlide,
          deleteSlide: slides.deleteSlide,
          duplicateSlide: slides.duplicateSlide,
          reorderSlides: slides.reorderSlides,
          setSlideBackground: slides.setSlideBackground,
          applyTheme: slides.applyTheme,
        })
      }

      // Push assistant reply
      ui.addMessage({
        id: uuid(),
        role: 'assistant',
        content: responseText || (toolCalls.length > 0 ? 'Done.' : 'No changes made.'),
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      ui.addMessage({
        id: uuid(),
        role: 'assistant',
        content: `Error: ${message}`,
        timestamp: new Date().toISOString(),
      })
    } finally {
      ui.setIsAiThinking(false)
    }
  }, [slides, ui, settings])

  return { send }
}
