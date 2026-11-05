import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scopeSvgIds } from './scopeSvgIds.js'

const SVG = `<svg><defs><filter id="tciShadow"><feDropShadow dy="16"/></filter><clipPath id='clip'><rect/></clipPath><linearGradient id="g"/></defs>
<rect filter="url(#tciShadow)" clip-path="url('#clip')" fill="url(#g)"/><use href="#clip"/><use xlink:href="#g"/><rect fill="url(#elsewhere)"/></svg>`

test('ids and every reference to them get the prefix', () => {
  const out = scopeSvgIds(SVG, 'el-12')
  assert.match(out, /<filter id="el-12-tciShadow">/)
  assert.match(out, /<clipPath id='el-12-clip'>/)
  assert.match(out, /filter="url\(#el-12-tciShadow\)"/)
  assert.match(out, /clip-path="url\('#el-12-clip'\)"/)
  assert.match(out, /fill="url\(#el-12-g\)"/)
  assert.match(out, /<use href="#el-12-clip"\/>/)
  assert.match(out, /<use xlink:href="#el-12-g"\/>/)
  assert.doesNotMatch(out, /url\(#tciShadow\)/)
})

test('references to ids the SVG does not define are left alone', () => {
  assert.match(scopeSvgIds(SVG, 'p'), /fill="url\(#elsewhere\)"/)
})

test('two copies of the same SVG no longer share ids', () => {
  const a = scopeSvgIds(SVG, 'a')
  const b = scopeSvgIds(SVG, 'b')
  const idsOf = (s) => [...s.matchAll(/\sid=["']([^"']+)/g)].map((m) => m[1])
  assert.equal(idsOf(a).filter((id) => idsOf(b).includes(id)).length, 0)
})

test('unsafe prefix characters are dropped; no ids → unchanged', () => {
  assert.match(scopeSvgIds(SVG, ':r1:'), /id="r1-tciShadow"/)
  assert.equal(scopeSvgIds('<svg><rect/></svg>', 'x'), '<svg><rect/></svg>')
  assert.equal(scopeSvgIds(null, 'x'), null)
})
