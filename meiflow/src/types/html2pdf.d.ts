declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number]
    filename?: string
    image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number }
    enableLinks?: boolean
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      logging?: boolean
      backgroundColor?: string
      [key: string]: unknown
    }
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in' | 'px'
      format?: string | [number, number]
      orientation?: 'portrait' | 'landscape'
      compress?: boolean
      [key: string]: unknown
    }
    pagebreak?: {
      mode?: string | string[]
      before?: string | string[]
      after?: string | string[]
      avoid?: string | string[]
    }
  }

  interface Html2PdfWorker {
    from(source: HTMLElement | string): Html2PdfWorker
    set(options: Html2PdfOptions): Html2PdfWorker
    save(): Promise<void>
    output(type: 'blob'): Promise<Blob>
    output(type: 'datauristring' | 'datauri'): Promise<string>
    output(type: 'arraybuffer'): Promise<ArrayBuffer>
    outputPdf(type?: 'blob' | 'datauristring' | 'arraybuffer'): Promise<Blob | string | ArrayBuffer>
    toPdf(): Html2PdfWorker
    then<T>(fn: (worker: Html2PdfWorker) => T): Promise<T>
  }

  function html2pdf(): Html2PdfWorker
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Html2PdfWorker

  export default html2pdf
}
