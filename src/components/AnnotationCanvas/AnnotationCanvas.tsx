import React, { useEffect, useRef, useCallback } from 'react'
import { Canvas, Rect, Ellipse, Path, FabricObject } from 'fabric'
import type { DrawTool } from '@/store/ui'

interface Props {
  active: boolean
  tool: DrawTool
  containerRef: React.RefObject<HTMLDivElement>
  onSnapshot: (base64Png: string) => void
}

export default function AnnotationCanvas({ active, tool, containerRef, onSnapshot }: Props): React.ReactElement {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const isDrawingRef = useRef(false)
  const startPointRef = useRef({ x: 0, y: 0 })
  const activeShapeRef = useRef<FabricObject | null>(null)

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasElRef.current) return
    const container = containerRef.current
    if (!container) return

    const { width, height } = container.getBoundingClientRect()
    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      selection: false,
      renderOnAddRemove: true,
    })
    fabricRef.current = canvas

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Resize canvas when container resizes
  useEffect(() => {
    const container = containerRef.current
    if (!container || !fabricRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      fabricRef.current?.setDimensions({ width, height })
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // Clear canvas when deactivated
  useEffect(() => {
    if (!active && fabricRef.current) {
      fabricRef.current.clear()
      onSnapshot('')
    }
  }, [active])

  // Snapshot on every object added/modified
  const takeSnapshot = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || canvas.getObjects().length === 0) return
    onSnapshot(canvas.toDataURL({ format: 'png', multiplier: 2 }))
  }, [onSnapshot])

  // Drawing logic
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = false

    if (tool === 'pen') {
      canvas.isDrawingMode = true
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = '#F97316'
        canvas.freeDrawingBrush.width = 2
      }
      const onPathCreated = () => takeSnapshot()
      canvas.on('path:created', onPathCreated)
      return () => { canvas.off('path:created', onPathCreated) }
    }

    // Shape drawing (rect, ellipse, arrow)
    const onMouseDown = (opt: { e: MouseEvent }) => {
      if (!active) return
      const pointer = canvas.getPointer(opt.e)
      startPointRef.current = { x: pointer.x, y: pointer.y }
      isDrawingRef.current = true

      const commonStyle = { stroke: '#F97316', strokeWidth: 2, fill: 'transparent', selectable: false }

      if (tool === 'rect') {
        const rect = new Rect({ left: pointer.x, top: pointer.y, width: 0, height: 0, ...commonStyle })
        canvas.add(rect)
        activeShapeRef.current = rect
      } else if (tool === 'ellipse') {
        const ellipse = new Ellipse({ left: pointer.x, top: pointer.y, rx: 0, ry: 0, ...commonStyle })
        canvas.add(ellipse)
        activeShapeRef.current = ellipse
      }
    }

    const onMouseMove = (opt: { e: MouseEvent }) => {
      if (!isDrawingRef.current || !activeShapeRef.current) return
      const pointer = canvas.getPointer(opt.e)
      const { x: ox, y: oy } = startPointRef.current
      const w = Math.abs(pointer.x - ox)
      const h = Math.abs(pointer.y - oy)

      if (tool === 'rect') {
        const rect = activeShapeRef.current as Rect
        rect.set({
          left: Math.min(pointer.x, ox),
          top: Math.min(pointer.y, oy),
          width: w,
          height: h,
        })
      } else if (tool === 'ellipse') {
        const ellipse = activeShapeRef.current as Ellipse
        ellipse.set({
          left: Math.min(pointer.x, ox),
          top: Math.min(pointer.y, oy),
          rx: w / 2,
          ry: h / 2,
        })
      }
      canvas.renderAll()
    }

    const onMouseUp = () => {
      isDrawingRef.current = false
      activeShapeRef.current = null
      takeSnapshot()
    }

    canvas.on('mouse:down', onMouseDown as Parameters<Canvas['on']>[1])
    canvas.on('mouse:move', onMouseMove as Parameters<Canvas['on']>[1])
    canvas.on('mouse:up', onMouseUp)

    return () => {
      canvas.off('mouse:down', onMouseDown as Parameters<Canvas['on']>[1])
      canvas.off('mouse:move', onMouseMove as Parameters<Canvas['on']>[1])
      canvas.off('mouse:up', onMouseUp)
    }
  }, [active, tool, takeSnapshot])

  return (
    <canvas
      ref={canvasElRef}
      className="absolute inset-0"
      style={{
        pointerEvents: active ? 'auto' : 'none',
        opacity: active ? 1 : 0,
        cursor: active ? 'crosshair' : 'default',
      }}
    />
  )
}
