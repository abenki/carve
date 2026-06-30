import React, { useEffect, useRef, useCallback } from 'react'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Offscreen canvas holding everything already finalized — lets a live
  // shape preview redraw on top without erasing prior strokes.
  const committedRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const committedCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const sizeRef = useRef({ width: 0, height: 0 })

  const isDrawingRef = useRef(false)
  const startPointRef = useRef({ x: 0, y: 0 })
  const lastPointRef = useRef({ x: 0, y: 0 })
  const hasDrawnRef = useRef(false)

  const resize = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current
    if (!canvas || width === 0 || height === 0) return
    const dpr = window.devicePixelRatio || 1
    sizeRef.current = { width, height }

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctxRef.current = ctx
    }

    if (!committedRef.current) committedRef.current = document.createElement('canvas')
    const committed = committedRef.current
    committed.width = Math.round(width * dpr)
    committed.height = Math.round(height * dpr)
    const cctx = committed.getContext('2d')
    if (cctx) {
      cctx.scale(dpr, dpr)
      cctx.lineCap = 'round'
      cctx.lineJoin = 'round'
      committedCtxRef.current = cctx
    }
    hasDrawnRef.current = false
  }, [])

  // Initial size + resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    resize(rect.width, rect.height)

    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      resize(width, height)
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [containerRef, resize])

  // Toggle interactivity directly on the canvas — no wrapper element needed
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.style.pointerEvents = active ? 'auto' : 'none'
    canvas.style.opacity = active ? '1' : '0'
    canvas.style.cursor = active ? 'crosshair' : 'default'
  }, [active])

  const clearAll = useCallback(() => {
    const { width, height } = sizeRef.current
    ctxRef.current?.clearRect(0, 0, width, height)
    committedCtxRef.current?.clearRect(0, 0, width, height)
    hasDrawnRef.current = false
  }, [])

  // Clear canvas when annotation mode is deactivated
  useEffect(() => {
    if (!active) {
      clearAll()
      onSnapshot('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const takeSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawnRef.current) { onSnapshot(''); return }
    onSnapshot(canvas.toDataURL('image/png'))
  }, [onSnapshot])

  const redrawFromCommitted = useCallback(() => {
    const ctx = ctxRef.current
    const committed = committedRef.current
    const { width, height } = sizeRef.current
    if (!ctx || !committed) return
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(committed, 0, 0, committed.width, committed.height, 0, 0, width, height)
  }, [])

  const strokeShape = useCallback((ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
    ctx.strokeStyle = STROKE
    ctx.lineWidth = STROKE_WIDTH
    ctx.fillStyle = STROKE

    if (tool === 'rect') {
      ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0))
    } else if (tool === 'ellipse') {
      const rx = Math.abs(x1 - x0) / 2
      const ry = Math.abs(y1 - y0) / 2
      const cx = Math.min(x0, x1) + rx
      const cy = Math.min(y0, y1) + ry
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    } else if (tool === 'arrow') {
      drawArrow(ctx, x0, y0, x1, y1)
    }
  }, [tool])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!active) return
      canvas.setPointerCapture(e.pointerId)
      const pos = getPos(e)
      startPointRef.current = pos
      lastPointRef.current = pos
      isDrawingRef.current = true

      if (tool === 'pen') {
        const ctx = ctxRef.current
        const cctx = committedCtxRef.current
        if (!ctx || !cctx) return
        // dot for a tap with no movement
        for (const c of [ctx, cctx]) {
          c.fillStyle = STROKE
          c.beginPath()
          c.arc(pos.x, pos.y, STROKE_WIDTH / 2, 0, Math.PI * 2)
          c.fill()
        }
        hasDrawnRef.current = true
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      const pos = getPos(e)

      if (tool === 'pen') {
        const ctx = ctxRef.current
        const cctx = committedCtxRef.current
        if (!ctx || !cctx) return
        const { x: lx, y: ly } = lastPointRef.current
        for (const c of [ctx, cctx]) {
          c.strokeStyle = STROKE
          c.lineWidth = STROKE_WIDTH
          c.beginPath()
          c.moveTo(lx, ly)
          c.lineTo(pos.x, pos.y)
          c.stroke()
        }
        lastPointRef.current = pos
        return
      }

      // shapes: restore last committed state, draw the live preview on top
      redrawFromCommitted()
      const ctx = ctxRef.current
      if (!ctx) return
      const { x: x0, y: y0 } = startPointRef.current
      strokeShape(ctx, x0, y0, pos.x, pos.y)
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      canvas.releasePointerCapture(e.pointerId)

      if (tool !== 'pen') {
        const pos = getPos(e)
        const { x: x0, y: y0 } = startPointRef.current
        const cctx = committedCtxRef.current
        if (cctx && (Math.abs(pos.x - x0) > 1 || Math.abs(pos.y - y0) > 1)) {
          strokeShape(cctx, x0, y0, pos.x, pos.y)
          hasDrawnRef.current = true
        }
        redrawFromCommitted()
      }

      takeSnapshot()
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
    }
  }, [active, tool, strokeShape, redrawFromCommitted, takeSnapshot])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  )
}

function drawArrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void {
  const headLength = 14
  const angle = Math.atan2(y1 - y0, x1 - x0)

  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - headLength * Math.cos(angle - Math.PI / 6), y1 - headLength * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x1 - headLength * Math.cos(angle + Math.PI / 6), y1 - headLength * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}
