import type { Project, Slide, SlideElement, Theme } from '@/types'

function elementToHtml(el: SlideElement): string {
  const base: Record<string, string> = {
    position: 'absolute',
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: `${el.width}%`,
    height: `${el.height}%`,
    opacity: String(el.opacity ?? 1),
    boxSizing: 'border-box',
  }

  if (el.type === 'text') {
    const style: Record<string, string> = {
      ...base,
      fontFamily: el.fontFamily ?? 'Inter, sans-serif',
      fontSize: `${el.fontSize ?? 16}px`,
      fontWeight: el.fontWeight ?? '400',
      fontStyle: el.fontStyle ?? 'normal',
      color: el.color ?? '#1A1A1A',
      textAlign: el.textAlign ?? 'left',
      lineHeight: String(el.lineHeight ?? 1.4),
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
    }
    return `<div data-id="${el.id}" style="${toInlineStyle(style)}">${escapeHtml(el.content ?? '')}</div>`
  }

  if (el.type === 'image') {
    const style: Record<string, string> = { ...base, overflow: 'hidden' }
    const imgStyle: Record<string, string> = {
      width: '100%',
      height: '100%',
      objectFit: el.objectFit ?? 'cover',
    }
    return `<div data-id="${el.id}" style="${toInlineStyle(style)}"><img src="${el.src ?? ''}" style="${toInlineStyle(imgStyle)}" /></div>`
  }

  if (el.type === 'shape') {
    const style: Record<string, string> = {
      ...base,
      background: el.fill ?? 'transparent',
      border: el.stroke ? `${el.strokeWidth ?? 1}px solid ${el.stroke}` : 'none',
      borderRadius: el.shapeType === 'circle' ? '50%' : `${el.borderRadius ?? 0}px`,
    }
    return `<div data-id="${el.id}" style="${toInlineStyle(style)}"></div>`
  }

  return ''
}

function toInlineStyle(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${camelToKebab(k)}:${v}`)
    .join(';')
}

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderSlideToHtml(slide: Slide, _theme: Theme): string {
  const elements = slide.elements.map(elementToHtml).join('\n')
  return `
    <div style="position:relative;width:100%;height:100%;background:${slide.background};overflow:hidden;">
      ${elements}
    </div>
  `.trim()
}

export function renderProjectToExportHtml(project: Project): string {
  const slides = project.slides
    .map((slide, i) => {
      const inner = renderSlideToHtml(slide, project.theme)
      return `<div class="slide" id="slide-${i}" style="display:${i === 0 ? 'flex' : 'none'};width:100vw;height:100vh;align-items:center;justify-content:center;background:#000;">\n  <div style="position:relative;width:min(100vw,177.78vh);height:min(56.25vw,100vh);">${inner}</div>\n</div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(project.name)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#000;overflow:hidden}</style>
</head>
<body>
${slides}
<script>
  let cur = 0;
  const slides = document.querySelectorAll('.slide');
  function go(n) {
    slides[cur].style.display = 'none';
    cur = Math.max(0, Math.min(n, slides.length - 1));
    slides[cur].style.display = 'flex';
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(cur - 1);
  });
  document.addEventListener('click', () => go(cur + 1));
<\/script>
</body>
</html>`
}

export function buildSlideContext(project: Project, activeSlideIndex: number): string {
  return JSON.stringify({
    activeSlideIndex,
    totalSlides: project.slides.length,
    theme: project.theme,
    activeSlide: project.slides[activeSlideIndex],
  }, null, 2)
}
