const router = require('express').Router();

router.post('/score', (req, res) => {
  const { lossTrades = 0, rebuyWithin30Days = 0, relatedWalletTransfers = 0, sameAssetPairs = 0 } = req.body || {};
  const score = Math.min(100, Math.round(
    Number(lossTrades) * 5 +
    Number(rebuyWithin30Days) * 16 +
    Number(relatedWalletTransfers) * 9 +
    Number(sameAssetPairs) * 7
  ));
  res.json({
    feature: 'wash_sale_exposure',
    score,
    level: score >= 70 ? 'tax-review' : score >= 35 ? 'document' : 'low',
    actions: [
      Number(rebuyWithin30Days) > 0 && 'Document economic intent for repurchases near loss disposals.',
      Number(relatedWalletTransfers) > 0 && 'Trace related-wallet transfers around loss windows.',
      Number(sameAssetPairs) > 2 && 'Review same-asset harvesting cadence with tax advisor.',
    ].filter(Boolean),
  });
});

module.exports = router;
