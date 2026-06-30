import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuid } from 'uuid'
import type { Project, Slide, SlideElement, Theme } from '@/types'

const DEFAULT_THEME: Theme = {
  primary: '#5E6AD2',
  secondary: '#8A8A8A',
  accent: '#E2E2E2',
  background: '#FFFFFF',
  bodyFont: 'Inter',
  headingFont: 'Inter',
}

function blankSlide(): Slide {
  return { id: uuid(), background: '#FFFFFF', elements: [] }
}

export function blankProject(name = 'Untitled'): Project {
  return {
    id: uuid(),
    name,
    theme: DEFAULT_THEME,
    slides: [blankSlide()],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

interface HistoryEntry {
  slides: Slide[]
  theme: Theme
}

interface SlidesState {
  project: Project
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]

  setProject: (project: Project) => void
  updateProjectName: (name: string) => void

  addSlide: (afterIndex: number, slide?: Partial<Slide>) => void
  deleteSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  setSlideBackground: (index: number, background: string) => void

  addElement: (slideIndex: number, element: Omit<SlideElement, 'id'>) => void
  updateElement: (slideIndex: number, elementId: string, changes: Partial<SlideElement>) => void
  deleteElement: (slideIndex: number, elementId: string) => void

  applyTheme: (theme: Partial<Theme>) => void

  undo: () => void
  redo: () => void
  pushHistory: () => void
}

export const useSlidesStore = create<SlidesState>()(
  immer((set, get) => ({
    project: blankProject(),
    undoStack: [],
    redoStack: [],

    setProject: (project) => set({ project, undoStack: [], redoStack: [] }),

    updateProjectName: (name) =>
      set((s) => { s.project.name = name }),

    pushHistory: () =>
      set((s) => {
        s.undoStack.push({
          slides: JSON.parse(JSON.stringify(s.project.slides)),
          theme: { ...s.project.theme },
        })
        if (s.undoStack.length > 50) s.undoStack.shift()
        s.redoStack = []
      }),

    addSlide: (afterIndex, partial) =>
      set((s) => {
        get().pushHistory()
        const slide: Slide = { ...blankSlide(), ...partial }
        s.project.slides.splice(afterIndex + 1, 0, slide)
        s.project.updatedAt = new Date().toISOString()
      }),

    deleteSlide: (index) =>
      set((s) => {
        if (s.project.slides.length <= 1) return
        get().pushHistory()
        s.project.slides.splice(index, 1)
        s.project.updatedAt = new Date().toISOString()
      }),

    duplicateSlide: (index) =>
      set((s) => {
        get().pushHistory()
        const copy: Slide = JSON.parse(JSON.stringify(s.project.slides[index]))
        copy.id = uuid()
        copy.elements = copy.elements.map((el) => ({ ...el, id: uuid() }))
        s.project.slides.splice(index + 1, 0, copy)
        s.project.updatedAt = new Date().toISOString()
      }),

    reorderSlides: (fromIndex, toIndex) =>
      set((s) => {
        get().pushHistory()
        const [slide] = s.project.slides.splice(fromIndex, 1)
        s.project.slides.splice(toIndex, 0, slide)
        s.project.updatedAt = new Date().toISOString()
      }),

    setSlideBackground: (index, background) =>
      set((s) => {
        get().pushHistory()
        s.project.slides[index].background = background
        s.project.updatedAt = new Date().toISOString()
      }),

    addElement: (slideIndex, element) =>
      set((s) => {
        get().pushHistory()
        s.project.slides[slideIndex].elements.push({ ...element, id: uuid() })
        s.project.updatedAt = new Date().toISOString()
      }),

    updateElement: (slideIndex, elementId, changes) =>
      set((s) => {
        get().pushHistory()
        const el = s.project.slides[slideIndex].elements.find((e) => e.id === elementId)
        if (el) Object.assign(el, changes)
        s.project.updatedAt = new Date().toISOString()
      }),

    deleteElement: (slideIndex, elementId) =>
      set((s) => {
        get().pushHistory()
        const slide = s.project.slides[slideIndex]
        slide.elements = slide.elements.filter((e) => e.id !== elementId)
        s.project.updatedAt = new Date().toISOString()
      }),

    applyTheme: (theme) =>
      set((s) => {
        get().pushHistory()
        Object.assign(s.project.theme, theme)
        s.project.updatedAt = new Date().toISOString()
      }),

    undo: () =>
      set((s) => {
        const entry = s.undoStack.pop()
        if (!entry) return
        s.redoStack.push({
          slides: JSON.parse(JSON.stringify(s.project.slides)),
          theme: { ...s.project.theme },
        })
        s.project.slides = entry.slides
        s.project.theme = entry.theme
      }),

    redo: () =>
      set((s) => {
        const entry = s.redoStack.pop()
        if (!entry) return
        s.undoStack.push({
          slides: JSON.parse(JSON.stringify(s.project.slides)),
          theme: { ...s.project.theme },
        })
        s.project.slides = entry.slides
        s.project.theme = entry.theme
      }),
  }))
)
