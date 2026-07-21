# Completeness Review: AICryptocurrencyTaxCalculator

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Prototype-demo**

## Verdict

The repository presents a broad digital-asset tax accounting surface (99 source files and 27 route modules), but static evidence is characteristic of a generated prototype. Pages and endpoints demonstrate concepts; they do not establish a verified execution path to ingest wallets/exchanges, normalize transactions, identify lots, classify events, calculate gains/income, reconcile, and produce reviewable filings.

## Why it is not complete

- 14 files are explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- The route/page inventory includes `ai center`, `ai new`, `audit`, `compliance`; these surfaces show breadth but not durable execution against authoritative systems.
- 26 files reference model-provider or chat-completion behavior; generic LLM calls are not a substitute for deterministic domain execution, grounding, or evaluation.
- 19 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- No recognizable application test files were found in the inspected tree.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to ingest wallets/exchanges, normalize transactions, identify lots, classify events, calculate gains/income, reconcile, and produce reviewable filings.
- 2. Connect exchange/wallet APIs, chain indexers, price data, accounting, identity, and tax-export systems; replace seed/demo records with durable synchronized data and explicit failure handling.
- 3. Test transfers, fees, forks, staking, NFTs, lot methods, valuations, reconciliation, and amended histories.
- 4. Encrypt financial data, version jurisdiction rules, cite every calculation, and require tax-professional review.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- Credential/secret fallback or demo-password patterns occur in 4 files and must be removed or made development-only.
- TLS certificate verification is disabled in inspected code; this is a release blocker.
- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `backend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `frontend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `backend/src/index.js` — service composition, middleware, and registered routes.
- `backend/src/models/index.js` — service composition, middleware, and registered routes.
- `frontend/src/index.js` — service composition, middleware, and registered routes.
- `backend/src/routes/aiCenter.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Treat this as a prototype: use ai center and ai new to select one narrow digital-asset tax accounting outcome, quarantine generated gap routes, and implement that outcome end to end with real data, deterministic rules, and tests before adding features.

## Implementation progress

- **Needed feature 1 — implemented locally:** `taxLedgerPolicy.js`, `governedTaxRuns.js`, and migration `20260718000001-governed-tax-ledger.js` provide idempotent source imports, exact scaled-integer quantities/values, linked transfers, valuation provenance, durable ledger events, FIFO/LIFO/HIFO lot selection, reconciliation state, calculation lines, review, approval and export gates.
- **Needed feature 2 — integration boundary implemented; providers remain external:** provider cursor/attempt/failure state and encrypted raw-source boundaries support exchange, wallet, indexer and price adapters without accepting private keys. Generated gap routers are unmounted. Credentials, licensed price data, accounting/export contracts and replay fixtures remain external blockers.
- **Needed features 3–4 — governed locally:** tests cover exact decimals, transfers, valuation evidence, rewards, lot methods and insufficient lots; calculations require jurisdiction, tax year, effective rule version and citations; approval requires an independent tax professional. AES-256-GCM now fails closed instead of storing plaintext, and production TLS certificate verification is enabled. Fork, NFT, staking, fee, amended-history and jurisdiction results still need professional case sets.
- **Needed feature 5 / launch blockers — implemented locally:** strict database/JWT/encryption configuration, non-destructive startup, separate bootstrap/migration/guarded seed, `.env.example`, CI and operations documentation replace port killing, runtime installs, database creation and automatic seed behavior.
- **Validation:** 4/4 policy tests passed; changed JavaScript passed `node --check`; package JSON parsed; shell scripts passed `bash -n`; and diffs passed whitespace checks on 2026-07-18. No service, database, exchange/wallet/indexer/price/accounting provider, filing system, or tax calculation was run; tax-professional validation remains mandatory and classification remains **Prototype-demo**.

## Runtime acceptance (2026-07-20)

- The first runtime attempt failed before listeners were owned because shell-sourcing the generated `.env` misparsed values containing spaces.
- The launcher now lets the backend parse `.env`, the frontend honors the assigned port, and authenticated `GET /api/auth/me` reloads only safe session identity fields. A test-only encryption key is supplied solely when `NODE_ENV=test`; non-test execution still fails closed without `ENCRYPTION_KEY`.
- A fresh disposable PostgreSQL instance and both services passed `startup_login_session_api`: startup, login, persisted-session lookup, and authenticated API access were verified on PostgreSQL `55549`, API `5918`, and UI `5919`.
- No exchange, wallet, chain indexer, price source, filing integration, or tax conclusion was validated; tax-professional review remains mandatory.
