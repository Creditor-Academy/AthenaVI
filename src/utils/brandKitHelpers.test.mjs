#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  emptyBrandKitData,
  isValidHex,
  newColorId,
  validateBrandKitData,
  dedupeBrandKitList,
  canWriteBrandKits,
  brandKitInitials,
  normalizeBrandKitSummary,
} from './brandKitHelpers.js'

describe('brandKitHelpers', () => {
  it('starts with a valid empty kit and only OWNER/ADMIN can write', () => {
    assert.equal(validateBrandKitData(emptyBrandKitData()), null)
    assert.equal(canWriteBrandKits('OWNER'), true)
    assert.equal(canWriteBrandKits('ADMIN'), true)
    assert.equal(canWriteBrandKits('MEMBER'), false)
  })

  it('validates hex colors and unique color ids', () => {
    assert.equal(isValidHex('#3B82F6'), true)
    assert.equal(isValidHex('#fff'), true)
    assert.equal(isValidHex('blue'), false)
    const colors = emptyBrandKitData().colors
    assert.equal(newColorId(colors), `c${colors.length + 1}`)
  })

  it('rejects kits with too few colors or a broken primary role', () => {
    assert.match(validateBrandKitData({ colors: [{ id: 'c1', name: 'A', hex: '#000' }] }), /between 2 and 32/)
    const data = emptyBrandKitData()
    data.colorRoles.primary = 'missing'
    assert.match(validateBrandKitData(data), /Color role "primary"/)
  })

  it('dedupes kits by id and optionally by name, keeping the first', () => {
    const kits = [
      { id: '1', name: 'Athena' },
      { id: '1', name: 'Athena copy' },
      { id: '2', name: 'athena' },
      { id: '3', name: 'Other' },
    ]
    assert.deepEqual(
      dedupeBrandKitList(kits).map((k) => k.id),
      ['1', '2', '3']
    )
    assert.deepEqual(
      dedupeBrandKitList(kits, { byName: true }).map((k) => k.id),
      ['1', '3']
    )
  })

  it('normalizes summaries and initials from kit names', () => {
    const summary = normalizeBrandKitSummary({ _id: 'k1', name: '' })
    assert.equal(summary.id, 'k1')
    assert.equal(summary.name, 'Untitled Brand Kit')
    assert.equal(brandKitInitials('Athena VI'), 'AV')
    assert.equal(brandKitInitials(''), 'BK')
  })
})
