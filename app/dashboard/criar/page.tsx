import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CriarCarousel } from '@/components/CriarCarousel'
import type { Perfil } from '@/types'

export default async function CriarPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string }>
}) {
  const { perfil: perfilId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfis } = await supabase
    .from('perfis')
    .select('*')
    .order('criado_em', { ascending: false })

  if (!perfis || perfis.length === 0) redirect('/dashboard/perfis/novo')

  const perfilSelecionado = perfilId
    ? (perfis as Perfil[]).find(p => p.id === perfilId) ?? (perfis as Perfil[])[0]
    : (perfis as Perfil[])[0]

  return (
    <CriarCarousel
      perfis={perfis as Perfil[]}
      perfilInicial={perfilSelecionado}
      userId={user.id}
    />
  )
}
