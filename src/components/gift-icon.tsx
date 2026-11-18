import {
  AudioWaveform,
  Baby,
  Bandage,
  Bath,
  BedSingle,
  Bell,
  Blocks,
  BookOpen,
  Brush,
  Bubbles,
  Cloud,
  Droplet,
  Droplets,
  Feather,
  Flame,
  Flower,
  Flower2,
  Footprints,
  Gift,
  Hand,
  HandHeart,
  Handbag,
  Heart,
  HeartPulse,
  Lamp,
  Layers,
  Leaf,
  Luggage,
  Milk,
  MoonStar,
  PawPrint,
  Ribbon,
  Scissors,
  Shirt,
  Smile,
  Sparkles,
  SprayCan,
  Star,
  Thermometer,
  Trash2,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { Categoria } from '@/data/presentes'
import { normalizar } from '@/lib/texto'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------
   Fotos dos produtos: src/assets/presentes/<id>.webp (quadradas, 512px).
   Item sem foto ganha uma ilustração com o ícone em dois tons.
   ------------------------------------------------------------------ */
const FOTOS = import.meta.glob<string>('../assets/presentes/*.webp', { eager: true, import: 'default' })

export function fotoDoItem(id: string): string | undefined {
  return FOTOS[`../assets/presentes/${id}.webp`]
}

/* ------------------------------------------------------------------
   Paleta: cada categoria tem um tom pastel (aquarela, tinta e pontinhos)
   ------------------------------------------------------------------ */
export type Tom = { fundo: string; tinta: string; ponto: string; chip: string }

const TONS = {
  rosa: {
    fundo: 'bg-[radial-gradient(120%_90%_at_30%_15%,#fffafa_0%,#fbe4e8_55%,#f4d0d8_100%)]',
    tinta: 'text-[#b04f66]',
    ponto: '#e9b9c4',
    chip: 'bg-[#fbe7ea] text-[#a8455d]',
  },
  pessego: {
    fundo: 'bg-[radial-gradient(120%_90%_at_30%_15%,#fffbf7_0%,#fce8da_55%,#f6d4bd_100%)]',
    tinta: 'text-[#b0643f]',
    ponto: '#efc4a6',
    chip: 'bg-[#fcebdf] text-[#a25a3c]',
  },
  lavanda: {
    fundo: 'bg-[radial-gradient(120%_90%_at_30%_15%,#fdfbff_0%,#eee6f8_55%,#ddd0ef_100%)]',
    tinta: 'text-[#7458a0]',
    ponto: '#cfbfe6',
    chip: 'bg-[#efe7f6] text-[#6c5190]',
  },
  salvia: {
    fundo: 'bg-[radial-gradient(120%_90%_at_30%_15%,#fbfdfa_0%,#e4efe5_55%,#cfe2d3_100%)]',
    tinta: 'text-[#4f7d5b]',
    ponto: '#b9d3bf',
    chip: 'bg-[#e6f0e8] text-[#4b7455]',
  },
  dourado: {
    fundo: 'bg-[radial-gradient(120%_90%_at_30%_15%,#fffdf8_0%,#f6ebd2_55%,#ecdab3_100%)]',
    tinta: 'text-[#94712f]',
    ponto: '#e2cb9a',
    chip: 'bg-[#f6ecd9] text-[#87672f]',
  },
  ceu: {
    fundo: 'bg-[radial-gradient(120%_90%_at_30%_15%,#fbfdff_0%,#e3eef7_55%,#cddff0_100%)]',
    tinta: 'text-[#4d7598]',
    ponto: '#b8cfe5',
    chip: 'bg-[#e6eff6] text-[#4a6d89]',
  },
} satisfies Record<string, Tom>

export const CATEGORIA_VISUAL: Record<Categoria, { Icone: LucideIcon; tom: Tom; curto: string }> = {
  Roupas: { Icone: Shirt, tom: TONS.rosa, curto: 'Roupas' },
  Acessórios: { Icone: Ribbon, tom: TONS.lavanda, curto: 'Acessórios' },
  'Fraldas e troca': { Icone: Baby, tom: TONS.pessego, curto: 'Troca' },
  Banho: { Icone: Bath, tom: TONS.ceu, curto: 'Banho' },
  Higiene: { Icone: Droplets, tom: TONS.salvia, curto: 'Higiene' },
  Saúde: { Icone: HeartPulse, tom: TONS.rosa, curto: 'Saúde' },
  'Alimentação e amamentação': { Icone: Milk, tom: TONS.dourado, curto: 'Alimentação' },
  Sono: { Icone: MoonStar, tom: TONS.lavanda, curto: 'Sono' },
  Quarto: { Icone: Lamp, tom: TONS.pessego, curto: 'Quarto' },
  Passeio: { Icone: Footprints, tom: TONS.salvia, curto: 'Passeio' },
  Maternidade: { Icone: Luggage, tom: TONS.dourado, curto: 'Maternidade' },
  'Brinquedos e livros': { Icone: Blocks, tom: TONS.ceu, curto: 'Brinquedos' },
}

export const TOM_FRALDAS = TONS.pessego

/* ------------------------------------------------------------------
   Ícone de cada item: a primeira regra que bate com o nome vence;
   sem regra, usa o ícone da categoria.
   ------------------------------------------------------------------ */
const REGRAS: [RegExp, LucideIcon][] = [
  [/pijama/, MoonStar],
  [/body|macacao|conjunto|casaco/, Shirt],
  [/saida de maternidade/, Sparkles],
  [/lac(o|inho)|tiara|acessorios/, Ribbon],
  [/luv(a|inha)/, Hand],
  [/meia|sapatinho/, Footprints],
  [/fralda de (boca|ombro)|multiuso|de pano|fralda maior|capa extra/, Layers],
  [/aquecedor|bolsa termica/, Flame],
  [/limpa-chupeta|lencos umedecidos/, Wind],
  [/lixeira/, Trash2],
  [/termometro/, Thermometer],
  [/toalha/, Waves],
  [/banheira/, Bath],
  [/escova/, Brush],
  [/lixa|tesour|cortador/, Scissors],
  [/pomada|cicatrizante/, Bandage],
  [/alcool/, SprayCan],
  [/sabao|sabonete|gel lavante/, Bubbles],
  [/shampoo|locao|hidratante|higiene/, Droplets],
  [/aspirador nasal/, Wind],
  [/oleo/, Leaf],
  [/bomba|extratora/, Droplet],
  [/mamadeira/, Milk],
  [/chupeta/, Smile],
  [/ruido branco/, AudioWaveform],
  [/travesseiro/, Cloud],
  [/cueiro|swaddle|mant(a|inha)|cobert/, Feather],
  [/colchao|lencol|berco/, BedSingle],
  [/mobile/, Star],
  [/almofada de flor/, Flower2],
  [/almofada redonda/, Flower],
  [/ursinho/, PawPrint],
  [/almofada/, Heart],
  [/sling|canguru/, HandHeart],
  [/bolsa de maternidade/, Handbag],
  [/mala/, Luggage],
  [/livr/, BookOpen],
  [/mordedor/, Smile],
  [/chocalho/, Bell],
  [/brinquedo/, Blocks],
]

export function iconeDoItem(nome: string, cat?: Categoria): LucideIcon {
  const n = normalizar(nome)
  return REGRAS.find(([re]) => re.test(n))?.[1] ?? (cat ? CATEGORIA_VISUAL[cat].Icone : Gift)
}

/* ------------------------------------------------------------------
   Miniatura: foto do produto ou ilustração em aquarela com ícone duotone.
   Ocupa 100% da caixa que a envolve (o tamanho vem de fora).
   ------------------------------------------------------------------ */
export function Miniatura({
  foto,
  Icone,
  tom,
  apagado,
  zoom,
  carregarJa,
  className,
}: {
  foto?: string
  Icone: LucideIcon
  tom: Tom
  /** item já garantido: dessaturado */
  apagado?: boolean
  /** aproxima a foto quando o cartão (group) recebe hover */
  zoom?: boolean
  /** imagem acima da dobra / dentro de janela: sem lazy */
  carregarJa?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative isolate overflow-hidden bg-muted',
        apagado && 'opacity-60 grayscale-[0.85]',
        'transition-[filter,opacity] duration-300',
        className,
      )}
    >
      {foto ? (
        <>
          <img
            src={foto}
            alt=""
            width={512}
            height={512}
            loading={carregarJa ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
              zoom && 'group-hover:scale-[1.06]',
            )}
          />
          {/* vinheta suave para integrar a foto ao papel */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(79_58_49/0.06),inset_0_-30px_40px_-30px_rgb(79_58_49/0.18)]" />
        </>
      ) : (
        <div className={cn('grid size-full place-items-center', tom.fundo, tom.tinta)}>
          <div
            className="absolute inset-0 opacity-70 [mask-image:radial-gradient(closest-side,transparent_35%,#000)]"
            style={{ backgroundImage: `radial-gradient(${tom.ponto} 1.1px, transparent 1.7px)`, backgroundSize: '11px 11px' }}
          />
          <div className="absolute top-[12%] left-[14%] h-[30%] w-[44%] rounded-full bg-white/60 blur-xl" />
          <Icone
            className={cn(
              'relative h-auto w-[44%] drop-shadow-[0_6px_10px_rgb(120_70_60/0.12)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              zoom && 'group-hover:scale-110 group-hover:-rotate-6',
            )}
            strokeWidth={1.1}
            fill="currentColor"
            fillOpacity={0.16}
          />
        </div>
      )}
    </div>
  )
}

/** Selinho redondo com o ícone da categoria (chips e títulos) */
export function SeloCategoria({ cat, className }: { cat: Categoria; className?: string }) {
  const { Icone, tom } = CATEGORIA_VISUAL[cat]
  return (
    <span aria-hidden="true" className={cn('grid size-9 shrink-0 place-items-center rounded-full', tom.chip, className)}>
      <Icone className="size-[18px]" strokeWidth={1.6} fill="currentColor" fillOpacity={0.14} />
    </span>
  )
}
