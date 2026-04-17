import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PerfilForm } from '@/components/PerfilForm'

export default async function NovoPerfil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <PerfilForm userId={user.id} />
}
