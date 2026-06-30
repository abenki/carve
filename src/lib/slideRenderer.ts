// Converts the JSON slide model into an HTML string for rendering and export

import type { Project, Slide, SlideElement, Theme } from '@/types'

export function renderSlideToHtml(slide: Slide, theme: Theme): string {
  // TODO: generate HTML string from slide JSON
  // Each element maps to a positioned div with inline styles
  return ''
}

export function renderProjectToExportHtml(project: Project): string {
  // TODO: generate a self-contained single-file HTML presentation
  // Includes all slides, inline CSS, and minimal slideshow JS (arrow keys, click to advance)
  return ''
}

export function buildSlideContext(project: Project, activeSlideIndex: number): string {
  // Returns a JSON string describing the current slide state to include in the Gemini prompt
  return JSON.stringify({
    activeSlideIndex,
    totalSlides: project.slides.length,
    theme: project.theme,
    activeSlide: project.slides[activeSlideIndex]
  }, null, 2)
}
