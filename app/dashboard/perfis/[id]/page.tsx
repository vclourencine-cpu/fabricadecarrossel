import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PerfilForm } from '@/components/PerfilForm'
import type { Perfil } from '@/types'

export default async function EditarPerfil({ params }: { params: Promise<{ id: string }> }) {
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

  return <PerfilForm perfil={perfil as Perfil} userId={user.id} />
}
