/** Browser helpers shared by every in-browser export (Canvas editor pages, PPT slide images). */

export function dataUrlToBlob(dataUrl) {
  const [header, body] = String(dataUrl).split(',')
  const mime = /data:([^;]+)/.exec(header)?.[1] || 'application/octet-stream'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function waitForImages(root) {
  const images = [...(root?.querySelectorAll?.('img') || [])]
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
    )
  )
}

/** Draw one remote image. A tainted canvas means the host blocked the export. */
export function probeImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        canvas.getContext('2d').drawImage(img, 0, 0)
        canvas.toDataURL()
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('tainted'))
    img.src = url
  })
}
