'use strict';
function csvCell(v){ if(v===null||v===undefined) return ''; const s=typeof v==='object'?JSON.stringify(v):String(v); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
function toCsv(rows, cols){ const c=cols||(rows[0]?Object.keys(rows[0]):[]); return [c.join(','), ...rows.map(r=>c.map(k=>csvCell(r[k])).join(','))].join('\n'); }
function providerConfigured(env){ env=env||process.env; const r=env.OPENROUTER_API_KEY, o=env.OPENAI_API_KEY; return Boolean((r&&r!=='your_openrouter_key_here'&&r!=='your-openrouter-key-here')||(o&&o!=='your_openai_key_here')); }

function taxExposureSummary(rows){ rows=rows||[]; const byType={},byCoin={}; rows.forEach(r=>{ byType[r.type||'unknown']=(byType[r.type||'unknown']||0)+1; byCoin[r.cryptocurrency||'unknown']=(byCoin[r.cryptocurrency||'unknown']||0)+1; }); const sells=rows.filter(r=>r.type==='sell');
 return {feature:'tax-exposure-summary',aiGenerated:false,source:'deterministic-fallback',sections:[{label:'Transactions reviewed',value:rows.length},{label:'By type',value:byType},{label:'By coin',value:byCoin},{label:'Sell count',value:sells.length},{label:'Wash sale flagged',value:rows.filter(r=>r.washSaleFlagged).length},{label:'Has transactions',value:rows.length>0},{label:'Notes',value:''}]}; }
function harvestCandidates(rows){ rows=rows||[]; const sells=rows.filter(r=>r.type==='sell');
 return {feature:'harvest-candidates',aiGenerated:false,source:'deterministic-fallback',sections:[{label:'Transactions reviewed',value:rows.length},{label:'Sell count',value:sells.length},{label:'Sell detail',value:sells.slice(0,50).map(r=>({coin:r.cryptocurrency||'',totalValue:r.totalValue??0,date:r.date||''}))},{label:'Sell share',value:rows.length?Math.round(sells.length/rows.length*1000)/10:0}]}; }
function coinConcentration(rows){ rows=rows||[]; const byCoin={}; rows.forEach(r=>{ byCoin[r.cryptocurrency||'unknown']=(byCoin[r.cryptocurrency||'unknown']||0)+1; }); const top=Object.entries(byCoin).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([coin,count])=>({coin,count}));
 return {feature:'coin-concentration',aiGenerated:false,source:'deterministic-fallback',sections:[{label:'Transactions reviewed',value:rows.length},{label:'Coins',value:Object.keys(byCoin).length},{label:'Top coins',value:top},{label:'Top coin count',value:top.length?top[0].count:0}]}; }

module.exports={toCsv,providerConfigured,taxExposureSummary,harvestCandidates,coinConcentration};
