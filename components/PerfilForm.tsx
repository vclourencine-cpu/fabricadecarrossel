'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Trash2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { Perfil } from '@/types'
import Link from 'next/link'

interface Props {
  perfil?: Perfil
  userId: string
}

export function PerfilForm({ perfil, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState(perfil?.nome ?? '')
  const [handle, setHandle] = useState(perfil?.handle ?? '')
  const [marca, setMarca] = useState(perfil?.marca ?? '')
  const [autor, setAutor] = useState(perfil?.autor ?? '')
  const [copyright, setCopyright] = useState(perfil?.copyright ?? '')
  const [corCta, setCorCta] = useState(perfil?.cor_cta ?? '#FF6B00')
  const [unsplashKey, setUnsplashKey] = useState(perfil?.unsplash_key ?? '')
  const [pexelsKey, setPexelsKey] = useState(perfil?.pexels_key ?? '')

  const [logoUrl, setLogoUrl] = useState(perfil?.logo_url ?? '')
  const [avatarUrl, setAvatarUrl] = useState(perfil?.avatar_url ?? '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const logoRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  async function uploadArquivo(file: File, bucket: string, setUrl: (url: string) => void, setUploading: (v: boolean) => void) {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      setUrl(data.publicUrl)
      toast.success('Imagem enviada!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar imagem'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || !handle || !marca) {
      toast.error('Preencha nome, handle e marca')
      return
    }
    setLoading(true)

    const dados = {
      user_id: userId,
      nome,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      marca,
      autor: autor || null,
      copyright: copyright || null,
      cor_cta: corCta,
      logo_url: logoUrl || null,
      avatar_url: avatarUrl || null,
      unsplash_key: unsplashKey || null,
      pexels_key: pexelsKey || null,
    }

    let error
    if (perfil?.id) {
      ;({ error } = await supabase.from('perfis').update(dados).eq('id', perfil.id))
    } else {
      ;({ error } = await supabase.from('perfis').insert(dados))
    }

    if (error) {
      toast.error('Erro ao salvar: ' + error.message)
      setLoading(false)
      return
    }

    toast.success(perfil?.id ? 'Perfil atualizado!' : 'Perfil criado!')
    router.push('/dashboard')
    router.refresh()
  }

  async function handleExcluir() {
    if (!perfil?.id) return
    if (!confirm('Excluir este perfil? Todos os projetos vinculados serão desvinculados.')) return

    const { error } = await supabase.from('perfis').delete().eq('id', perfil.id)
    if (error) { toast.error(error.message); return }

    toast.success('Perfil excluído.')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">
            {perfil?.id ? 'Editar Perfil' : 'Novo Perfil'}
          </h1>
          <p className="text-zinc-400 text-sm">Identidade visual do Instagram</p>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* Identidade */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Identidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Nome da marca *</Label>
                <Input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Do Prompt ao Pix™"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Handle Instagram *</Label>
                <Input
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  placeholder="@dopromptaopix"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Marca curta *</Label>
                <Input
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  placeholder="Prompt ao Pix"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Autor</Label>
                <Input
                  value={autor}
                  onChange={e => setAutor(e.target.value)}
                  placeholder="Seu Nome"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Copyright</Label>
                <Input
                  value={copyright}
                  onChange={e => setCopyright(e.target.value)}
                  placeholder="© 2025 dopromptaopix"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Cor de destaque (CTA)</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={corCta}
                    onChange={e => setCorCta(e.target.value)}
                    className="w-10 h-10 rounded-md border border-zinc-700 bg-zinc-800 cursor-pointer p-0.5"
                  />
                  <Input
                    value={corCta}
                    onChange={e => setCorCta(e.target.value)}
                    placeholder="#FF6B00"
                    className="bg-zinc-800 border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Imagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Avatar */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Foto de perfil (avatar)</Label>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full border-2 border-zinc-700 overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-zinc-500 text-xs text-center">Sem foto</span>
                    )}
                  </div>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) uploadArquivo(f, 'avatars', setAvatarUrl, setUploadingAvatar)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => avatarRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 w-full"
                  >
                    {uploadingAvatar ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-3 h-3 mr-1" /> Upload</>
                    )}
                  </Button>
                  {avatarUrl && (
                    <button type="button" onClick={() => setAvatarUrl('')} className="text-xs text-red-400 hover:text-red-300">
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Logo da marca</Label>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-xl border-2 border-zinc-700 overflow-hidden bg-zinc-800 flex items-center justify-center p-2">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-zinc-500 text-xs text-center">Sem logo</span>
                    )}
                  </div>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) uploadArquivo(f, 'logos', setLogoUrl, setUploadingLogo)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoRef.current?.click()}
                    disabled={uploadingLogo}
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 w-full"
                  >
                    {uploadingLogo ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-3 h-3 mr-1" /> Upload</>
                    )}
                  </Button>
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl('')} className="text-xs text-red-400 hover:text-red-300">
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chaves de API */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Chaves de API de Imagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-500 text-xs">
              Opcional. Melhora a qualidade das imagens buscadas. Sem chave usa LoremFlickr (grátis).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Unsplash Access Key</Label>
                <Input
                  value={unsplashKey}
                  onChange={e => setUnsplashKey(e.target.value)}
                  placeholder="sua-chave-unsplash"
                  type="password"
                  className="bg-zinc-800 border-zinc-700 text-white font-mono text-xs"
                />
                <p className="text-zinc-600 text-xs">unsplash.com/developers</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Pexels API Key</Label>
                <Input
                  value={pexelsKey}
                  onChange={e => setPexelsKey(e.target.value)}
                  placeholder="sua-chave-pexels"
                  type="password"
                  className="bg-zinc-800 border-zinc-700 text-white font-mono text-xs"
                />
                <p className="text-zinc-600 text-xs">pexels.com/api</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex items-center justify-between">
          {perfil?.id ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleExcluir}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir perfil
            </Button>
          ) : <div />}

          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="w-4 h-4" /> Salvar Perfil</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
