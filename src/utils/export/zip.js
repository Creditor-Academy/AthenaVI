/** Uncompressed (stored) zip files, built and read in the browser. No DOM. */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function u16(view, offset, value) {
  view.setUint16(offset, value, true)
}

function u32(view, offset, value) {
  view.setUint32(offset, value, true)
}

/** Uncompressed zip. Several raster pages download as one file. */
export function zipStoredFiles(files) {
  const encoded = files.map((file) => ({
    name: new TextEncoder().encode(file.name),
    data: file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes),
  }))
  encoded.forEach((file) => {
    file.crc = crc32(file.data)
  })

  let localSize = 0
  encoded.forEach((file) => {
    localSize += 30 + file.name.length + file.data.length
  })
  let centralSize = 0
  encoded.forEach((file) => {
    centralSize += 46 + file.name.length
  })

  const out = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(out.buffer)
  let offset = 0
  const localOffsets = []

  encoded.forEach((file) => {
    localOffsets.push(offset)
    u32(view, offset, 0x04034b50)
    u16(view, offset + 4, 20)
    u16(view, offset + 8, 0)
    u32(view, offset + 14, file.crc)
    u32(view, offset + 18, file.data.length)
    u32(view, offset + 22, file.data.length)
    u16(view, offset + 26, file.name.length)
    out.set(file.name, offset + 30)
    out.set(file.data, offset + 30 + file.name.length)
    offset += 30 + file.name.length + file.data.length
  })

  const centralStart = offset
  encoded.forEach((file, index) => {
    u32(view, offset, 0x02014b50)
    u16(view, offset + 4, 20)
    u16(view, offset + 6, 20)
    u32(view, offset + 16, file.crc)
    u32(view, offset + 20, file.data.length)
    u32(view, offset + 24, file.data.length)
    u16(view, offset + 28, file.name.length)
    u32(view, offset + 42, localOffsets[index])
    out.set(file.name, offset + 46)
    offset += 46 + file.name.length
  })

  u32(view, offset, 0x06054b50)
  u16(view, offset + 8, encoded.length)
  u16(view, offset + 10, encoded.length)
  u32(view, offset + 12, centralSize)
  u32(view, offset + 16, centralStart)
  return out
}

/**
 * Files in a stored (uncompressed) zip, such as the backend's slide image zips.
 * @returns {Array<{ name: string, bytes: Uint8Array }>}
 */
export function readStoredZip(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new Error('Not a zip file')
  const count = view.getUint16(end + 10, true)
  let offset = view.getUint32(end + 16, true)
  const decoder = new TextDecoder()
  const files = []
  for (let n = 0; n < count; n += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('Damaged zip file')
    const method = view.getUint16(offset + 10, true)
    const size = view.getUint32(offset + 20, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const local = view.getUint32(offset + 42, true)
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength))
    if (method !== 0) throw new Error('Compressed zip entries are not supported')
    const dataStart = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
    files.push({ name, bytes: bytes.slice(dataStart, dataStart + size) })
    offset += 46 + nameLength + extraLength + commentLength
  }
  return files
}
