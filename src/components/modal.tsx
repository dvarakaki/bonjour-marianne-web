import type { ComponentType, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/use-browser'

export type TextoComp = ComponentType<{ className?: string; children?: ReactNode }>

/**
 * Janela no computador, gaveta que sobe de baixo no celular.
 * `children` recebe os componentes de título/descrição certos para cada caso (acessibilidade).
 */
export function ModalResponsivo({
  aberto,
  onFechar,
  children,
}: {
  aberto: boolean
  onFechar: () => void
  children: (t: { Titulo: TextoComp; Descricao: TextoComp }) => ReactNode
}) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const aoMudar = (o: boolean) => {
    if (!o) onFechar()
  }

  const corpo = (Titulo: TextoComp, Descricao: TextoComp) => (
    <div className="relative px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-8 sm:pb-8">
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar"
        className="absolute top-2 right-2 z-10 grid size-11 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:top-4 sm:right-4"
      >
        <X className="size-5" />
      </button>
      {children({ Titulo, Descricao })}
    </div>
  )

  if (desktop) {
    return (
      <Dialog open={aberto} onOpenChange={aoMudar}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[28px] border-border/70 bg-card p-0 shadow-card sm:max-w-[460px]"
        >
          {corpo(DialogTitle, DialogDescription)}
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={aberto} onOpenChange={aoMudar}>
      <DrawerContent className="max-h-[92dvh] rounded-t-[28px] border-border/70 bg-card">
        <div className="overflow-y-auto overscroll-contain">{corpo(DrawerTitle, DrawerDescription)}</div>
      </DrawerContent>
    </Drawer>
  )
}
