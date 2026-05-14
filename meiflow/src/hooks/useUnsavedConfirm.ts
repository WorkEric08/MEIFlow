import { useState, useCallback } from 'react'
import { createElement } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'

export function useUnsavedConfirm(isDirty: boolean, onClose: () => void) {
  const [open, setOpen] = useState(false)

  const handleClose = useCallback(() => {
    if (!isDirty) {
      onClose()
      return
    }
    setOpen(true)
  }, [isDirty, onClose])

  const dialog = createElement(ConfirmModal, {
    open,
    title: 'Alterações não salvas',
    description: 'Você tem alterações não salvas neste formulário. Se fechar agora, as alterações serão perdidas.',
    confirmLabel: 'Descartar alterações',
    cancelLabel: 'Continuar editando',
    onConfirm: () => { setOpen(false); onClose() },
    onCancel: () => setOpen(false),
  })

  return { handleClose, dialog }
}
