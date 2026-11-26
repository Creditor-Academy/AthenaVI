/**
 * Layout repair must never delete what the user added to a slide (CANVAS_FIX_PLAN_25NOV2026, D-8).
 *
 * The editor's layout-repair pass (AIPptEditor.jsx, effect calling repairPresentationLayoutSlides)
 * rebuilds layout slides it thinks are broken and saves the result over the server copy. Before
 * D-8, a slide added in the current session (no `manuallyEdited` flag yet) was rebuilt on 14
 * layouts, and the user's images on it were deleted: the testers' "images gone the next day".
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import presentationService from '../services/presentationService.js'
import { listDeckLayoutIds, getDeckLayoutSchema } from './deckLayoutRegistry.js'
import { compileDeckLayoutToElements } from './compileDeckLayoutToElements.js'
import {
  carryOverUserContent,
  needsLayoutCanvasRepair,
  repairPresentationLayoutSlides,
} from './layoutCanvasService.js'

const BUCKET = 'https://example-bucket.s3.us-east-1.amazonaws.com/workspace/w/assets'

/** Inserted in the editor (drag and drop, upload, Insert panel). */
const USER_IMAGE = {
  id: 'el-user-image',
  type: 'image',
  layer: 99,
  placement: { x: 1200, y: 600, width: 500, height: 320, rotation: 0, opacity: 1 },
  content: { url: `${BUCKET}/user.png`, fit: 'cover' },
}

/** Attached from the Media panel by the server (slideMedia.service ids). */
const MEDIA_IMAGE = {
  id: 'img_a1b2c3d4e5f6',
  type: 'image',
  layer: 100,
  placement: { x: 100, y: 600, width: 400, height: 300, rotation: 0, opacity: 1 },
  content: { url: `${BUCKET}/media.png`, s3Key: 'workspace/w/assets/media.png', fit: 'cover' },
}

function compiled(schema) {
  try {
    return compileDeckLayoutToElements(schema, {
      canvas: { width: 1920, height: 1080 },
      slideTitle: 'Slide title',
      skipContentValidation: true,
    })
  } catch {
    return []
  }
}

function layoutSlide(layoutId, schema, { manuallyEdited, extra = [USER_IMAGE, MEDIA_IMAGE], doc = {} } = {}) {
  return {
    id: `slide-${layoutId}`,
    layoutId,
    title: 'Slide title',
    ...(manuallyEdited === undefined ? {} : { manuallyEdited }),
    elements: {
      version: 1,
      canvas: { width: 1920, height: 1080 },
      elements: [...compiled(schema), ...extra],
      ...doc,
    },
  }
}

const layouts = listDeckLayoutIds()
  .map((id) => ({ id, schema: getDeckLayoutSchema(id) }))
  .filter(({ schema }) => schema?.slots?.length)

/** Runs the real repair with saving stubbed; returns slideId → saved canvas doc. */
async function runRepair(slides, opts = {}) {
  const saved = new Map()
  const original = presentationService.saveCanvas
  presentationService.saveCanvas = async (_ws, _pid, slideId, doc) => {
    saved.set(slideId, doc)
    return { slide: { id: slideId, elements: doc } }
  }
  try {
    const didRepair = await repairPresentationLayoutSlides({
      workspaceId: 'ws',
      presentationId: 'pres',
      slides,
      layoutSchemaMap: {},
      aspectRatio: '16:9',
      ...opts,
    })
    return { saved, didRepair }
  } finally {
    presentationService.saveCanvas = original
  }
}

const ids = (doc) => (doc?.elements || []).map((el) => el.id)

test(`sanity: the registry has layouts to check (${layouts.length})`, () => {
  assert.ok(layouts.length > 0)
})

test('slides loaded from the server (manuallyEdited: true) are never repaired', () => {
  const repaired = layouts.filter(({ id, schema }) => {
    const slide = layoutSlide(id, schema, { manuallyEdited: true })
    return needsLayoutCanvasRepair(slide, slide.elements.elements, schema)
  })
  assert.deepEqual(repaired.map((l) => l.id), [])
})

