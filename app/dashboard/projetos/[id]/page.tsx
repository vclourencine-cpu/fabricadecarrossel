import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, RefreshCw, Calendar, User } from 'lucide-react'
import type { Projeto, Perfil, CarouselConfig } from '@/types'

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TIPO_COR: Record<string, string> = {
  capa: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conteudo_grande: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  conteudo_padrao: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  cta_final: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projeto } = await supabase
    .from('projetos')
    .select('*, perfis(*)')
    .eq('id', id)
    .single()

  if (!projeto) notFound()

  const p = projeto as Projeto & { perfis: Perfil }
  const config = p.config_json as CarouselConfig
  const slides = config?.slides ?? []

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <Link href={p.perfil_id ? `/dashboard/perfil/${p.perfil_id}` : '/dashboard'}>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{p.titulo}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-zinc-500 text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatarData(p.criado_em)}
            </span>
            {p.perfis && (
              <span className="text-zinc-500 text-sm flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {p.perfis.handle}
              </span>
            )}
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
              Carousel Editorial
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {p.zip_url && (
            <a href={p.zip_url} download>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Download className="w-4 h-4" />
                Baixar ZIP
              </Button>
            </a>
          )}
          <Link href={`/dashboard/criar?perfil=${p.perfil_id}`}>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white gap-2">
              <RefreshCw className="w-4 h-4" />
              Novo Carousel
            </Button>
          </Link>
        </div>
      </div>

      {/* Slides */}
      {slides.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
            {slides.length} slides
          </h2>
          {slides.map((slide, i) => (
            <Card key={i} className="border-zinc-800 bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">{slide.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${TIPO_COR[slide.tipo]}`}>
                        {slide.tipo}
                      </span>
                    </div>
                    {slide.corpo && (
                      <p className="text-zinc-400 text-sm leading-relaxed">{slide.corpo}</p>
                    )}
                    {slide.imagem_keyword && (
                      <p className="text-zinc-600 text-xs mt-1 font-mono">🔍 {slide.imagem_keyword}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-500">
        <p>💡 Os arquivos PNG foram gerados e baixados no momento da criação. Para baixar novamente, re-gere o carousel usando o botão acima.</p>
      </div>
    </div>
  )
}
