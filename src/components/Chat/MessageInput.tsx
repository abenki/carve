import React, { useState } from 'react'

export default function MessageInput(): React.ReactElement {
  const [value, setValue] = useState('')

  return (
    <div className="p-3 border-t border-neutral-800 flex flex-col gap-2">
      {/* Annotation preview thumbnail (if pendingAnnotation is set) */}
      {/* Textarea */}
      {/* Send button */}
    </div>
  )
}
