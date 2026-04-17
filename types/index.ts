export interface Perfil {
  id: string
  user_id: string
  nome: string
  handle: string
  marca: string
  autor: string | null
  copyright: string | null
  cor_cta: string
  logo_url: string | null
  avatar_url: string | null
  unsplash_key: string | null
  pexels_key: string | null
  criado_em: string
  atualizado_em: string
}

export interface Projeto {
  id: string
  user_id: string
  perfil_id: string | null
  modelo: 'carousel-editorial' | 'post-citacao' | 'carrossel-dicas'
  titulo: string
  config_json: CarouselConfig | CitacaoConfig | DicasConfig
  slides_urls: string[] | null
  zip_url: string | null
  criado_em: string
  perfis?: Perfil
}

// ── Carousel Editorial ────────────────────────────────────────────
export interface SlideConfig {
  tipo: 'capa' | 'conteudo_grande' | 'conteudo_padrao' | 'cta_final'
  titulo: string
  corpo?: string
  imagem_keyword?: string
  cta_seguir?: boolean
  cta_texto?: string
}

export interface CarouselConfig {
  titulo_carousel: string
  slides: SlideConfig[]
}

// ── Post Citação ──────────────────────────────────────────────────
export interface CitacaoConfig {
  citacao: string
  autor_citacao: string
  imagem_keyword?: string
}

// ── Carrossel de Dicas ────────────────────────────────────────────
export interface Dica {
  titulo: string
  texto: string
}

export interface DicasConfig {
  titulo_carousel: string
  dicas: Dica[]
}
