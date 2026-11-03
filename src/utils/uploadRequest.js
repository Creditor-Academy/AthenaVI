/**
 * Multipart upload with progress. fetch() can't report upload progress, so this uses XHR.
 * Resolves `{ status, payload }` for every completed request; a request that never got an
 * answer — dropped connection, or a proxy that refused the body without CORS headers, which
 * the browser only reports as "Failed to fetch" — resolves with status 0.
 */
export function sendUpload(url, formData, { headers = {}, onProgress } = {}) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    for (const [name, value] of Object.entries(headers)) {
      if (value) xhr.setRequestHeader(name, value)
    }
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) onProgress(Math.min(1, event.loaded / event.total))
      }
    }
    xhr.onload = () => {
      let payload = {}
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : {}
      } catch {
        payload = {}
      }
      resolve({ status: xhr.status, payload })
    }
    xhr.onerror = () => resolve({ status: 0, payload: {} })
    xhr.ontimeout = () => resolve({ status: 0, payload: {} })
    xhr.onabort = () => resolve({ status: 0, payload: {} })
    xhr.send(formData)
  })
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  if (n >= 1024) return `${Math.round(n / 1024)} KB`
  return `${n} B`
}
