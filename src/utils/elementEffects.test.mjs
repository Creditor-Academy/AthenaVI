import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ELEMENT_EFFECT_OPTIONS,
  elementEffectFilter,
  groupEffectChildPatches,
  hasElementEffect,
  normalizeElementEffect,
  withElementEffectSettings,
  withElementEffectType,
} from './elementEffects.js'

test('every listed effect (but none) draws a filter', () => {
  for (const { id } of ELEMENT_EFFECT_OPTIONS) {
    const filter = elementEffectFilter({ effect: { type: id } })
    if (id === 'none') assert.equal(filter, undefined)
    else assert.ok(filter && /drop-shadow|blur\(/.test(filter), `${id}: ${filter}`)
  }
})

test('no effect, unknown effect or garbage → nothing', () => {
  assert.equal(elementEffectFilter({}), undefined)
  assert.equal(elementEffectFilter({ effect: null }), undefined)
  assert.equal(elementEffectFilter({ effect: { type: 'sparkle' } }), undefined)
  assert.equal(elementEffectFilter({ effect: 'shadow' }), undefined)
  assert.equal(hasElementEffect({ effect: { type: 'glow' } }), true)
})

test('shadow follows distance, direction, blur, colour and transparency', () => {
  const filter = elementEffectFilter({
    effect: { type: 'shadow', offset: 10, angle: 90, blur: 5, color: '#ff0000', transparency: 25 },
  })
  assert.equal(filter, 'drop-shadow(0px 10px 5px rgba(255, 0, 0, 0.75))')
})

test('settings are clamped and missing ones fall back to defaults', () => {
  const fx = normalizeElementEffect({ type: 'outline', thickness: 999 })
  assert.equal(fx.thickness, 12)
  assert.equal(fx.color, '#111827')
  assert.equal(normalizeElementEffect({ type: 'blur', amount: 'x' }).amount, 4)
})

test('scale: a stage laid out wider than 900px scales the effect', () => {
  assert.equal(elementEffectFilter({ effect: { type: 'blur', amount: 4 } }, { scale: 2 }), 'blur(8px)')
})

test('picking an effect keeps its settings; none clears it with null (patches are merged)', () => {
  let c = { fill: '#fff' }
  c = withElementEffectType(c, 'glow')
  assert.deepEqual(c.effect, { type: 'glow', size: 14, color: '#FACC15' })
  c = withElementEffectSettings(c, { size: 30 })
  assert.equal(c.effect.size, 30)
  assert.equal(withElementEffectType(c, 'glow').effect.size, 30, 're-picking keeps settings')
  assert.equal(withElementEffectType(c, 'shadow').effect.offset, 8, 'another effect starts fresh')
  const cleared = withElementEffectType(c, 'none')
  assert.equal(cleared.effect, null)
  assert.equal(cleared.fill, '#fff')
  assert.equal(elementEffectFilter(cleared), undefined)
})

test('a group passes its effect on to the elements inside (not locked ones)', () => {
  const group = { id: 'g', type: 'group', childIds: ['a', 'b', 'c'], content: {} }
  const elements = [
    group,
    { id: 'a', type: 'shape', content: { fill: 'red' } },
    { id: 'b', type: 'image', content: { url: 'x' } },
    { id: 'c', type: 'text', locked: true, content: {} },
    { id: 'd', type: 'shape', content: {} },
  ]
  const next = withElementEffectType(group.content, 'shadow')
  const patches = groupEffectChildPatches(elements, group, next)
  assert.deepEqual(Object.keys(patches).sort(), ['a', 'b'])
  assert.equal(patches.a.effect.type, 'shadow')
  assert.equal(patches.a.fill, 'red')
  // An unrelated group change (no effect change) touches nothing.
  assert.deepEqual(groupEffectChildPatches(elements, { ...group, content: next }, { ...next, x: 1 }), {})
  // Removing it from the group removes it from the elements.
  const off = groupEffectChildPatches(elements, { ...group, content: next }, withElementEffectType(next, 'none'))
  assert.equal(off.a.effect, null)
  // Not a group → nothing.
  assert.deepEqual(groupEffectChildPatches(elements, elements[1], next), {})
})
