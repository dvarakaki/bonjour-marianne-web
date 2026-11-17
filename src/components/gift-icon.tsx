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
   Paleta: cada categoria tem um tom pastel suave (fundo, borda e tinta)
   ------------------------------------------------------------------ */
type Tom = { fundo: string; anel: string; tinta: string; chip: string }

const TONS = {
  rosa: {
    fundo: 'bg-[linear-gradient(145deg,#fff5f7_0%,#fbe1e7_100%)]',
    anel: 'ring-[#f2cbd5]',
    tinta: 'text-[#a8455d]',
    chip: 'bg-[#f9e3e0] text-[#a8455d]',
  },
  pessego: {
    fundo: 'bg-[linear-gradient(145deg,#fff7f1_0%,#fbe3d3_100%)]',
    anel: 'ring-[#f2d2bd]',
    tinta: 'text-[#a25a3c]',
    chip: 'bg-[#fcebdf] text-[#a25a3c]',
  },
  lavanda: {
    fundo: 'bg-[linear-gradient(145deg,#faf7fd_0%,#ebe2f5_100%)]',
    anel: 'ring-[#ddd0ee]',
    tinta: 'text-[#6c5190]',
    chip: 'bg-[#efe7f6] text-[#6c5190]',
  },
  salvia: {
    fundo: 'bg-[linear-gradient(145deg,#f6faf6_0%,#deece1_100%)]',
    anel: 'ring-[#cde0d1]',
    tinta: 'text-[#4b7455]',
    chip: 'bg-[#e6f0e8] text-[#4b7455]',
  },
  dourado: {
    fundo: 'bg-[linear-gradient(145deg,#fefaf1_0%,#f3e6c8_100%)]',
    anel: 'ring-[#ead8b0]',
    tinta: 'text-[#87672f]',
    chip: 'bg-[#f6ecd9] text-[#87672f]',
  },
  ceu: {
    fundo: 'bg-[linear-gradient(145deg,#f6fafd_0%,#dce9f3_100%)]',
    anel: 'ring-[#cadced]',
    tinta: 'text-[#4a6d89]',
    chip: 'bg-[#e6eff6] text-[#4a6d89]',
  },
} satisfies Record<string, Tom>

export const CATEGORIA_VISUAL: Record<Categoria, { Icone: LucideIcon; tom: Tom }> = {
  Roupas: { Icone: Shirt, tom: TONS.rosa },
  Acessórios: { Icone: Ribbon, tom: TONS.lavanda },
  'Fraldas e troca': { Icone: Baby, tom: TONS.pessego },
  Banho: { Icone: Bath, tom: TONS.ceu },
  Higiene: { Icone: Droplets, tom: TONS.salvia },
  Saúde: { Icone: HeartPulse, tom: TONS.rosa },
  'Alimentação e amamentação': { Icone: Milk, tom: TONS.dourado },
  Sono: { Icone: MoonStar, tom: TONS.lavanda },
  Quarto: { Icone: Lamp, tom: TONS.pessego },
  Passeio: { Icone: Footprints, tom: TONS.salvia },
  Maternidade: { Icone: Luggage, tom: TONS.dourado },
  'Brinquedos e livros': { Icone: Blocks, tom: TONS.ceu },
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
   Selo do ícone
   ------------------------------------------------------------------ */
const TAMANHOS = {
  sm: { caixa: 'size-9 rounded-[12px]', icone: 'size-[18px]' },
  md: { caixa: 'size-14 rounded-[18px]', icone: 'size-[26px]' },
  lg: { caixa: 'size-20 rounded-[26px]', icone: 'size-9' },
}

export function SeloIcone({
  Icone,
  tom,
  tamanho = 'md',
  apagado,
  animado,
  className,
}: {
  Icone: LucideIcon
  tom: Tom
  tamanho?: keyof typeof TAMANHOS
  apagado?: boolean
  animado?: boolean
  className?: string
}) {
  const t = TAMANHOS[tamanho]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid shrink-0 place-items-center ring-1 ring-inset transition-transform duration-300',
        t.caixa,
        apagado ? 'bg-muted text-muted-foreground/70 ring-border' : [tom.fundo, tom.anel, tom.tinta],
        animado && !apagado && 'group-hover:-rotate-3 group-hover:scale-105',
        className,
      )}
    >
      {/* brilho suave no canto, como papel acetinado */}
      {!apagado && (
        <span className="pointer-events-none absolute inset-x-[18%] top-[9%] h-[28%] rounded-full bg-white/55 blur-[3px]" />
      )}
      <Icone className={cn('relative', t.icone)} strokeWidth={1.6} />
    </span>
  )
}
