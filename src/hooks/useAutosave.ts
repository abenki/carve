import { useEffect, useRef } from 'react'
import { useSlidesStore } from '@/store/slides'
import { useUIStore } from '@/store/ui'

const DEBOUNCE_MS = 1500

export function useAutosave(): void {
  const project = useSlidesStore((s) => s.project)
  const { currentFilePath, setIsDirty } = useUIStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    // Skip the initial mount — don't save on first render
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    // Only autosave once the project has been saved at least once
    if (!currentFilePath) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await window.api.saveProject(project, currentFilePath)
        setIsDirty(false)
      } catch (err) {
        console.error('Autosave failed:', err)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [project.updatedAt, currentFilePath])
}
