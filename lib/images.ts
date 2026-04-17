/**
 * Busca imagem por keyword e retorna como base64 data URL
 * Ordem: Unsplash API → Pexels API → LoremFlickr → Picsum
 */

export async function buscarImagemBase64(
  keyword: string,
  width: number,
  height: number,
  unsplashKey?: string | null,
  pexelsKey?: string | null
): Promise<string> {
  const encoded = encodeURIComponent(keyword)

  // 1) Unsplash API
  if (unsplashKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encoded}&orientation=landscape&client_id=${unsplashKey}`,
        { headers: { 'Accept-Version': 'v1' } }
      )
      if (res.ok) {
        const data = await res.json()
        const imgUrl = `${data.urls.regular}&w=${width}&h=${height}&fit=crop&q=80`
        const b64 = await urlToBase64(imgUrl)
        if (b64) return b64
      }
    } catch { /* continua */ }
  }

  // 2) Pexels API
  if (pexelsKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encoded}&per_page=1&orientation=portrait`,
        { headers: { Authorization: pexelsKey } }
      )
      if (res.ok) {
        const data = await res.json()
        const photos = data.photos ?? []
        if (photos.length > 0) {
          const b64 = await urlToBase64(photos[0].src.large2x)
          if (b64) return b64
        }
      }
    } catch { /* continua */ }
  }

  // 3) LoremFlickr
  try {
    const kwClean = keyword.replace(/\s+/g, ',')
    const url = `https://loremflickr.com/${width}/${height}/${kwClean}`
    const b64 = await urlToBase64(url)
    if (b64) return b64
  } catch { /* continua */ }

  // 4) Picsum fallback
  const seed = Math.abs(hashCode(keyword)) % 1000
  const b64 = await urlToBase64(`https://picsum.photos/seed/${seed}/${width}/${height}`)
  return b64 || placeholderDataUrl(width, height)
}

async function urlToBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    const blob = await res.blob()
    if (blob.size < 5000) return ''
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function placeholderDataUrl(w: number, h: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="#1a1a2e"/>
    <text x="50%" y="50%" text-anchor="middle" fill="#333" font-size="24" font-family="sans-serif">Imagem indisponível</text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
