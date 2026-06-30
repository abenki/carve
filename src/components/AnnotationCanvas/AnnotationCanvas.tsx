import React, { useEffect, useRef, useCallback } from 'react'
import { Canvas, Rect, Ellipse, Line, Triangle, Group, PencilBrush, type FabricObject } from 'fabric'
import type { DrawTool } from '@/store/ui'

interface Props {
  active: boolean
  tool: DrawTool
  containerRef: React.RefObject<HTMLDivElement>
  onSnapshot: (base64Png: string) => void
}

const STROKE = '#F97316'
const STROKE_WIDTH = 2

export default function AnnotationCanvas({ active, tool, containerRef, onSnapshot }: Props): React.ReactElement {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const wrapperRef = useRef<HTMLElement | null>(null)
  const isDrawingRef = useRef(false)
  const startPointRef = useRef({ x: 0, y: 0 })
  const activeShapeRef = useRef<FabricObject | null>(null)

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()

    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      selection: false,
      renderOnAddRemove: true,
    })
    fabricRef.current = canvas

    // Fabric.js wraps the canvas element in a .canvas-container div with
    // position:relative. Force it to overlay the slide absolutely and store
    // a ref so we can toggle pointer-events reactively.
    const wrapper = canvas.getElement().parentElement
    if (wrapper) {
      Object.assign(wrapper.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: '0',
      })
      wrapperRef.current = wrapper
    }

    return () => {
      canvas.dispose()
      fabricRef.current = null
      wrapperRef.current = null
    }
  }, [])

  // Resize when container resizes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      fabricRef.current?.setDimensions({ width, height })
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // Toggle interactivity — must update the Fabric wrapper (which contains the
  // upper-canvas event layer) not just the original canvas element.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    wrapper.style.pointerEvents = active ? 'auto' : 'none'
    wrapper.style.opacity = active ? '1' : '0'
    wrapper.style.cursor = active ? 'crosshair' : 'default'
  }, [active])

  // Clear canvas when annotation mode is deactivated
  useEffect(() => {
    if (!active && fabricRef.current) {
      fabricRef.current.clear()
      onSnapshot('')
    }
  }, [active])

  const takeSnapshot = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || canvas.getObjects().length === 0) { onSnapshot(''); return }
    onSnapshot(canvas.toDataURL({ format: 'png', multiplier: 2 }))
  }, [onSnapshot])

  // Drawing logic
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = false

    if (tool === 'pen') {
      const brush = new PencilBrush(canvas)
      brush.color = STROKE
      brush.width = STROKE_WIDTH
      canvas.freeDrawingBrush = brush
      canvas.isDrawingMode = true
      const onPathCreated = () => takeSnapshot()
      canvas.on('path:created', onPathCreated)
      return () => {
        canvas.off('path:created', onPathCreated)
        canvas.isDrawingMode = false
      }
    }

    const onMouseDown = (opt: { e: MouseEvent }) => {
      if (!active) return
      const pointer = canvas.getPointer(opt.e)
      startPointRef.current = { x: pointer.x, y: pointer.y }
      isDrawingRef.current = true
      activeShapeRef.current = null

      const common = { stroke: STROKE, strokeWidth: STROKE_WIDTH, fill: 'transparent', selectable: false }

      if (tool === 'rect') {
        const shape = new Rect({ left: pointer.x, top: pointer.y, width: 0, height: 0, ...common })
        canvas.add(shape)
        activeShapeRef.current = shape
      } else if (tool === 'ellipse') {
        const shape = new Ellipse({ left: pointer.x, top: pointer.y, rx: 0, ry: 0, ...common })
        canvas.add(shape)
        activeShapeRef.current = shape
      }
    }

    const onMouseMove = (opt: { e: MouseEvent }) => {
      if (!isDrawingRef.current) return
      const pointer = canvas.getPointer(opt.e)
      const { x: ox, y: oy } = startPointRef.current

      if (tool === 'rect' && activeShapeRef.current) {
        const rect = activeShapeRef.current as Rect
        rect.set({
          left: Math.min(pointer.x, ox),
          top: Math.min(pointer.y, oy),
          width: Math.abs(pointer.x - ox),
          height: Math.abs(pointer.y - oy),
        })
      } else if (tool === 'ellipse' && activeShapeRef.current) {
        const ellipse = activeShapeRef.current as Ellipse
        ellipse.set({
          left: Math.min(pointer.x, ox),
          top: Math.min(pointer.y, oy),
          rx: Math.abs(pointer.x - ox) / 2,
          ry: Math.abs(pointer.y - oy) / 2,
        })
      } else if (tool === 'arrow') {
        if (activeShapeRef.current) canvas.remove(activeShapeRef.current)

        const dx = pointer.x - ox
        const dy = pointer.y - oy
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)

        const shaft = new Line([ox, oy, pointer.x, pointer.y], {
          stroke: STROKE,
          strokeWidth: STROKE_WIDTH,
          selectable: false,
        })

        const head = new Triangle({
          width: 12,
          height: 14,
          fill: STROKE,
          left: pointer.x,
          top: pointer.y,
          angle: angle + 90,
          originX: 'center',
          originY: 'center',
          selectable: false,
        })

        const group = new Group([shaft, head], { selectable: false })
        canvas.add(group)
        activeShapeRef.current = group
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
    <canvas ref={canvasElRef} />
  )
}
