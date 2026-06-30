import React from 'react'
import type { DrawTool } from '@/store/ui'

interface Props {
  active: boolean
  tool: DrawTool
  onToggle: () => void
  onToolChange: (tool: DrawTool) => void
  onClear: () => void
}

export default function DrawToolbar({ active, tool, onToggle, onToolChange, onClear }: Props): React.ReactElement {
  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Annotate toggle button + tool selector (pen, rect, arrow, ellipse) + clear */}
    </div>
  )
}
