import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Music2 } from 'lucide-react'
import { alternar, assinar, estaTocando, TEM_MUSICA } from '@/lib/musica'
import { cn } from '@/lib/utils'

/* Botão flutuante da musiquinha (canto superior direito) */
export function BotaoMusica({ escondido }: { escondido?: boolean }) {
  const tocando = useSyncExternalStore(assinar, estaTocando, () => false)
  const reduzir = useReducedMotion()
  // dica "Tocar música" aparece por alguns segundos quando está parada
  const [dica, setDica] = useState(false)

  useEffect(() => {
    if (escondido || tocando) return
    const abre = setTimeout(() => setDica(true), 1200)
    const fecha = setTimeout(() => setDica(false), 8000)
    return () => {
      clearTimeout(abre)
      clearTimeout(fecha)
    }
  }, [escondido, tocando])

  return (
    <AnimatePresence>
      {TEM_MUSICA && !escondido && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.4 }}
          className="fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5"
        >
          <AnimatePresence>
            {dica && !tocando && (
              <motion.button
                type="button"
                onClick={alternar}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="cursor-pointer rounded-full bg-card/90 px-3.5 py-2 text-[13px] font-medium whitespace-nowrap text-rose-ink shadow-soft ring-1 ring-border/70 backdrop-blur-md"
                tabIndex={-1}
                aria-hidden="true"
              >
                Tocar musiquinha ♪
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={alternar}
            aria-pressed={tocando}
            aria-label={tocando ? 'Pausar música' : 'Tocar música'}
            title={tocando ? 'Pausar música' : 'Tocar música'}
            className={cn(
              'relative grid size-12 cursor-pointer place-items-center rounded-full shadow-[0_10px_24px_-12px_rgb(150_72_79/0.6)] ring-1 backdrop-blur-md transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60',
              tocando ? 'bg-primary text-primary-foreground ring-primary/40' : 'bg-card/90 text-rose-ink ring-border/80 hover:bg-blush-50',
            )}
          >
            {/* ondas suaves enquanto toca */}
            {tocando && !reduzir && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/25 [animation-duration:2.4s]" />
              </>
            )}
            {tocando ? <Equalizador animado={!reduzir} /> : <Music2 className="relative size-5" strokeWidth={1.8} aria-hidden="true" />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Equalizador({ animado }: { animado: boolean }) {
  const barras = [
    [0.45, 1, 0.6, 0.9, 0.45],
    [1, 0.5, 0.85, 0.4, 1],
    [0.6, 0.9, 0.4, 1, 0.6],
  ]
  return (
    <span aria-hidden="true" className="relative flex h-[18px] items-end gap-[3px]">
      {barras.map((alturas, i) => (
        <motion.span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-current"
          style={{ height: '100%' }}
          initial={{ scaleY: alturas[0] }}
          animate={animado ? { scaleY: alturas } : { scaleY: 0.7 }}
          transition={animado ? { duration: 1.6 + i * 0.25, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
      ))}
    </span>
  )
}
