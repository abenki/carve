import React, { useRef } from 'react'
import { useSlidesStore } from '@/store/slides'
import { useUIStore } from '@/store/ui'
import { useSettingsStore } from '@/store/settings'
import SlideRenderer from './SlideRenderer'
import AnnotationCanvas from '../AnnotationCanvas/AnnotationCanvas'
import DrawToolbar from '../AnnotationCanvas/DrawToolbar'

export default function SlideViewport(): React.ReactElement {
  const { project } = useSlidesStore()
  const { activeSlideIndex, drawMode, activeTool, setDrawMode, setActiveTool, setPendingAnnotation } = useUIStore()
  const { settings } = useSettingsStore()
  const slideContainerRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef<HTMLDivElement>(null)

  const slide = project.slides[activeSlideIndex]

  if (!slide) return <div className="flex-1 bg-app-bg" />

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-app-bg gap-4 overflow-hidden p-8">
      {/* 16:9 slide container */}
      <div
        ref={slideContainerRef}
        data-slide-container
        className="relative shadow-2xl"
        style={{
          aspectRatio: settings.slideSize === '4:3' ? '4 / 3' : '16 / 9',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        <SlideRenderer slide={slide} theme={project.theme} slideRef={slideRef} />
        <AnnotationCanvas
          active={drawMode}
          tool={activeTool}
          containerRef={slideContainerRef}
          onSnapshot={(b64) => setPendingAnnotation(b64)}
        />
      </div>

      <DrawToolbar
        active={drawMode}
        tool={activeTool}
        onToggle={() => setDrawMode(!drawMode)}
        onToolChange={setActiveTool}
        onClear={() => {
          setPendingAnnotation(null)
          setDrawMode(false)
        }}
      />
    </div>
  )
}
