import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Project, Slide, SlideElement, Theme } from '@/types'

interface HistoryEntry {
  slides: Slide[]
  theme: Theme
}

interface SlidesState {
  project: Project | null
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]

  // Project
  setProject: (project: Project) => void
  updateProjectName: (name: string) => void

  // Slides
  addSlide: (afterIndex: number, slide?: Partial<Slide>) => void
  deleteSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  setSlideBackground: (index: number, background: string) => void

  // Elements
  addElement: (slideIndex: number, element: Omit<SlideElement, 'id'>) => void
  updateElement: (slideIndex: number, elementId: string, changes: Partial<SlideElement>) => void
  deleteElement: (slideIndex: number, elementId: string) => void

  // Theme
  applyTheme: (theme: Partial<Theme>) => void

  // Undo / Redo
  undo: () => void
  redo: () => void
  pushHistory: () => void
}

export const useSlidesStore = create<SlidesState>()(
  immer((_set, _get) => ({
    project: null,
    undoStack: [],
    redoStack: [],

    setProject: (_project) => {
      // TODO
    },
    updateProjectName: (_name) => {
      // TODO
    },
    addSlide: (_afterIndex, _slide) => {
      // TODO
    },
    deleteSlide: (_index) => {
      // TODO
    },
    duplicateSlide: (_index) => {
      // TODO
    },
    reorderSlides: (_fromIndex, _toIndex) => {
      // TODO
    },
    setSlideBackground: (_index, _background) => {
      // TODO
    },
    addElement: (_slideIndex, _element) => {
      // TODO
    },
    updateElement: (_slideIndex, _elementId, _changes) => {
      // TODO
    },
    deleteElement: (_slideIndex, _elementId) => {
      // TODO
    },
    applyTheme: (_theme) => {
      // TODO
    },
    undo: () => {
      // TODO
    },
    redo: () => {
      // TODO
    },
    pushHistory: () => {
      // TODO
    }
  }))
)
