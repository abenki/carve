import { useSlidesStore, blankProject } from '@/store/slides'
import { useUIStore } from '@/store/ui'
import { useSettingsStore } from '@/store/settings'
import { renderProjectToExportHtml, renderProjectToPrintHtml } from '@/lib/slideRenderer'

export function useFileActions() {
  const { project, setProject } = useSlidesStore()
  const { currentFilePath, setCurrentFilePath, showToast, setActiveSlideIndex, setIsDirty } = useUIStore()
  const { settings } = useSettingsStore()
  const slideSize = settings.slideSize

  async function newProject(): Promise<void> {
    setProject(blankProject())
    setCurrentFilePath(null)
    setIsDirty(false)
    setActiveSlideIndex(0)
  }

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
    const html = renderProjectToExportHtml(project, slideSize)
    const result = await window.api.exportHtml(html, project.name)
    if (!result.canceled) showToast('Exported as HTML')
  }

  async function exportPdf(): Promise<void> {
    const html = renderProjectToPrintHtml(project, slideSize)
    const result = await window.api.exportPdf(html, project.name, slideSize)
    if (!result.canceled) showToast('Exported as PDF')
  }

  return { newProject, save, saveAs, open, exportHtml, exportPdf }
}
