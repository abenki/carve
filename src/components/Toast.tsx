import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface Props {
  message: string | null
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: Props): React.ReactElement | null {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) { setVisible(false); return }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 200) // wait for fade-out before clearing
    }, 2500)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-neutral-800 border border-app-border2 text-txt-primary text-sm shadow-2xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 180ms ease, transform 180ms ease',
      }}
    >
      <Check size={13} className="text-emerald-400 shrink-0" />
      {message}
    </div>
  )
}
