import { motion } from 'motion/react'
import { Gift, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_OUT } from './primitives'

export function SeloConfirmado({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      className={cn('grid size-24 place-items-center rounded-full bg-success-soft text-success ring-[10px] ring-success-soft/50', className)}
    >
      <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}

export function SeloCoracao({ presente = false }: { presente?: boolean }) {
  const Icone = presente ? Gift : Heart
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.12, 1], opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="grid size-24 place-items-center rounded-full bg-blush-100 text-primary ring-[10px] ring-blush-50"
    >
      <Icone className={cn('size-11', !presente && 'fill-current')} strokeWidth={presente ? 1.5 : 2} aria-hidden="true" />
    </motion.div>
  )
}

const CORACAO = 'M12 21s-7.5-4.6-9.6-9.3C.8 8 3 4 6.8 4c2.2 0 3.7 1.2 5.2 3 1.5-1.8 3-3 5.2-3C21 4 23.2 8 21.6 11.7 19.5 16.4 12 21 12 21z'

export async function soltarConfete(intensidade: 'grande' | 'pequena' = 'grande') {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { default: confetti } = await import('canvas-confetti')
  const coracao = confetti.shapeFromPath({ path: CORACAO })
  const base = {
    colors: ['#e08a9e', '#efb0be', '#b44d64', '#d9b77a', '#f6d0d8'],
    zIndex: 200,
    disableForReducedMotion: true,
  }
  if (intensidade === 'pequena') {
    confetti({ ...base, particleCount: 50, spread: 70, startVelocity: 35, origin: { y: 0.75 }, shapes: [coracao, 'circle'], scalar: 1.1 })
    return
  }
  confetti({ ...base, particleCount: 80, spread: 80, startVelocity: 45, origin: { y: 0.7 }, shapes: [coracao, 'circle'], scalar: 1.2 })
  setTimeout(() => confetti({ ...base, particleCount: 45, angle: 60, spread: 65, origin: { x: 0, y: 0.85 }, shapes: [coracao] }), 200)
  setTimeout(() => confetti({ ...base, particleCount: 45, angle: 120, spread: 65, origin: { x: 1, y: 0.85 }, shapes: [coracao] }), 350)
}
