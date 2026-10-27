#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  setCanvasDragData,
  parseCanvasDragData,
  resolveDropImageSrc,
  resolveDropAssetId,
  isFrameClip,
  findTopFrameAtPoint,
  buildShapeImageFillPatch,
  clearShapeImageFillPatch,
  canAcceptImageFill,
} from './editorDragDrop.js'

describe('editorDragDrop', () => {
  it('round-trips drag payload JSON', () => {
    const transfer = { data: '', effectAllowed: '' }
    const event = {
      dataTransfer: {
        setData(_type, value) {
          transfer.data = value
        },
        getData() {
          return transfer.data
        },
        effectAllowed: 'none',
      },
    }
    setCanvasDragData(event, { kind: 'image', src: 'https://cdn/a.png' })
    assert.equal(event.dataTransfer.effectAllowed, 'copy')
    assert.deepEqual(parseCanvasDragData(event), { kind: 'image', src: 'https://cdn/a.png' })
  })

  it('resolves dropped image src and asset id', () => {
    assert.equal(resolveDropImageSrc('https://cdn/a.png'), 'https://cdn/a.png')
    assert.equal(resolveDropImageSrc({ url: 'https://cdn/b.png' }), 'https://cdn/b.png')
    assert.equal(resolveDropAssetId({ assetId: 'asset-1' }), 'asset-1')
    assert.equal(resolveDropAssetId('https://cdn/a.png'), null)
  })

  it('hits the top unlocked frame at a point and builds fill patches', () => {
    const back = {
      id: 'back',
      type: 'shape',
      role: 'frame',
      layer: 1,
      position: { x: 0, y: 0 },
      size: { width: 400, height: 400 },
    }
    const front = {
      id: 'front',
      type: 'shape',
      role: 'frame',
      layer: 2,
      position: { x: 0, y: 0 },
      size: { width: 400, height: 400 },
    }
    const locked = { ...front, id: 'locked', locked: true, layer: 3 }
    assert.equal(isFrameClip(front), true)
    assert.equal(findTopFrameAtPoint([back, front, locked], 10, 10).id, 'front')
    assert.equal(findTopFrameAtPoint([back], 999, 999), null)
    assert.equal(canAcceptImageFill(front), true)
    assert.equal(canAcceptImageFill(locked), false)
    assert.deepEqual(buildShapeImageFillPatch('https://cdn/a.png', 'asset-1'), {
      fillSrc: 'https://cdn/a.png',
      fillAssetId: 'asset-1',
      fillObjectFit: 'cover',
    })
    assert.equal(clearShapeImageFillPatch().fillSrc, null)
  })
})
