import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Settings, ArrowLeft } from 'lucide-react'
import type { Perfil } from '@/types'

export default async function PerfisPage() {
  const supabase = await createClient()
  const { data: perfis } = await supabase
    .from('perfis')
    .select('*')
    .order('criado_em', { ascending: false })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Gerenciar Perfis</h1>
          <p className="text-zinc-400 text-sm">Edite as identidades visuais dos seus perfis</p>
        </div>
        <Link href="/dashboard/perfis/novo">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Novo Perfil
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {(perfis as Perfil[] ?? []).map(perfil => (
          <Card key={perfil.id} className="border-zinc-800 bg-zinc-900">
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2"
                style={{ borderColor: perfil.cor_cta }}
              >
                {perfil.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfil.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: perfil.cor_cta + '22', color: perfil.cor_cta }}>
                    {perfil.nome[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{perfil.nome}</p>
                <p className="text-sm text-zinc-400">{perfil.handle}</p>
              </div>
              <Link href={`/dashboard/perfis/${perfil.id}`}>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Editar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
