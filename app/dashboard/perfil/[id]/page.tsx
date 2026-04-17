import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, Download, Calendar, ArrowLeft, ImagePlay } from 'lucide-react'
import type { Perfil, Projeto } from '@/types'

const MODELO_LABEL = {
  'carousel-editorial': 'Carousel Editorial',
  'post-citacao': 'Post Citação',
  'carrossel-dicas': 'Carrossel de Dicas',
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function PerfilHistoricoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', id)
    .single()

  if (!perfil) notFound()

  const { data: projetos } = await supabase
    .from('projetos')
    .select('*')
    .eq('perfil_id', id)
    .order('criado_em', { ascending: false })
    .limit(20)

  const p = perfil as Perfil
  const iniciais = p.nome.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()

  return (
    <div>
      {/* Header do perfil */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden border-2"
          style={{ borderColor: p.cor_cta, background: p.avatar_url ? 'transparent' : p.cor_cta + '22' }}
        >
          {p.avatar_url
            ? <img src={p.avatar_url} alt={p.nome} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
            : <span style={{ color: p.cor_cta }}>{iniciais}</span>
          }
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{p.nome}</h1>
          <p className="text-zinc-400">{p.handle}</p>
          <p className="text-zinc-600 text-sm">{p.marca}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/perfis/${p.id}`}>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Editar
            </Button>
          </Link>
          <Link href={`/dashboard/criar?perfil=${p.id}`}>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Novo Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Histórico */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Histórico de Projetos
          {projetos && projetos.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-500">
              ({projetos.length} projeto{projetos.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {(!projetos || projetos.length === 0) ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <ImagePlay className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium mb-1">Nenhum projeto ainda</p>
            <p className="text-zinc-600 text-sm mb-5">Crie seu primeiro carousel para este perfil</p>
            <Link href={`/dashboard/criar?perfil=${p.id}`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Plus className="w-4 h-4" /> Criar Carousel
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(projetos as Projeto[]).map(projeto => (
              <Card key={projeto.id} className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <ImagePlay className="w-5 h-5 text-zinc-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{projeto.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400 py-0">
                        {MODELO_LABEL[projeto.modelo] ?? projeto.modelo}
                      </Badge>
                      <span className="text-zinc-600 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatarData(projeto.criado_em)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {projeto.zip_url && (
                      <a href={projeto.zip_url} download>
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          ZIP
                        </Button>
                      </a>
                    )}
                    <Link href={`/dashboard/projetos/${projeto.id}`}>
                      <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
