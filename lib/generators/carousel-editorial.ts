/**
 * Templates HTML do Carousel Editorial (10 slides)
 * Portado do gerar_carousel.py — mantém as mesmas medidas do Figma
 * Imagens são passadas como data URLs (base64) para funcionar no browser
 */

export interface SlideData {
  tipo: 'capa' | 'conteudo_grande' | 'conteudo_padrao' | 'cta_final'
  titulo: string
  corpo?: string
  imagem_keyword?: string
  cta_seguir?: boolean
  cta_texto?: string
}

export interface PerfilData {
  nome: string
  handle: string
  marca: string
  autor?: string | null
  copyright?: string | null
  cor_cta: string
  logo_url?: string | null
  avatar_url?: string | null
}

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`

const BASE_CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
a { color: inherit; text-decoration: none; }
body {
  width: 1080px; height: 1350px;
  background: #000;
  font-family: 'Inter', Arial, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
.slide {
  position: relative;
  width: 1080px; height: 1350px;
  overflow: hidden;
  background: #000;
}
.cabecalho {
  position: absolute;
  left: 49px; top: 44px;
  width: 982px; height: 48px;
  display: flex; align-items: center;
  justify-content: space-between;
}
.cab-marca {
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.40);
  letter-spacing: 0.3px;
}
.cab-copy {
  font-size: 12px; font-weight: 400;
  color: rgba(255,255,255,0.28);
  letter-spacing: 0.2px;
}
.rodape {
  position: absolute;
  left: 49px; top: 1252px;
  width: 982px; height: 62px;
  display: flex; align-items: center;
}
.tags { display: flex; align-items: center; gap: 12px; }
.tag {
  height: 52px;
  display: flex; align-items: center;
  padding: 0 20px;
  border-radius: 100px;
  font-size: 15px; font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.1px;
}
.tag-1 {
  background: rgba(255,255,255,0.10);
  border: 1.5px solid rgba(255,255,255,0.25);
  color: #fff;
}
.tag-2 {
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.70);
}
.arrasta {
  margin-left: auto;
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.30);
  letter-spacing: 0.5px;
}
.img-wrap {
  position: absolute;
  border-radius: 16px;
  overflow: hidden;
}
.img-wrap img {
  width: 100%; height: 100%;
  object-fit: cover;
  filter: brightness(0.88) contrast(1.05) saturate(0.9);
}
.img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0.10) 0%,
    rgba(0,0,0,0.04) 50%,
    rgba(0,0,0,0.35) 100%
  );
}
`

function cabecalhoHtml(marca: string, copyright: string): string {
  return `
  <div class="cabecalho">
    <span class="cab-marca">${marca}</span>
    <span class="cab-copy">${copyright}</span>
  </div>`
}

function rodapeHtml(marca: string, handle: string, ctaSeguir = false): string {
  const cta = ctaSeguir
    ? `<span style="margin-left:auto;font-size:14px;font-weight:700;color:rgba(255,255,255,0.80);display:flex;align-items:center;gap:8px;">👤 Me siga para mais conteúdos como esse!</span>`
    : `<span class="arrasta">Arrasta para o lado →</span>`
  return `
  <div class="rodape">
    <div class="tags">
      <div class="tag tag-1">${marca}</div>
      <div class="tag tag-2">${handle}</div>
    </div>
    ${cta}
  </div>`
}

function imgWrapHtml(imgSrc: string, left: number, top: number, width: number, height: number, radius = 16): string {
  return `
  <div class="img-wrap" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px;border-radius:${radius}px;">
    <img src="${imgSrc}" />
    <div class="img-overlay"></div>
  </div>`
}

function getYear(): string {
  return new Date().getFullYear().toString()
}

// ── CAPA ─────────────────────────────────────────────────────────────────────

export function htmlCapa(slide: SlideData, perfil: PerfilData, imgSrc: string): string {
  const marca = perfil.marca
  const handle = perfil.handle.startsWith('@') ? perfil.handle : `@${perfil.handle}`
  const autor = perfil.autor || perfil.nome
  const copyright = perfil.copyright || `© ${getYear()} ${marca}`

  const avatarHtml = perfil.avatar_url
    ? `<img src="${perfil.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:28px;color:white;">👤</div>`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}
