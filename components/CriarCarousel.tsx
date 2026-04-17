'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Sparkles, ArrowLeft, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { parseMarkdownCarousel, MARKDOWN_EXEMPLO } from '@/lib/markdown-parser'
import { gerarHtmlSlide } from '@/lib/generators/carousel-editorial'
import { buscarImagemBase64 } from '@/lib/images'
import type { Perfil, SlideConfig } from '@/types'
import Link from 'next/link'
import JSZip from 'jszip'
import { toPng } from 'html-to-image'

interface Props {
  perfis: Perfil[]
  perfilInicial: Perfil
  userId: string
}

const TIPO_LABEL: Record<string, string> = {
  capa: 'Capa',
  conteudo_grande: 'Conteúdo Grande',
  conteudo_padrao: 'Conteúdo Padrão',
  cta_final: 'CTA Final',
}

const TIPO_COR: Record<string, string> = {
  capa: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conteudo_grande: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  conteudo_padrao: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  cta_final: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

/** Renderiza HTML em iframe isolado e captura PNG via html-to-image */
async function renderSlideToDataUrl(html: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText =
      'position:fixed;left:-9999px;top:-9999px;width:1080px;height:1350px;border:none;overflow:hidden;'
    iframe.setAttribute('srcdoc', html)
    document.body.appendChild(iframe)

    iframe.onload = async () => {
      try {
        // Aguarda fontes e imagens carregarem
        await new Promise(r => setTimeout(r, 800))

        const doc = iframe.contentDocument
        const slideEl = doc?.body?.firstElementChild as HTMLElement | null
        if (!slideEl) throw new Error('Elemento slide não encontrado no iframe')

        const dataUrl = await toPng(slideEl, {
          width: 1080,
          height: 1350,
          pixelRatio: 1,
        })
        resolve(dataUrl)
      } catch (err) {
        reject(err)
      } finally {
        document.body.removeChild(iframe)
      }
    }

    iframe.onerror = () => {
      document.body.removeChild(iframe)
      reject(new Error('Erro ao carregar iframe'))
    }
  })
}

