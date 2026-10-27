#!/usr/bin/env node
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatCreditTransactionType,
  formatCreditTransactionTitle,
  formatCreditAmount,
  formatCreditsPlain,
  sumUsageCredits,
  isTeamWorkspaceType,
  isPrivateWorkspaceType,
  extractCreditsUsed,
  hasEnoughCreditsForAvatar,
  isPresentationCreditFeature,
} from './creditTransactions.js'

describe('creditTransactions', () => {
  it('labels known transaction types', () => {
    assert.equal(formatCreditTransactionType('usage'), 'Usage')
    assert.equal(formatCreditTransactionType('allocation'), 'Allocated to workspace')
    assert.equal(formatCreditTransactionType('mystery'), 'mystery')
  })

  it('titles allocation rows with the workspace name', () => {
    assert.equal(
      formatCreditTransactionTitle({
        type: 'allocation',
        usageDetail: { workspaceName: 'Design' },
      }),
      'Allocated to Design'
    )
    assert.equal(
      formatCreditTransactionTitle({
        type: 'deallocation',
        metadata: { workspaceName: 'Design' },
      }),
      'Returned from Design'
    )
    assert.equal(
      formatCreditTransactionTitle({
        type: 'usage',
        usageDetail: { presentationName: 'Q3', feature: 'ppt_export' },
      }),
      'Presentation — "Q3"'
    )
  })

  it('formats amounts and sums usage credits', () => {
    assert.equal(formatCreditAmount(12), '+12')
    assert.equal(formatCreditAmount(-5), '-5')
    assert.equal(formatCreditsPlain(-8), '8')
    assert.equal(
      sumUsageCredits([
        { type: 'usage', amount: -3 },
        { type: 'usage', amount: -2 },
        { type: 'purchase', amount: 20 },
      ]),
      5
    )
  })

  it('classifies workspace types and credit features', () => {
    assert.equal(isTeamWorkspaceType('TEAM'), true)
    assert.equal(isTeamWorkspaceType('WORKSPACE'), true)
    assert.equal(isPrivateWorkspaceType('PERSONAL'), true)
    assert.equal(isPresentationCreditFeature('ppt_export'), true)
    assert.equal(isPresentationCreditFeature('avatar_create'), false)
  })

  it('extracts a charge from mixed API payloads and checks avatar balance', () => {
    assert.equal(extractCreditsUsed({ creditsUsed: 4 }), 4)
    assert.equal(extractCreditsUsed({ credits: { charged: 7 } }), 7)
    assert.equal(hasEnoughCreditsForAvatar(10, 8), true)
    assert.equal(hasEnoughCreditsForAvatar(3, 8), false)
  })
})