test('a slide added this session keeps the user\'s images when repair rebuilds it', async () => {
  const slides = layouts.map(({ id, schema }) => layoutSlide(id, schema, { manuallyEdited: undefined }))
  const { saved } = await runRepair(slides)
  // The pass still runs where it did before (it fixes really broken slides) …
  assert.ok(saved.size > 0, 'precondition: repair rebuilds some slides')
  // … but every rebuilt slide keeps both user images.
  const lost = [...saved.entries()]
    .filter(([, doc]) => !ids(doc).includes(USER_IMAGE.id) || !ids(doc).includes(MEDIA_IMAGE.id))
    .map(([slideId]) => slideId.replace(/^slide-/, ''))
  assert.deepEqual(lost, [], `repair dropped a user image on: ${lost.join(', ')}`)
})

test('carried images keep their content and sit above the layout', async () => {
  const slides = layouts.map(({ id, schema }) => layoutSlide(id, schema, { manuallyEdited: undefined }))
  const { saved } = await runRepair(slides)
  for (const [slideId, doc] of saved) {
    const els = doc.elements || []
    const layoutTop = Math.max(0, ...els.filter((el) => !/^(el-|img_)/.test(el.id)).map((el) => Number(el.layer) || 0))
    const user = els.find((el) => el.id === USER_IMAGE.id)
    const media = els.find((el) => el.id === MEDIA_IMAGE.id)
    assert.deepEqual(user.content, USER_IMAGE.content, slideId)
    assert.deepEqual(user.placement, USER_IMAGE.placement, slideId)
    assert.deepEqual(media.content, MEDIA_IMAGE.content, slideId)
    assert.ok(user.layer > layoutTop && media.layer > user.layer, `${slideId}: user images on top, in order`)
    assert.equal(new Set(ids(doc)).size, els.length, `${slideId}: no duplicate ids`)
  }
})

test('slides in skipSlideIds (edited this session) are never rebuilt', async () => {
  const slides = layouts.map(({ id, schema }) => layoutSlide(id, schema, { manuallyEdited: undefined }))
  const skip = new Set(slides.map((s) => s.id))
  const { saved, didRepair } = await runRepair(slides, { skipSlideIds: skip })
  assert.equal(saved.size, 0)
  assert.equal(didRepair, false)
})

test('server-generated elements (el_… without slotId) are not carried over as duplicates', () => {
  const generated = { id: 'el_0a1b2c3d4e5f', type: 'text', layer: 3, content: { text: 'old' } }
  const next = carryOverUserContent(
    { elements: [{ id: 'slot-TITLE', slotId: 'TITLE', type: 'text', layer: 1 }] },
    { elements: [generated, USER_IMAGE] }
  )
  assert.deepEqual(ids(next), ['slot-TITLE', USER_IMAGE.id])
})

test('a background image the user set survives the rebuild', () => {
  const next = carryOverUserContent(
    { elements: [{ id: 'slot-TITLE', slotId: 'TITLE', type: 'text', layer: 1 }], backgroundColor: '#fff' },
    {
      elements: [USER_IMAGE],
      backgroundImage: `${BUCKET}/bg.png`,
      backgroundImageFit: 'cover',
      backgroundImageElementId: USER_IMAGE.id,
    }
  )
  assert.equal(next.backgroundImage, `${BUCKET}/bg.png`)
  assert.equal(next.backgroundImageFit, 'cover')
  assert.equal(next.backgroundImageElementId, USER_IMAGE.id)
  assert.equal(next.backgroundColor, '#fff')
})

test('nothing to carry: the rebuilt canvas is unchanged', () => {
  const doc = { elements: [{ id: 'slot-TITLE', slotId: 'TITLE', type: 'text', layer: 1 }], backgroundColor: '#fff' }
  assert.deepEqual(carryOverUserContent(doc, { elements: [{ id: 'slot-OLD', slotId: 'OLD' }] }), doc)
  assert.deepEqual(carryOverUserContent(doc, null), doc)
})
