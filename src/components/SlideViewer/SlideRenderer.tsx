import React, { useRef } from 'react'
import type { Slide, Theme } from '@/types'
import { renderSlideToHtml } from '@/lib/slideRenderer'

interface Props {
  slide: Slide
  theme: Theme
  slideRef?: React.RefObject<HTMLDivElement>
}

export default function SlideRenderer({ slide, theme, slideRef }: Props): React.ReactElement {
  const html = renderSlideToHtml(slide, theme)

  return (
    <div
      ref={slideRef}
      data-slide-id={slide.id}
      className="relative w-full h-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
