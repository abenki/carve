import React from 'react'

interface Props {
  open: boolean
  onSelect: (templateId: string) => void
}

export default function TemplateGallery({ open, onSelect }: Props): React.ReactElement | null {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-neutral-900 rounded-lg p-6 w-[720px]">
        {/* Grid of template previews loaded from resources/templates/ */}
      </div>
    </div>
  )
}