<style>
${BASE_CSS}
.bg-foto { position:absolute; inset:0; }
.bg-foto img { width:100%; height:100%; object-fit:cover; filter: brightness(0.55) contrast(1.1) saturate(0.75); }
.bg-overlay {
  position:absolute; inset:0;
  background: linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.10) 40%,rgba(0,0,0,0.70) 100%);
}
.identidade { position:absolute; left:60px; bottom:340px; display:flex; align-items:center; gap:16px; }
.avatar { width:72px; height:72px; border-radius:50%; border:2px solid rgba(255,255,255,0.5); overflow:hidden; flex-shrink:0; }
.autor-info { display:flex; flex-direction:column; gap:4px; }
.autor-nome { font-size:20px; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px; }
.autor-handle { font-size:15px; font-weight:400; color:rgba(255,255,255,0.60); }
.titulo-capa { position:absolute; left:60px; right:60px; bottom:120px; font-size:52px; font-weight:900; color:#fff; line-height:1.15; letter-spacing:-0.5px; }
.hint-arrasta { position:absolute; right:60px; bottom:56px; font-size:13px; font-weight:500; color:rgba(255,255,255,0.35); letter-spacing:0.5px; }
</style></head><body>
<div class="slide">
  <div class="bg-foto"><img src="${imgSrc}" /></div>
  <div class="bg-overlay"></div>
  ${cabecalhoHtml(marca, copyright)}
  <div class="identidade">
    <div class="avatar">${avatarHtml}</div>
    <div class="autor-info">
      <div class="autor-nome">${autor} <span style="color:#4dabf7;font-size:16px;">✓</span></div>
      <div class="autor-handle">${handle}</div>
    </div>
  </div>
  <div class="titulo-capa">${slide.titulo}</div>
  <div class="hint-arrasta">Arrasta para o lado →</div>
</div>
</body></html>`
}

// ── CONTEÚDO GRANDE ───────────────────────────────────────────────────────────

export function htmlConteudoGrande(slide: SlideData, perfil: PerfilData, imgSrc: string): string {
  const marca = perfil.marca
  const handle = perfil.handle.startsWith('@') ? perfil.handle : `@${perfil.handle}`
  const copyright = perfil.copyright || `© ${getYear()} ${marca}`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}
<style>
${BASE_CSS}
.titulo { position:absolute; left:60px; top:217px; width:960px; font-size:52px; font-weight:900; color:#fff; line-height:1.18; letter-spacing:-0.8px; }
.corpo { position:absolute; left:60px; top:387px; width:960px; font-size:22px; font-weight:400; color:rgba(255,255,255,0.82); line-height:1.65; letter-spacing:0.1px; }
</style></head><body>
<div class="slide">
  ${cabecalhoHtml(marca, copyright)}
  <div class="titulo">${slide.titulo}</div>
  <div class="corpo">${slide.corpo ?? ''}</div>
  ${imgWrapHtml(imgSrc, 60, 645, 960, 487)}
  ${rodapeHtml(marca, handle, slide.cta_seguir)}
</div>
</body></html>`
}

// ── CONTEÚDO PADRÃO ───────────────────────────────────────────────────────────

export function htmlConteudoPadrao(slide: SlideData, perfil: PerfilData, imgSrc: string): string {
  const marca = perfil.marca
  const handle = perfil.handle.startsWith('@') ? perfil.handle : `@${perfil.handle}`
  const copyright = perfil.copyright || `© ${getYear()} ${marca}`

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}
<style>
${BASE_CSS}
.titulo { position:absolute; left:60px; top:254px; width:960px; font-size:42px; font-weight:900; color:#fff; line-height:1.18; letter-spacing:-0.5px; }
.corpo { position:absolute; left:60px; top:349px; width:960px; font-size:22px; font-weight:400; color:rgba(255,255,255,0.82); line-height:1.65; }
</style></head><body>
<div class="slide">
  ${cabecalhoHtml(marca, copyright)}
  <div class="titulo">${slide.titulo}</div>
  <div class="corpo">${slide.corpo ?? ''}</div>
  ${imgWrapHtml(imgSrc, 60, 607, 960, 487)}
  ${rodapeHtml(marca, handle, slide.cta_seguir)}
</div>
</body></html>`
}

// ── CTA FINAL ─────────────────────────────────────────────────────────────────

export function htmlCtaFinal(slide: SlideData, perfil: PerfilData, imgSrc: string): string {
  const marca = perfil.marca
  const handle = perfil.handle.startsWith('@') ? perfil.handle : `@${perfil.handle}`
  const copyright = perfil.copyright || `© ${getYear()} ${marca}`
  const corCta = perfil.cor_cta || '#FF6B00'
  const ctaTexto = slide.cta_texto || 'Me siga para mais conteúdos como esse!'

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}
<style>
${BASE_CSS}
.banner-cta {
  position:absolute; left:0; top:0; width:1080px; height:164px;
  background:${corCta};
  border-radius:0 0 24px 24px;
  display:flex; align-items:center; justify-content:center;
}
.banner-cta-text { font-size:28px; font-weight:900; color:#fff; letter-spacing:-0.3px; text-align:center; padding:0 60px; }
.titulo-final { position:absolute; left:60px; top:815px; width:960px; font-size:46px; font-weight:900; color:#fff; line-height:1.18; letter-spacing:-0.5px; }
.corpo-final { position:absolute; left:60px; top:980px; width:960px; font-size:22px; font-weight:400; color:rgba(255,255,255,0.80); line-height:1.65; }
</style></head><body>
<div class="slide">
  <div class="banner-cta"><div class="banner-cta-text">${ctaTexto}</div></div>
  ${imgWrapHtml(imgSrc, 0, 164, 1080, 438, 0)}
  <div class="titulo-final">${slide.titulo}</div>
  <div class="corpo-final">${slide.corpo ?? ''}</div>
  ${rodapeHtml(marca, handle, false)}
</div>
</body></html>`
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function gerarHtmlSlide(slide: SlideData, perfil: PerfilData, imgSrc: string): string {
  switch (slide.tipo) {
    case 'capa':            return htmlCapa(slide, perfil, imgSrc)
    case 'conteudo_grande': return htmlConteudoGrande(slide, perfil, imgSrc)
    case 'conteudo_padrao': return htmlConteudoPadrao(slide, perfil, imgSrc)
    case 'cta_final':       return htmlCtaFinal(slide, perfil, imgSrc)
    default:                return htmlConteudoPadrao(slide, perfil, imgSrc)
  }
}
