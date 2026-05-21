/**
 * Geração de PDF a partir de um elemento HTML.
 *
 * A biblioteca html2pdf.js é carregada via dynamic import — só baixa
 * quando o usuário realmente clica para exportar (não impacta o bundle inicial).
 *
 * O elemento renderizado vira imagem dentro do PDF (texto não é selecionável).
 * Visualmente fica fiel ao layout, com suporte a múltiplas páginas via pagebreak.
 */

const PAGE_FORMATS = {
  a4: { format: 'a4' as const, label: 'A4' },
  letter: { format: 'letter' as const, label: 'Carta' },
}

export type PageFormat = keyof typeof PAGE_FORMATS

export interface GeneratePdfOptions {
  element: HTMLElement
  filename: string
  format?: PageFormat
}

/** Gera um PDF e retorna o Blob. */
export async function generatePdfBlob({
  element,
  filename,
  format = 'a4',
}: GeneratePdfOptions): Promise<Blob> {
  const { default: html2pdf } = await import('html2pdf.js')

  const worker = html2pdf().from(element).set({
    margin: [12, 14, 12, 14], // mm — top, right, bottom, left
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

/** Faz download de um Blob com um nome de arquivo. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // dá tempo do navegador iniciar o download antes de revogar
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Tenta compartilhar o PDF via Web Share API. Retorna `false` se não suportado. */
export async function sharePdfBlob(blob: Blob, filename: string): Promise<boolean> {
  const file = new File([blob], filename, { type: 'application/pdf' })
  // navigator.canShare é a única forma confiável de checar suporte a files
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any
  if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return true
    } catch (e) {
      // usuário cancelou — não é erro
      return true
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
