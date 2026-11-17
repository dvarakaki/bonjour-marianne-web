import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import borboleta from '@/assets/jardim/borboleta.webp'
import guirlanda from '@/assets/jardim/guirlanda.webp'
import ursinhos from '@/assets/jardim/ursinhos.webp'

export const ARTE = { borboleta, guirlanda, ursinhos }

type Voo = {
  className: string
  tamanho: number
  /** deslocamentos (px) do passeio */
  x: number[]
  y: number[]
  duracao: number
  atraso: number
  giro?: number
}

/**
 * Borboleta que passeia em loop e bate as asas.
 * As asas "batem" encolhendo a imagem na horizontal (classe .asas no CSS).
 */
export function Borboleta({ voo, visivel = true }: { voo: Voo; visivel?: boolean }) {
  const reduzir = useReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className={cn('pointer-events-none absolute z-10', voo.className)}
      style={{ width: voo.tamanho }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={
        !visivel
          ? { opacity: 0 }
          : reduzir
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, scale: 1, x: voo.x, y: voo.y, rotate: [voo.giro ?? -8, (voo.giro ?? -8) + 14, voo.giro ?? -8] }
      }
      transition={
        reduzir
          ? { duration: 0.6, delay: voo.atraso }
          : {
              opacity: { duration: 0.8, delay: voo.atraso },
              scale: { duration: 0.8, delay: voo.atraso },
              x: { duration: voo.duracao, repeat: Infinity, ease: 'easeInOut', delay: voo.atraso },
              y: { duration: voo.duracao * 0.8, repeat: Infinity, ease: 'easeInOut', delay: voo.atraso },
              rotate: { duration: voo.duracao * 0.6, repeat: Infinity, ease: 'easeInOut', delay: voo.atraso },
            }
      }
    >
      <img src={borboleta} alt="" width={voo.tamanho} height={voo.tamanho} className="asas block h-auto w-full drop-shadow-[0_6px_8px_rgb(150_72_79/0.18)]" />
    </motion.div>
  )
}

export const VOOS: Record<'hero' | 'secao', Voo[]> = {
  hero: [
    { className: '-left-3 top-[34%] sm:-left-10', tamanho: 46, x: [0, 18, -6, 0], y: [0, -26, -10, 0], duracao: 7, atraso: 1.6, giro: -12 },
    { className: '-right-2 top-[58%] sm:-right-9', tamanho: 38, x: [0, -16, 8, 0], y: [0, -18, 6, 0], duracao: 8.5, atraso: 2.1, giro: 10 },
  ],
  secao: [{ className: 'right-2 -top-4 sm:right-[12%]', tamanho: 34, x: [0, -14, 6, 0], y: [0, -12, 4, 0], duracao: 7.5, atraso: 0.4, giro: 12 }],
}
