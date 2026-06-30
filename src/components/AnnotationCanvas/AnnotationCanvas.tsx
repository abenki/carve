import React, { useEffect, useRef } from 'react'
import type { DrawTool } from '@/store/ui'

interface Props {
  active: boolean
  tool: DrawTool
  onSnapshot: (base64Png: string) => void  // called when user sends — captures canvas as image
}

export default function AnnotationCanvas({ active, tool, onSnapshot }: Props): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // TODO: initialize Fabric.js canvas, configure drawing tool
  }, [tool])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: active ? 'auto' : 'none', opacity: active ? 1 : 0 }}
    />
  )
}
