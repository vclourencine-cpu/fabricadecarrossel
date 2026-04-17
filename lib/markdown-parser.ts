/**
 * Parser de Markdown para slides do Carousel Editorial
 *
 * Formato esperado:
 * ─────────────────────────────────
 * # Título do Carousel (linha obrigatória)
 *
 * ## Slide 1 — Título do slide (capa)
 * keyword: professional dark office moody
 *
 * ## Slide 2 — Título do slide (conteudo_grande)
 * Texto do corpo do slide aqui...
 * keyword: person alone cafe thinking
 *
 * ## Slide 10 — Título final (cta_final)
 * Texto do corpo.
 * keyword: tunnel light
 * cta_texto: Me siga para mais conteúdos!
 * ─────────────────────────────────
 *
 * Regras de tipo automático baseado no número do slide:
 * Slide 1 → capa
 * Slides 2, 4, 7, 8 → conteudo_grande
 * Slides 3, 5, 6, 9 → conteudo_padrao
 * Slide 10 → cta_final
 */

import type { SlideConfig } from '@/types'

const TIPO_POR_NUMERO: Record<number, SlideConfig['tipo']> = {
  1: 'capa',
  2: 'conteudo_grande',
  3: 'conteudo_padrao',
  4: 'conteudo_grande',
  5: 'conteudo_padrao',
  6: 'conteudo_padrao',
  7: 'conteudo_grande',
  8: 'conteudo_grande',
  9: 'conteudo_padrao',
  10: 'cta_final',
}

export interface ParseResult {
  titulo_carousel: string
  slides: SlideConfig[]
  errors: string[]
}

export function parseMarkdownCarousel(md: string): ParseResult {
  const lines = md.split('\n')
  const errors: string[] = []
  let titulo_carousel = 'Sem título'
  const slides: SlideConfig[] = []

  let currentSlide: Partial<SlideConfig> | null = null
  let bodyLines: string[] = []
  let slideNumber = 0

  function flushSlide() {
    if (!currentSlide) return
    const corpo = bodyLines
      .filter(l => !l.startsWith('keyword:') && !l.startsWith('cta_texto:') && !l.startsWith('cta_seguir:'))
      .join(' ')
      .trim()
    if (corpo) currentSlide.corpo = corpo
    slides.push(currentSlide as SlideConfig)
    currentSlide = null
    bodyLines = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Título do carousel
    if (line.startsWith('# ') && slides.length === 0 && !currentSlide) {
      titulo_carousel = line.slice(2).trim()
      continue
    }

    // Novo slide: ## Slide N — Título
    if (line.startsWith('## ')) {
      flushSlide()

      const rest = line.slice(3).trim()
      const match = rest.match(/^(?:Slide\s+)?(\d+)\s*[—–-]\s*(.+)$/i)

      if (match) {
        slideNumber = parseInt(match[1])
        const titulo = match[2].trim()
        const tipo = TIPO_POR_NUMERO[slideNumber] || 'conteudo_padrao'
        currentSlide = { tipo, titulo }
      } else {
        // Sem número: incrementa automaticamente
        slideNumber++
        const tipo = TIPO_POR_NUMERO[slideNumber] || 'conteudo_padrao'
        currentSlide = { tipo, titulo: rest }
      }
      continue
    }

    if (!currentSlide) continue

    // Metadados do slide
    if (line.startsWith('keyword:')) {
      currentSlide.imagem_keyword = line.slice(8).trim()
    } else if (line.startsWith('cta_texto:')) {
      currentSlide.cta_texto = line.slice(10).trim()
    } else if (line.startsWith('cta_seguir:')) {
      currentSlide.cta_seguir = line.slice(11).trim() === 'true'
    } else if (line !== '') {
      bodyLines.push(line)
    }
  }
  flushSlide()

  if (slides.length === 0) {
    errors.push('Nenhum slide encontrado. Use ## Slide 1 — Título para definir slides.')
  }

  return { titulo_carousel, slides, errors }
}

// ── Template de exemplo ────────────────────────────────────────────
export const MARKDOWN_EXEMPLO = `# Como Fazer um Site Bonito com IA?

## Slide 1 — Como profissionais comuns estão ficando obsoletos em silêncio
keyword: professional dark office moody

## Slide 2 — A obsolescência não faz barulho.
Ela não chega com aviso. Não manda notificação. Ela só aparece quando alguém entrega o dobro, na metade do tempo, cobrando menos.
keyword: person alone cafe thinking moody

## Slide 3 — Não é humano vs máquina.
É humano com IA vs humano sem IA. Enquanto um leva 4 horas para estruturar algo, o outro testa 10 variações em 40 minutos.
keyword: technology human hands dark

## Slide 4 — O mercado não recompensa esforço.
Ele recompensa eficiência. Quem usa IA escreve mais rápido, analisa dados melhor e aprende em ciclos acelerados.
keyword: business meeting dark office professional

## Slide 5 — A assimetria já começou.
Alguns profissionais já operam com 5x mais capacidade criativa. Eles não são gênios. Só entenderam que IA é multiplicador cognitivo.
keyword: asymmetry dark contrast light shadow

## Slide 6 — 2027 não é previsão.
É projeção lógica. Toda revolução tecnológica cria dois grupos: os que aprendem cedo e capturam margem... e os que resistem.
keyword: futuristic city night dark neon

## Slide 7 — A nova alfabetização é digital-inteligente.
Não basta saber usar Instagram, Excel ou editar vídeo. Saber conversar com IA e estruturar prompts será o novo básico.
keyword: person studying computer dark room

## Slide 8 — A competição será invisivelmente injusta.
Você vai disputar cliente com alguém que automatiza tarefas, analisa comportamento em segundos e toma decisões baseadas em simulação.
keyword: chess strategy dark dramatic lighting

## Slide 9 — O perigo não é ser substituído.
É ser ultrapassado. Lentamente. Sem perceber. Até que sua entrega pareça antiquada — mesmo sendo tecnicamente boa.
keyword: running race competition dark stadium
cta_seguir: true

## Slide 10 — A pergunta não é se você vai usar IA.
É quando. Porque até 2027, quem não souber usar IA vai competir com quem usa. E competir em desvantagem não é estratégia.
keyword: person walking dark tunnel light end
cta_texto: Me siga para mais conteúdos como esse!
`
