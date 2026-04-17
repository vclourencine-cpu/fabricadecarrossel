import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  // Verifica auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { tema } = await req.json()
  if (!tema) return NextResponse.json({ error: 'Campo tema é obrigatório' }, { status: 400 })

  const prompt = `Você é um especialista em marketing de conteúdo para Instagram. Crie o conteúdo para um carousel editorial de 10 slides sobre o tema: "${tema}".

Retorne EXATAMENTE no formato Markdown abaixo, sem adicionar nada antes ou depois:

# [Título do carousel — pergunta ou afirmação provocadora]

## Slide 1 — [Título gancho da capa — afirmação impactante]
keyword: [2-4 palavras em inglês para busca de foto cinematográfica dark]

## Slide 2 — [Título direto, afirmativo]
[2-3 frases curtas de alto impacto sobre o tema]
keyword: [palavras-chave em inglês, estilo dark moody]

## Slide 3 — [Título curto]
[2-3 frases]
keyword: [palavras-chave]

## Slide 4 — [Título direto]
[2-3 frases]
keyword: [palavras-chave]

## Slide 5 — [Título curto]
[2-3 frases]
keyword: [palavras-chave]

## Slide 6 — [Título curto]
[2-3 frases]
keyword: [palavras-chave]

## Slide 7 — [Título direto]
[2-3 frases]
keyword: [palavras-chave]

## Slide 8 — [Título direto]
[2-3 frases]
keyword: [palavras-chave]

## Slide 9 — [Título curto]
[2-3 frases]
keyword: [palavras-chave]
cta_seguir: true

## Slide 10 — [Título conclusivo, provocador]
[2-3 frases de encerramento impactantes]
keyword: [palavras-chave]
cta_texto: Me siga para mais conteúdos como esse!

Regras de escrita:
- Linguagem direta, sem rodeios, sem clichês
- Frases curtas, máximo 25 palavras por frase
- Tom autoritativo mas humano
- Foco em transformação e resultado prático
- Não use: "revolucionário", "incrível", "fantástico", "inacreditável"
- Retorne APENAS o Markdown, nada mais`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const markdown = (message.content[0] as { type: string; text: string }).text
    return NextResponse.json({ markdown })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na geração'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
