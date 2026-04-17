import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ImagePlay } from 'lucide-react'
import { PerfilCard } from '@/components/PerfilCard'
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
