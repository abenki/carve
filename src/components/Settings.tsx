import React from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function Settings({ open, onClose }: Props): React.ReactElement | null {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-neutral-900 rounded-lg p-6 w-96 space-y-4">
        {/* API key input (masked) */}
        {/* Model selector */}
        {/* Slide size selector */}
        {/* Save / Close */}
      </div>
    </div>
  )
}
