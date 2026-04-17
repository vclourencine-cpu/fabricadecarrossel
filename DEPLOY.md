# 🚀 Guia de Deploy — Carousel SaaS

## Pré-requisitos
- Conta no [Supabase](https://supabase.com) ✅ (já tem)
- Conta no [GitHub](https://github.com) ✅ (já tem)
- Conta na [Vercel](https://vercel.com) (gratuita — Hobby plan)
- Conta na [Anthropic](https://console.anthropic.com) (para Modo IA — opcional)

---

## 1. Configurar o Supabase

### 1.1 Criar as tabelas
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `supabase/schema.sql`

### 1.2 Criar os buckets de Storage
1. Vá em **Storage** → **New bucket**
2. Crie 3 buckets (todos **públicos**):
   - `logos`
   - `avatars`
   - `slides`

### 1.3 Configurar políticas de Storage
Para cada bucket, vá em **Policies** e adicione:

**Policy para upload (INSERT):**
```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

**Policy para leitura pública (SELECT):**
```sql
true
```

### 1.4 Criar o usuário admin
1. Vá em **Authentication** → **Users** → **Add user**
2. Email: `vclourencine@gmail.com`
3. Senha: escolha uma senha forte
4. Clique em **Create User**

### 1.5 Copiar as chaves
Vá em **Settings** → **API** e copie:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Subir para o GitHub

```bash
cd C:\Users\DELL\Desktop\carousel-saas

# Inicializar e subir
git add .
git commit -m "feat: initial carousel saas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/carousel-saas.git
git push -u origin main
```

---

## 3. Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione o repositório `carousel-saas`
4. Em **Environment Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role |
| `ADMIN_EMAIL` | `vclourencine@gmail.com` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (opcional, para Modo IA) |

5. Clique em **Deploy**
6. Aguarde ~2 minutos

---

## 4. Acessar o app

Após o deploy, acesse a URL gerada pela Vercel (ex: `carousel-saas.vercel.app`) e faça login com o email e senha que você criou no Supabase.

---

## 5. Configurar chaves de imagens (opcional, mas recomendado)

Para imagens de melhor qualidade, adicione chaves gratuitas:

**Unsplash:**
1. Acesse [unsplash.com/developers](https://unsplash.com/developers)
2. Crie um app → copie o `Access Key`
3. Cole em cada perfil no app

**Pexels:**
1. Acesse [pexels.com/api](https://www.pexels.com/api/)
2. Gere uma API key
3. Cole em cada perfil no app

---

## 6. Chave da Anthropic (Modo IA)

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Vá em **API Keys** → **Create Key**
3. Copie a chave `sk-ant-...`
4. Adicione como variável `ANTHROPIC_API_KEY` na Vercel:
   - Dashboard Vercel → Seu projeto → Settings → Environment Variables

---

## Estrutura de arquivos gerados

```
carousel-saas/
├── supabase/schema.sql      ← Execute no Supabase SQL Editor
├── .env.example             ← Copie para .env.local (local) ou configure na Vercel
├── DEPLOY.md                ← Este arquivo
└── vercel.json              ← Configuração automática da Vercel
```
