import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, ImagePlay, Settings } from 'lucide-react'
import type { Perfil } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: perfis } = await supabase
    .from('perfis')
    .select('*')
    .order('criado_em', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Seus Perfis</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Selecione um perfil para ver o histórico ou criar um novo post
          </p>
        </div>
        <Link href="/dashboard/perfis/novo">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Novo Perfil
          </Button>
        </Link>
      </div>

      {(!perfis || perfis.length === 0) ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <ImagePlay className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">Nenhum perfil ainda</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Crie seu primeiro perfil para começar a gerar carousels
          </p>
          <Link href="/dashboard/perfis/novo">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro perfil
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(perfis as Perfil[]).map(perfil => (
            <PerfilCard key={perfil.id} perfil={perfil} />
          ))}
        </div>
      )}
    </div>
  )
}

function PerfilCard({ perfil }: { perfil: Perfil }) {
  const iniciais = perfil.nome
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <Link href={`/dashboard/perfil/${perfil.id}`}>
      <Card className="group border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden border-2"
              style={{ borderColor: perfil.cor_cta, background: perfil.avatar_url ? 'transparent' : perfil.cor_cta + '22' }}
            >
              {perfil.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.avatar_url} alt={perfil.nome} className="w-full h-full object-cover" />
              ) : (
                <span style={{ color: perfil.cor_cta }}>{iniciais}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{perfil.nome}</h3>
              <p className="text-sm text-zinc-400">{perfil.handle}</p>
              <p className="text-xs text-zinc-600 mt-1 truncate">{perfil.marca}</p>
            </div>

            {/* Cor CTA */}
            <div
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              style={{ background: perfil.cor_cta }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Clique para ver histórico</span>
            <Link
              href={`/dashboard/perfis/${perfil.id}`}
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
