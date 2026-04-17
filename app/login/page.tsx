'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ImagePlay } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const erroParam = searchParams.get('erro')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <CardContent>
      {(erro || erroParam === 'acesso_negado') && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {erroParam === 'acesso_negado' ? 'Acesso não autorizado.' : erro}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-300 text-sm">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senha" className="text-zinc-300 text-sm">Senha</Label>
          <Input
            id="senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </CardContent>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-background to-zinc-900" />

      <Card className="relative w-full max-w-sm border-zinc-800 bg-zinc-900/80 backdrop-blur shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <ImagePlay className="w-6 h-6 text-orange-500" />
          </div>
          <CardTitle className="text-xl font-bold text-white">Carousel Creator</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Acesso restrito — use suas credenciais
          </CardDescription>
        </CardHeader>

        <Suspense fallback={
          <CardContent>
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          </CardContent>
        }>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  )
}
