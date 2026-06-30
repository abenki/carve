import { useSlidesStore } from '@/store/slides'
import { useUIStore } from '@/store/ui'
import { renderProjectToExportHtml } from '@/lib/slideRenderer'

export function useFileActions() {
  const { project, setProject } = useSlidesStore()
  const { currentFilePath, setCurrentFilePath, showToast, setActiveSlideIndex, setIsDirty } = useUIStore()

  async function save(): Promise<void> {
    if (currentFilePath) {
      await window.api.saveProject(project, currentFilePath)
      setIsDirty(false)
      showToast('Project saved')
    } else {
      await saveAs()
    }
  }

  async function saveAs(): Promise<void> {
    const result = await window.api.saveProjectAs(project)
    if (!result.canceled && result.filePath) {
      setCurrentFilePath(result.filePath)
      setIsDirty(false)
      showToast('Project saved')
    }
  }

  async function open(): Promise<void> {
    const result = await window.api.openProject()
    if (!result.canceled && result.project && result.filePath) {
      setProject(result.project)
      setCurrentFilePath(result.filePath)
      setIsDirty(false)
      setActiveSlideIndex(0)
      showToast('Project opened')
    }
  }

  async function exportHtml(): Promise<void> {
    const html = renderProjectToExportHtml(project)
    const result = await window.api.exportHtml(html, project.name)
    if (!result.canceled) {
      showToast('Exported as HTML')
    }
  }

  return { save, saveAs, open, exportHtml }
}