export function CriarCarousel({ perfis, perfilInicial, userId }: Props) {
  const supabase = createClient()

  const [perfil, setPerfil] = useState<Perfil>(perfilInicial)
  const [modo, setModo] = useState<'markdown' | 'ia'>('markdown')
  const [markdown, setMarkdown] = useState('')
  const [tema, setTema] = useState('')
  const [gerandoConteudo, setGerandoConteudo] = useState(false)

  const [slides, setSlides] = useState<SlideConfig[]>([])
  const [tituloCarousel, setTituloCarousel] = useState('')
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set([0]))

  const [gerando, setGerando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [projetoId, setProjetoId] = useState<string | null>(null)

  function toggleExpandido(i: number) {
    setExpandidos(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function aplicarMarkdown(md: string) {
    const result = parseMarkdownCarousel(md)
    setSlides(result.slides)
    setTituloCarousel(result.titulo_carousel)
    setParseErrors(result.errors)
    if (result.slides.length > 0) {
      toast.success(`${result.slides.length} slides detectados!`)
    }
  }

  async function gerarComIA() {
    if (!tema.trim()) { toast.error('Digite um tema'); return }
    setGerandoConteudo(true)
    try {
      const res = await fetch('/api/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMarkdown(data.markdown)
      aplicarMarkdown(data.markdown)
      setModo('markdown')
      toast.success('Conteúdo gerado com sucesso!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro'
      toast.error('Erro ao gerar: ' + message)
    } finally {
      setGerandoConteudo(false)
    }
  }

  function atualizarSlide(i: number, campo: keyof SlideConfig, valor: string | boolean) {
    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: valor } : s))
  }

  async function gerarPNGs() {
    if (slides.length === 0) { toast.error('Adicione os slides primeiro'); return }
    setGerando(true)
    setProgresso(0)
    setProjetoId(null)

    const zip = new JSZip()
    const pasta = zip.folder('carousel')!

    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]
        setProgresso(Math.round((i / slides.length) * 80))

        const keyword = slide.imagem_keyword || 'dark cinematic'
        const imgSrc = await buscarImagemBase64(
          keyword, 1080, 1350,
          perfil.unsplash_key, perfil.pexels_key
        )

        const html = gerarHtmlSlide(slide, {
          nome: perfil.nome,
          handle: perfil.handle,
          marca: perfil.marca,
          autor: perfil.autor,
          copyright: perfil.copyright,
          cor_cta: perfil.cor_cta,
          logo_url: perfil.logo_url,
          avatar_url: perfil.avatar_url,
        }, imgSrc)

        const dataUrl = await renderSlideToDataUrl(html)
        const base64Data = dataUrl.split(',')[1]
        pasta.file(`slide_${String(i + 1).padStart(2, '0')}.png`, base64Data, { base64: true })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao gerar slides: ' + message)
      setGerando(false)
      return
    }

    setProgresso(88)

    // Gera ZIP e faz download
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipUrl = URL.createObjectURL(zipBlob)

    setProgresso(92)

    // Salva projeto no Supabase
    const { data: projeto, error } = await supabase
      .from('projetos')
      .insert({
        user_id: userId,
        perfil_id: perfil.id,
        modelo: 'carousel-editorial',
        titulo: tituloCarousel || slides[0]?.titulo || 'Sem título',
        config_json: { titulo_carousel: tituloCarousel, slides },
        slides_urls: null,
        zip_url: null,
      })
      .select('id')
      .single()

    if (error) {
      toast.error('Projeto não salvo: ' + error.message)
    } else if (projeto) {
      setProjetoId(projeto.id)
    }

    setProgresso(100)

    const link = document.createElement('a')
    link.href = zipUrl
    link.download = `carousel_${Date.now()}.zip`
    link.click()

    toast.success(`${slides.length} slides gerados! ZIP baixando...`)
    setGerando(false)
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Novo Carousel Editorial</h1>
          <p className="text-zinc-400 text-sm">10 slides • 1080×1350px</p>
        </div>
        <select
          value={perfil.id}
          onChange={e => setPerfil(perfis.find(p => p.id === e.target.value)!)}
          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {perfis.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      {/* Perfil ativo */}
      <Card className="border-zinc-800 bg-zinc-900/50 mb-6">
        <CardContent className="p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: perfil.cor_cta }}
          >
            {perfil.avatar_url
              ? <img src={perfil.avatar_url} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
              : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: perfil.cor_cta + '22', color: perfil.cor_cta }}>{perfil.nome[0]}</div>
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{perfil.nome}</p>
            <p className="text-xs text-zinc-400">{perfil.handle}</p>
          </div>
          <div className="ml-auto w-4 h-4 rounded-full flex-shrink-0" style={{ background: perfil.cor_cta }} />
        </CardContent>
      </Card>

      {/* Modos de input */}
      <Tabs value={modo} onValueChange={v => setModo(v as 'markdown' | 'ia')}>
        <TabsList className="bg-zinc-800 border border-zinc-700 mb-4 w-full">
          <TabsTrigger value="markdown" className="flex-1 gap-2 data-[state=active]:bg-zinc-700">
            <FileText className="w-4 h-4" /> Markdown
          </TabsTrigger>
          <TabsTrigger value="ia" className="flex-1 gap-2 data-[state=active]:bg-zinc-700">
            <Sparkles className="w-4 h-4" /> Gerar com IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="markdown">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-300 font-normal">
                Cole o markdown com os slides.{' '}
                <button
                  type="button"
                  onClick={() => { setMarkdown(MARKDOWN_EXEMPLO); aplicarMarkdown(MARKDOWN_EXEMPLO) }}
                  className="text-orange-400 hover:text-orange-300 underline"
                >
                  Carregar exemplo
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder={`# Título do Carousel\n\n## Slide 1 — Título da capa\nkeyword: professional dark office\n\n## Slide 2 — Título\nTexto do corpo.\nkeyword: dark cinematic`}
                className="bg-zinc-800 border-zinc-700 text-white font-mono text-xs min-h-[280px] resize-y"
              />
              <Button
                onClick={() => aplicarMarkdown(markdown)}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white gap-2"
              >
                <FileText className="w-4 h-4" /> Processar Markdown
              </Button>
              {parseErrors.map((e, i) => (
                <p key={i} className="text-red-400 text-xs">{e}</p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-300 font-normal">
                Digite o tema e o Claude gera todo o conteúdo dos 10 slides.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Tema do carousel</Label>
                <Input
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  placeholder="Ex: Como usar IA para gerar renda extra em 2025"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyDown={e => { if (e.key === 'Enter') gerarComIA() }}
                />
              </div>
              <Button
                onClick={gerarComIA}
                disabled={gerandoConteudo}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                {gerandoConteudo
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando conteúdo...</>
                  : <><Sparkles className="w-4 h-4" /> Gerar Conteúdo</>
                }
              </Button>
              <p className="text-zinc-500 text-xs">
                Requer ANTHROPIC_API_KEY configurada no servidor.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview e edição dos slides */}
      {slides.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold truncate pr-2">{tituloCarousel || 'Slides'}</h2>
            <Badge className="bg-zinc-700 text-zinc-300 flex-shrink-0">{slides.length} slides</Badge>
          </div>

          {slides.map((slide, i) => (
            <Card key={i} className="border-zinc-800 bg-zinc-900">
              <button
                type="button"
                className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => toggleExpandido(i)}
              >
                <span className="w-7 h-7 rounded-full bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{slide.titulo}</p>
                  {slide.corpo && (
                    <p className="text-xs text-zinc-500 truncate">{slide.corpo.slice(0, 60)}&hellip;</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${TIPO_COR[slide.tipo]}`}>
                  {TIPO_LABEL[slide.tipo]}
                </span>
                {expandidos.has(i)
                  ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                }
              </button>

              {expandidos.has(i) && (
                <CardContent className="pt-0 pb-4 px-4 space-y-3 border-t border-zinc-800">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Título</Label>
                    <Input
                      value={slide.titulo}
                      onChange={e => atualizarSlide(i, 'titulo', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white text-sm h-9"
                    />
                  </div>
                  {slide.tipo !== 'capa' && (
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Corpo</Label>
                      <Textarea
                        value={slide.corpo ?? ''}
                        onChange={e => atualizarSlide(i, 'corpo', e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white text-sm min-h-[80px] resize-none"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Keyword para imagem</Label>
                    <Input
                      value={slide.imagem_keyword ?? ''}
                      onChange={e => atualizarSlide(i, 'imagem_keyword', e.target.value)}
                      placeholder="dark cinematic professional"
                      className="bg-zinc-800 border-zinc-700 text-white text-sm h-9 font-mono"
                    />
                  </div>
                  {slide.tipo === 'cta_final' && (
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">Texto do botão CTA</Label>
                      <Input
                        value={slide.cta_texto ?? ''}
                        onChange={e => atualizarSlide(i, 'cta_texto', e.target.value)}
                        placeholder="Me siga para mais conteúdos!"
                        className="bg-zinc-800 border-zinc-700 text-white text-sm h-9"
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}

          {/* Ação final */}
          <div className="pt-4 border-t border-zinc-800">
            {gerando ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  <span className="text-sm text-zinc-300">
                    Gerando slides... {progresso}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Buscando imagens e renderizando cada slide. Pode levar 1-2 min.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={gerarPNGs}
                  className="bg-orange-500 hover:bg-orange-600 text-white gap-2 px-6"
                  size="lg"
                >
                  <Play className="w-4 h-4" />
                  Gerar {slides.length} Slides + Download ZIP
                </Button>
                {projetoId && (
                  <Link href={`/dashboard/projetos/${projetoId}`}>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                      Ver no Histórico
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
