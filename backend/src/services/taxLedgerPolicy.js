'use strict';

const EVENT_TYPES = new Set(['buy','sell','trade','transfer_in','transfer_out','fee','fork','airdrop','staking_reward','mining_reward','nft_mint','nft_sale']);
const TRANSITIONS = Object.freeze({ imported:['normalized'], normalized:['reconciled'], reconciled:['calculated'], calculated:['professional_review'], professional_review:['approved','changes_requested'], changes_requested:['calculated'], approved:['exported'], exported:[] });

function decimalUnits(value, scale = 8) {
  const text = String(value ?? '').trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) throw new Error('invalid decimal');
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = text.replace('-', '').split('.');
  if (fraction.length > scale) throw new Error(`decimal exceeds ${scale} places`);
  const units = BigInt(whole) * (10n ** BigInt(scale)) + BigInt((fraction + '0'.repeat(scale)).slice(0, scale));
  return negative ? -units : units;
}

function normalizeLedgerEvent(input) {
  if (!input || typeof input !== 'object') throw new Error('event is required');
  if (!EVENT_TYPES.has(input.type)) throw new Error('unsupported event type');
  if (!input.externalId || !input.sourceAccountId || !input.asset) throw new Error('externalId, sourceAccountId, and asset are required');
  const occurredAt = new Date(input.occurredAt);
  if (Number.isNaN(occurredAt.getTime()) || occurredAt > new Date()) throw new Error('occurredAt must be a past timestamp');
  const quantityUnits = decimalUnits(input.quantity);
  if (quantityUnits <= 0n) throw new Error('quantity must be positive');
  if (['sell','trade','nft_sale'].includes(input.type) && input.usdValue == null) throw new Error('disposals require usdValue and price provenance');
  if (input.usdValue != null && (!input.priceSource || !input.priceObservedAt)) throw new Error('valuation requires priceSource and priceObservedAt');
  if (input.type.startsWith('transfer_') && !input.transferLinkId) throw new Error('transfers require transferLinkId');
  return { ...input, asset: String(input.asset).toUpperCase(), occurredAt: occurredAt.toISOString(), quantityUnits: quantityUnits.toString(), usdMicros: input.usdValue == null ? null : decimalUnits(input.usdValue, 6).toString() };
}

function selectLots(lots, quantity, method) {
  const needed = decimalUnits(quantity);
  const candidates = lots.map((lot) => ({ ...lot, remainingUnits: decimalUnits(lot.remaining).toString(), unitBasisMicros: decimalUnits(lot.unitBasisUsd, 6).toString() }));
  const sorted = [...candidates].sort((a,b) => {
    if (method === 'HIFO') return Number(BigInt(b.unitBasisMicros) - BigInt(a.unitBasisMicros));
    const delta = new Date(a.acquiredAt) - new Date(b.acquiredAt);
    return method === 'LIFO' ? -delta : delta;
  });
  let outstanding = needed;
  const allocations = [];
  for (const lot of sorted) {
    if (outstanding === 0n) break;
    const take = BigInt(lot.remainingUnits) < outstanding ? BigInt(lot.remainingUnits) : outstanding;
    if (take > 0n) allocations.push({ lotId: lot.id, quantityUnits: take.toString(), unitBasisMicros: lot.unitBasisMicros });
    outstanding -= take;
  }
  if (outstanding > 0n) throw new Error('insufficient lots for disposal');
  return allocations;
}

function assertTaxRunTransition(from, to, role, context = {}) {
  if (!(TRANSITIONS[from] || []).includes(to)) throw new Error(`invalid transition: ${from} -> ${to}`);
  if (to === 'calculated' && (!context.jurisdiction || !context.taxYear || !context.ruleVersion || !context.citations?.length)) throw new Error('calculation requires jurisdiction, taxYear, versioned rules, and citations');
  if (to === 'professional_review' && (!context.reconciliationHash || !context.exceptionCount && context.exceptionCount !== 0)) throw new Error('review requires a reconciliation snapshot');
  if (to === 'approved' && (role !== 'tax_professional' || !context.reviewerId || context.reviewerId === context.preparerId || !context.reviewerCredential || !context.rationale)) throw new Error('independent tax-professional approval with credential and rationale required');
  if (to === 'exported' && role !== 'tax_professional') throw new Error('only a tax professional can release an export');
  return true;
}

module.exports = { decimalUnits, normalizeLedgerEvent, selectLots, assertTaxRunTransition };
