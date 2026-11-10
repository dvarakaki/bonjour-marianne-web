import type { ComponentType, ReactNode } from 'react'
import { CalendarHeart, CalendarPlus, Copy, Download, Gift, MapPin, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { baixarIcs, DATA_EXTENSO, googleAgendaUrl, HORARIO, MAPS_EMBED, MAPS_URL, WAZE_URL } from '@/lib/evento'
import { cn } from '@/lib/utils'
import { Revelar, TituloSecao } from './primitives'

function CartaoInfo({
  icone: Icone,
  titulo,
  children,
  className,
  atraso,
}: {
  icone: ComponentType<{ className?: string; strokeWidth?: number }>
  titulo: string
  children: ReactNode
  className?: string
  atraso?: number
}) {
  return (
    <Revelar
      atraso={atraso}
      className={cn('rounded-[28px] border border-border/80 bg-card/90 p-6 shadow-soft backdrop-blur-sm sm:p-7', className)}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-blush-100 text-primary">
          <Icone className="size-5" strokeWidth={1.75} />
        </span>
        <h3 className="text-xs font-medium tracking-[0.26em] text-muted-foreground uppercase">{titulo}</h3>
      </div>
      {children}
    </Revelar>
  )
}

export function Detalhes() {
  async function copiarEndereco() {
    try {
      await navigator.clipboard.writeText(`${CONFIG.local.nome} — ${CONFIG.local.endereco}`)
      toast.success('Endereço copiado')
    } catch {
      toast.error('Não foi possível copiar o endereço')
    }
  }

  return (
    <section id="detalhes" aria-labelledby="titulo-detalhes" className="scroll-mt-6 px-4 py-14 sm:py-20">
      <TituloSecao
        id="titulo-detalhes"
        sobretitulo="Informações"
        titulo={
          <>
            Detalhes do <span className="font-script text-[1.3em] leading-none font-normal text-primary">chá</span>
          </>
        }
        subtitulo="Tudo o que você precisa saber para celebrar com a gente."
      />

      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 md:gap-5">
        <CartaoInfo icone={CalendarHeart} titulo="Quando">
          <p className="font-serif text-[28px] leading-tight font-medium">{DATA_EXTENSO}</p>
          <p className="mt-1 text-[17px] text-muted-foreground">{HORARIO}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" asChild>
              <a href={googleAgendaUrl()} target="_blank" rel="noopener noreferrer">
                <CalendarPlus />
                Google Agenda
              </a>
            </Button>
            <Button variant="outline" onClick={baixarIcs}>
              <Download />
              iPhone / Outlook
            </Button>
          </div>
        </CartaoInfo>

        <CartaoInfo icone={MapPin} titulo="Onde" className="md:row-span-2" atraso={0.08}>
          <p className="font-serif text-[28px] leading-tight font-medium">{CONFIG.local.nome}</p>
          <p className="mt-1 text-[17px] text-muted-foreground">{CONFIG.local.endereco}</p>
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-border/80 bg-muted">
            <iframe
              title={`Mapa do local: ${CONFIG.local.nome}`}
              src={MAPS_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/3] w-full saturate-[.8] md:aspect-auto md:h-72"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                <MapPin />
                Google Maps
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={WAZE_URL} target="_blank" rel="noopener noreferrer">
                <Navigation />
                Waze
              </a>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={copiarEndereco}>
            <Copy />
            Copiar endereço
          </Button>
        </CartaoInfo>

        <CartaoInfo icone={Gift} titulo="Sugestão de mimo" atraso={0.12}>
          <p className="font-serif text-[24px] leading-snug">{CONFIG.presente.texto}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {CONFIG.presente.itens.map((i) => (
              <li key={i} className="rounded-full bg-blush-50 px-3.5 py-1.5 text-sm text-rose-ink ring-1 ring-blush-100">
                {i}
              </li>
            ))}
          </ul>
        </CartaoInfo>
      </div>
    </section>
  )
}
