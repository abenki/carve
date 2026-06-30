import React from 'react'
import type { Slide, Theme } from '@/types'

interface Props {
  slide: Slide
  theme: Theme
}

export default function SlideRenderer({ slide, theme }: Props): React.ReactElement {
  // TODO: render slide.elements as positioned divs within a 16:9 container
  return (
    <div
      className="relative bg-white shadow-2xl"
      style={{ aspectRatio: '16/9', width: '100%', maxWidth: '960px' }}
      data-slide-id={slide.id}
    >
      {/* Elements rendered here */}
    </div>
  )
}
