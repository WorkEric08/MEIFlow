/**
 * Geração de PDF a partir de um elemento HTML.
 *
 * As libs html2pdf.js / html2canvas são carregadas via dynamic import
 * (só baixam quando o usuário clica para exportar — não impactam o bundle inicial).
 *
 * O elemento renderizado vira imagem dentro do PDF (texto não é selecionável).
 * Visualmente fica fiel ao layout, com suporte a múltiplas páginas.
 */

const PAGE_FORMATS = {
  a4: { format: 'a4' as const, label: 'A4', aspectRatio: 297 / 210 },
  letter: { format: 'letter' as const, label: 'Carta', aspectRatio: 11 / 8.5 },
}

export type PageFormat = keyof typeof PAGE_FORMATS

export interface GeneratePdfOptions {
  element: HTMLElement
  filename: string
  format?: PageFormat
}

/** Gera um PDF (Blob) a partir do elemento. */
export async function generatePdfBlob({
  element,
  filename,
  format = 'a4',
}: GeneratePdfOptions): Promise<Blob> {
  const { default: html2pdf } = await import('html2pdf.js')

  const worker = html2pdf().from(element).set({
    margin: [12, 14, 12, 14],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    enableLinks: true,
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: PAGE_FORMATS[format].format,
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: { mode: ['css', 'legacy'] },
  })

  const blob = await worker.output('blob')
  return blob as Blob
}

/**
 * Renderiza o elemento como canvas e divide em "páginas" no formato A4 (data URLs).
 * Usado pela tela de preview pra mostrar folhas brancas estilo PDF — funciona
 * em qualquer plataforma (incluindo Android, onde iframe de PDF não renderiza).
 */
export async function renderPagesAsImages(
  element: HTMLElement,
  format: PageFormat = 'a4',
): Promise<string[]> {
  const { default: html2canvas } = await import('html2canvas')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const pageWidth = canvas.width
  const pageHeight = Math.round(pageWidth * PAGE_FORMATS[format].aspectRatio)

  const pages: string[] = []

  // Conteúdo cabe numa página só — completa com fundo branco até A4
  if (canvas.height <= pageHeight) {
    const padded = document.createElement('canvas')
    padded.width = pageWidth
    padded.height = pageHeight
    const ctx = padded.getContext('2d')
    if (!ctx) throw new Error('Canvas 2d context indisponível')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageWidth, pageHeight)
    ctx.drawImage(canvas, 0, 0)
    pages.push(padded.toDataURL('image/jpeg', 0.92))
    return pages
  }

  // Múltiplas páginas — recorta a cada altura de A4
  let yOffset = 0
  while (yOffset < canvas.height) {
    const chunk = document.createElement('canvas')
    chunk.width = pageWidth
    chunk.height = pageHeight
    const ctx = chunk.getContext('2d')
    if (!ctx) throw new Error('Canvas 2d context indisponível')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageWidth, pageHeight)
    ctx.drawImage(canvas, 0, -yOffset)
    pages.push(chunk.toDataURL('image/jpeg', 0.92))
    yOffset += pageHeight
  }

  return pages
}

/** Faz download de um Blob com um nome de arquivo. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Tenta compartilhar o PDF via Web Share API. Retorna `false` se não suportado. */
export async function sharePdfBlob(blob: Blob, filename: string): Promise<boolean> {
  const file = new File([blob], filename, { type: 'application/pdf' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any
  if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return true
    } catch {
      return true // usuário cancelou — não é erro
    }
  }
  return false
}

/** Sanitiza um título para usar como filename. */
export function slugifyForFilename(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'documento'
}
