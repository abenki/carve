import React from 'react'
import { Pencil, Square, ArrowUpRight, Circle, Trash2, X } from 'lucide-react'
import type { DrawTool } from '@/store/ui'
import { cn } from '@/lib/cn'

interface Props {
  active: boolean
  tool: DrawTool
  onToggle: () => void
  onToolChange: (tool: DrawTool) => void
  onClear: () => void
}

const TOOLS: { id: DrawTool; icon: React.ReactNode; label: string }[] = [
  { id: 'rect',    icon: <Square size={13} />,        label: 'Rectangle' },
  { id: 'arrow',   icon: <ArrowUpRight size={13} />,  label: 'Arrow' },
  { id: 'ellipse', icon: <Circle size={13} />,        label: 'Ellipse' },
  { id: 'pen',     icon: <Pencil size={13} />,        label: 'Pen' },
]

export default function DrawToolbar({ active, tool, onToggle, onToolChange, onClear }: Props): React.ReactElement {
  return (
    <div className="flex items-center gap-1.5">
      {/* Annotate toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors border',
          active
            ? 'bg-accent text-white border-accent'
            : 'text-txt-secondary border-app-border2 hover:text-txt-primary hover:bg-app-overlay'
        )}
      >
        <Pencil size={11} />
        Annotate
      </button>

      {/* Tool selector — only shown when active */}
      {active && (
        <>
          <div className="w-px h-4 bg-app-border2" />
          {TOOLS.map(({ id, icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => onToolChange(id)}
              className={cn(
                'p-1.5 rounded transition-colors',
                tool === id
                  ? 'bg-accent text-white'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-app-overlay'
              )}
            >
              {icon}
            </button>
          ))}

          <div className="w-px h-4 bg-app-border2" />

          <button
            title="Clear annotations"
            onClick={onClear}
            className="p-1.5 rounded text-txt-secondary hover:text-red-400 hover:bg-app-overlay transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  )
}
