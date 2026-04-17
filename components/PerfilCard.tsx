'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import type { Perfil } from '@/types'

export function PerfilCard({ perfil }: { perfil: Perfil }) {
  const router = useRouter()

  const iniciais = perfil.nome
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  function handleCardClick() {
    router.push(`/dashboard/perfil/${perfil.id}`)
  }

  return (
    <Card
      onClick={handleCardClick}
      className="group border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all cursor-pointer h-full"
    >
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
  )
}
