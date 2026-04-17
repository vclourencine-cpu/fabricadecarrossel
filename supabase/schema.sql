-- ================================================================
-- CAROUSEL SAAS — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ================================================================

-- ── Extensões ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tabela: perfis ───────────────────────────────────────────────
create table if not exists public.perfis (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  nome          text not null,           -- "Do Prompt ao Pix™"
  handle        text not null,           -- "@dopromptaopix"
  marca         text not null,           -- nome curto da marca
  autor         text,                    -- "Seu Nome"
  copyright     text,                    -- "© 2025 dopromptaopix"
  cor_cta       text default '#FF6B00',  -- cor de destaque hex
  logo_url      text,                    -- URL Supabase Storage
  avatar_url    text,                    -- URL Supabase Storage
  unsplash_key  text,                    -- chave pessoal Unsplash (opcional)
  pexels_key    text,                    -- chave pessoal Pexels (opcional)
  criado_em     timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- ── Tabela: projetos ─────────────────────────────────────────────
create table if not exists public.projetos (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  perfil_id   uuid references public.perfis(id) on delete set null,
  modelo      text not null,   -- 'carousel-editorial' | 'post-citacao' | 'carrossel-dicas'
  titulo      text not null,
  config_json jsonb not null default '{}'::jsonb,
  slides_urls text[],          -- array de URLs dos PNGs no Storage
  zip_url     text,            -- URL do ZIP no Storage
  criado_em   timestamptz default now()
);

-- ── Índices ──────────────────────────────────────────────────────
create index if not exists perfis_user_id_idx    on public.perfis(user_id);
create index if not exists projetos_user_id_idx  on public.projetos(user_id);
create index if not exists projetos_perfil_id_idx on public.projetos(perfil_id);
create index if not exists projetos_criado_em_idx on public.projetos(criado_em desc);

-- ── Row Level Security ───────────────────────────────────────────
alter table public.perfis   enable row level security;
alter table public.projetos enable row level security;

-- Perfis: só o dono vê/edita
create policy "perfis_select" on public.perfis
  for select using (auth.uid() = user_id);
create policy "perfis_insert" on public.perfis
  for insert with check (auth.uid() = user_id);
create policy "perfis_update" on public.perfis
  for update using (auth.uid() = user_id);
create policy "perfis_delete" on public.perfis
  for delete using (auth.uid() = user_id);

-- Projetos: só o dono vê/edita
create policy "projetos_select" on public.projetos
  for select using (auth.uid() = user_id);
create policy "projetos_insert" on public.projetos
  for insert with check (auth.uid() = user_id);
create policy "projetos_update" on public.projetos
  for update using (auth.uid() = user_id);
create policy "projetos_delete" on public.projetos
  for delete using (auth.uid() = user_id);

-- ── Trigger: atualiza atualizado_em ─────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_updated_at
  before update on public.perfis
  for each row execute function public.set_updated_at();

-- ── Storage Buckets ──────────────────────────────────────────────
-- Execute estes comandos separadamente no Storage do Supabase
-- ou via API:
--
-- Bucket "logos"   (public: true)
-- Bucket "avatars" (public: true)
-- Bucket "slides"  (public: true)
--
-- Política de upload (logos e avatars):
-- Authenticated users can upload to their own folder:
--   storage.foldername(name)[1] = auth.uid()::text
