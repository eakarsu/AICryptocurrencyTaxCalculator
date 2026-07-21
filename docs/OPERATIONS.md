# Governed digital-asset tax operations

The launcher does not install, migrate, seed, start PostgreSQL, or kill port owners. Use `scripts/bootstrap.sh`, configure `.env`, run `scripts/migrate.sh`, then run `start.sh`. Demo seeding is separately guarded.

The governed ledger uses exact scaled integers, immutable external identifiers, linked transfers, price provenance, idempotent imports, effective-dated jurisdiction-rule versions, reconciliation snapshots, exception counts, calculation citations, optimistic transitions, independent tax-professional approval, and audit history. AES-256-GCM encryption now fails closed instead of storing plaintext when its key is absent. Production PostgreSQL verifies TLS certificates.

Exchange/wallet/indexer/price/accounting/export adapters require credentials, recorded cursors, retry/failure tests, and provider fixtures before enablement. The service never accepts wallet private keys. Tax-rule content, amended-history handling, filing formats and calculation results require jurisdiction-specific validation and a qualified tax professional; application tests do not constitute tax advice or filing certification.
