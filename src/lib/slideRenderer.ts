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
    const containerStyle: Record<string, string> = {
      ...base,
      display: 'flex',
      alignItems: 'center',
    }
    const innerStyle: Record<string, string> = {
      width: '100%',
      fontFamily: el.fontFamily ?? 'Inter, sans-serif',
      fontSize: `${el.fontSize ?? 16}px`,
      fontWeight: el.fontWeight ?? '400',
      fontStyle: el.fontStyle ?? 'normal',
      color: el.color ?? '#1A1A1A',
      textAlign: el.textAlign ?? 'left',
      lineHeight: String(el.lineHeight ?? 1.4),
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }
    return `<div data-id="${el.id}" style="${toInlineStyle(containerStyle)}"><span style="${toInlineStyle(innerStyle)}">${escapeHtml(el.content ?? '')}</span></div>`
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

export function renderProjectToExportHtml(project: Project, slideSize: '16:9' | '4:3' = '16:9'): string {
  // ratio helpers: how many vh = 100vw, and vice versa
  const [ratioW, ratioH] = slideSize === '4:3' ? [4, 3] : [16, 9]
  const wToH = (ratioH / ratioW * 100).toFixed(4)   // e.g. 56.25 for 16:9
  const hToW = (ratioW / ratioH * 100).toFixed(4)   // e.g. 177.78 for 16:9

  const slides = project.slides
    .map((slide, i) => {
      const inner = renderSlideToHtml(slide, project.theme)
      return `<div class="slide" id="slide-${i}" style="display:${i === 0 ? 'flex' : 'none'};width:100vw;height:100vh;align-items:center;justify-content:center;background:#000;view-transition-name:slide;">\n  <div style="position:relative;width:min(100vw,${hToW}vh);height:min(${wToH}vw,100vh);">${inner}</div>\n</div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(project.name)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000;overflow:hidden}
::view-transition-old(slide),::view-transition-new(slide){animation-duration:0.35s}
</style>
</head>
<body>
${slides}
<script>
  const slideEls = document.querySelectorAll('.slide');
  const clamp = n => Math.max(0, Math.min(n, slideEls.length - 1));
  const parseHash = () => {
    const m = location.hash.match(/#\\/(\\d+)/);
    return m ? clamp(parseInt(m[1], 10)) : 0;
  };

  let cur = parseHash();
  slideEls.forEach((el, i) => { el.style.display = i === cur ? 'flex' : 'none'; });
  if (!location.hash) history.replaceState(null, '', '#/' + cur);

  function render(next) {
    const apply = () => {
      slideEls[cur].style.display = 'none';
      cur = next;
      slideEls[cur].style.display = 'flex';
    };
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
  }

  function go(n) {
    const next = clamp(n);
    if (next === cur) return;
    location.hash = '#/' + next;
  }

  window.addEventListener('hashchange', () => {
    const next = parseHash();
    if (next !== cur) render(next);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(cur - 1);
  });
  document.addEventListener('click', () => go(cur + 1));
<\/script>
</body>
</html>`
}

// Print-optimised version: all slides visible, one per CSS page. Used for PDF export.
export function renderProjectToPrintHtml(project: Project, slideSize: '16:9' | '4:3' = '16:9'): string {
  const [w, h] = slideSize === '4:3' ? [1280, 960] : [1280, 720]

  const slides = project.slides
    .map((slide) => {
      const inner = renderSlideToHtml(slide, project.theme)
      return `<div class="slide">${inner}</div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:${w}px ${h}px;margin:0}
html,body{width:${w}px;background:#000}
.slide{width:${w}px;height:${h}px;position:relative;overflow:hidden;page-break-after:always}
.slide:last-child{page-break-after:avoid}
</style>
</head>
<body>${slides}</body>
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
