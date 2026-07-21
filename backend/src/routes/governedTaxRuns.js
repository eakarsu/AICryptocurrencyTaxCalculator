'use strict';
const express = require('express');
const auth = require('../middleware/auth');
const sequelize = require('../config/database');
const { normalizeLedgerEvent, assertTaxRunTransition } = require('../services/taxLedgerPolicy');

const router = express.Router();
router.use(auth);

async function membership(tenantId, userId, transaction) {
  const [rows] = await sequelize.query('SELECT role FROM tax_tenant_memberships WHERE tenant_id=:tenantId AND user_id=:userId AND active=true', { replacements:{tenantId,userId}, transaction });
  if (!rows[0]) { const error = new Error('tenant membership required'); error.status = 403; throw error; }
  return rows[0].role;
}

router.post('/events/import', async (req,res) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = String(req.body.tenantId || '');
    const idempotencyKey = String(req.get('Idempotency-Key') || '');
    if (!tenantId || !idempotencyKey) throw new Error('tenantId and Idempotency-Key are required');
    await membership(tenantId, req.userId, transaction);
    const events = (req.body.events || []).map(normalizeLedgerEvent);
    if (!events.length || events.length > 1000) throw new Error('events must contain 1 to 1000 records');
    const [batchRows] = await sequelize.query(
      `INSERT INTO tax_import_batches (tenant_id,source,idempotency_key,created_by) VALUES (:tenantId,:source,:idempotencyKey,:userId)
       ON CONFLICT (tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *`,
      { replacements:{tenantId,source:req.body.source,idempotencyKey,userId:req.userId}, transaction }
    );
    for (const event of events) await sequelize.query(
      `INSERT INTO tax_ledger_events (tenant_id,batch_id,external_id,source_account_id,event_type,asset,quantity_units,usd_micros,occurred_at,transfer_link_id,price_source,raw_encrypted)
       VALUES (:tenantId,:batchId,:externalId,:sourceAccountId,:type,:asset,:quantityUnits,:usdMicros,:occurredAt,:transferLinkId,:priceSource,:rawEncrypted)
       ON CONFLICT (tenant_id,source_account_id,external_id) DO NOTHING`,
      { replacements:{...event,tenantId,batchId:batchRows[0].id,transferLinkId:event.transferLinkId || null,priceSource:event.priceSource || null,rawEncrypted:req.body.encryptedSourcePayload || null}, transaction }
    );
    await sequelize.query(`INSERT INTO tax_audit_events (tenant_id,actor_id,action,payload) VALUES (:tenantId,:userId,'ledger.imported',:payload::jsonb)`, { replacements:{tenantId,userId:req.userId,payload:JSON.stringify({batchId:batchRows[0].id,count:events.length})}, transaction });
    await transaction.commit(); res.status(201).json({ batch:batchRows[0], accepted:events.length });
  } catch (error) { await transaction.rollback(); res.status(error.status || 422).json({error:error.message}); }
});

router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = String(req.body.tenantId || '');
    const idempotencyKey = String(req.get('Idempotency-Key') || '');
    const taxYear = Number(req.body.taxYear);
    const jurisdiction = String(req.body.jurisdiction || '').trim();
    const lotMethod = String(req.body.lotMethod || 'FIFO');
    if (!tenantId || !idempotencyKey || !Number.isInteger(taxYear) || taxYear < 2009 || !jurisdiction) throw new Error('tenantId, Idempotency-Key, valid taxYear, and jurisdiction are required');
    if (!['FIFO', 'LIFO', 'HIFO', 'SPECIFIC_ID'].includes(lotMethod)) throw new Error('unsupported lot method');
    await membership(tenantId, req.userId, transaction);
    const [rows] = await sequelize.query(
      `INSERT INTO tax_runs (tenant_id,tax_year,jurisdiction,lot_method,idempotency_key,created_by)
       VALUES (:tenantId,:taxYear,:jurisdiction,:lotMethod,:idempotencyKey,:userId)
       ON CONFLICT (tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *`,
      { replacements:{tenantId,taxYear,jurisdiction,lotMethod,idempotencyKey,userId:req.userId}, transaction }
    );
    await sequelize.query(`INSERT INTO tax_audit_events (tenant_id,actor_id,action,payload) VALUES (:tenantId,:userId,'tax_run.created',:payload::jsonb)`, { replacements:{tenantId,userId:req.userId,payload:JSON.stringify({taxRunId:rows[0].id,taxYear,jurisdiction,lotMethod})}, transaction });
    await transaction.commit();
    res.status(201).json(rows[0]);
  } catch (error) { await transaction.rollback(); res.status(error.status || 422).json({error:error.message}); }
});

router.post('/:id/transition', async (req,res) => {
  const transaction = await sequelize.transaction();
  try {
    const [rows] = await sequelize.query('SELECT * FROM tax_runs WHERE id=:id FOR UPDATE', {replacements:{id:req.params.id},transaction});
    if (!rows[0]) { const error=new Error('tax run not found'); error.status=404; throw error; }
    const run=rows[0]; const role=await membership(run.tenant_id,req.userId,transaction);
    assertTaxRunTransition(run.status,req.body.to,role,{...req.body.context,reviewerId:req.userId});
    if (req.body.to === 'calculated') {
      const [rules] = await sequelize.query('SELECT id FROM tax_rule_versions WHERE jurisdiction=:jurisdiction AND tax_year=:taxYear AND version=:version AND effective_from<=CURRENT_DATE AND (effective_to IS NULL OR effective_to>CURRENT_DATE)', { replacements:{jurisdiction:req.body.context.jurisdiction,taxYear:req.body.context.taxYear,version:req.body.context.ruleVersion}, transaction });
      if (!rules[0]) throw new Error('effective tax rule version not found');
      await sequelize.query('UPDATE tax_runs SET rule_version_id=:ruleId WHERE id=:id', { replacements:{ruleId:rules[0].id,id:run.id}, transaction });
    }
    const [updated] = await sequelize.query('UPDATE tax_runs SET status=:to,version=version+1,updated_at=NOW() WHERE id=:id AND version=:version RETURNING *',{replacements:{to:req.body.to,id:run.id,version:req.body.expectedVersion},transaction});
    if(!updated[0]){const error=new Error('version conflict');error.status=409;throw error;}
    if (req.body.to === 'approved') await sequelize.query(
      `INSERT INTO tax_approvals (tax_run_id,reviewer_id,decision,rationale,credential_reference) VALUES (:runId,:reviewerId,'approved',:rationale,:credentialReference)`,
      { replacements:{runId:run.id,reviewerId:req.userId,rationale:req.body.context.rationale,credentialReference:req.body.context.reviewerCredential}, transaction }
    );
    await sequelize.query('INSERT INTO tax_audit_events (tenant_id,actor_id,action,payload) VALUES (:tenantId,:userId,:action,:payload::jsonb)',{replacements:{tenantId:run.tenant_id,userId:req.userId,action:`tax_run.${req.body.to}`,payload:JSON.stringify({before:run,after:updated[0],context:req.body.context})},transaction});
    await transaction.commit(); res.json(updated[0]);
  }catch(error){await transaction.rollback();res.status(error.status||422).json({error:error.message});}
});
module.exports=router;
