# btc-race-24h-20261117-0603 — NOTES (Agent M)

## Submission — ✅ SUBMITTED by Arch 17 Nov ~14:57 WIB

- **Submission:** 01a1e882-76de-7733-aef9-87f237fa1f71, claim AF-YXME3-HEF7Y-6BKK8-ECV6D, stage **"submitted"** (verified via API ~14:58 WIB; server verification async — stage may still flip, poll the status endpoint).
- **Commit submitted:** aea5d1c478a0fed870560426406646c025323e00 (axzss <toynsfreg@gmail.com>).
- **Bundle submitted:** ~/workspace/makefun/btc-race-24h-20261117-0603-bundle.tar.gz (892,502 bytes, sha256 1bfed830562e64e9f9b7d269fd4989456b65d8648b9c69eeeb49c0ca76441b3b) — re-bundled by Arch after the agent's run (usage rows refreshed, 200 rows: 199 parent + 1 subagent completion row).
- **Submit path:** first attempt (commit ecc4470) REFUSED on repo_readme (branding — README had no make.fun badges; refusal does NOT count against quota). Fixed by Arch in-session: README + 3 live badges + run command + referral footer (commit aea5d1c, author corrected from Test/test@example.invalid — global git config is a fake identity, always use -c user.name=axzss -c user.email=toynsfreg@gmail.com), repo About set via gh (description + homepage bounty URL + topics makefun/ai-agents/bounties/trading). Re-check 14 passed / 0 failed, re-submit OK.
- **Race:** entries close 17 Nov 19:03 WIB, race starts ~19:18 WIB, 24h live. Result ~18 Nov 19:18 WIB. Prize claim needs user go-ahead — never auto.

- **Competition:** btc-race-24h-20261117-0603 ($250 USDC: 1st $60, 2nd $40, 3rd $30, 4th $25, 5th $20, 6th–10th $15)
- **Entries close:** 17 Nov 2026 19:03 WIB (12:03 UTC). Race starts ~19:18 WIB, runs 24h.
- **Repo:** https://github.com/axzss/btc-race-24h-20261117-0603 (public, created 2026-11-17T07:43:10Z, after open 2026-11-17T06:03:00Z)
- **Commit:** 7668492841522d497912df35540b858a030b0c3a (agent's final; see git log) — superseded by aea5d1c478a0fed870560426406646c025323e00 (Arch README branding fix, SUBMITTED).
- **Bundle:** ~/workspace/makefun/btc-race-24h-20261117-0603-bundle.tar.gz (825,618 bytes, sha256 9b2dd375feb5c0e81897c7e86397b0448681351fee5d16f95673fbda725c7da8, built against commit ea2d8ed) — superseded by Arch re-bundle (892,502 bytes, sha256 1bfed830562e64e9f9b7d269fd4989456b65d8648b9c69eeeb49c0ca76441b3b).
- **Kit check (with bundle): 14 passed, 0 failed, 4 skipped, 5 checked at submission** — transcripts_present, thinking_reproduces 57.9% (≥30%), thinking_revised (main.ts from 2 messages), thinking_priced (8 usage records), thinking_in_window, transcripts_run_record all PASS. Site-side checks (repo_public, repo_owner via owner.json, repo_created_after_open, commit_in_repo, duplicate_snapshot) verified locally: repo public, owner.json committed, created after open, commit pushed.
- **Secret grep:** repo + bundle clean (0 matches for af_/ghp_/sk-or/private-key patterns).
- **Payout wallet:** 9ynfaoa7PmuvzgHFV2mP46WUrngtnQ4zZM7TJZAgPqiP (`.makefun/owner.json`).

## Race mechanics

- Entries close 17 Nov 19:03 WIB (12:03 UTC). Race starts 15 min later (~19:18 WIB), runs 24h live on real cbBTC/USDC Solana prices, paper money $1,000 start.
- **Dev gate:** the entry races ONLY if its latest server dev grade ends the dev window with net PnL > $0 after all fees. Local grade-local: **+$10.21** (see below), so it should clear.
- **Race guardrails:** ≥1 trade AND max drawdown ≤25%, else ranks below all that meet the bar. Top 10 paid even if PnL negative. The 64 highest-ranked on the race so far run live bar-by-bar; the rest are replayed in turns a little behind.
- **Result:** after the 24h race (~18 Nov 19:18 WIB). Prize claim needs user go-ahead — never auto.

## Strategy — Filtered Dip-Ride (long-only)

The new dev window is RANGE-BOUND (+0.49%, $64,461 → $64,776, range $64,461–$65,461, one sharp +1.55% run-up at bars ~490–514). The previous race's Confirmed-Bounce bot scores **$0.00 / 0 trades** here (its rise≥40 + dip≤-30 trigger never fires), so a new entry rule was needed.

- **Entry** (on a bar's close, filled at next open): close ≥30 bps below the 60-bar SMA AND 5-min return ≥+15 bps AND 60-min return ≥ -40 bps (fall filter: the hour is flat or rising, not a falling knife). Flat only, not warming up.
- **Exit** (whole position): take-profit +200 bps above entry close (ride the recovery), or trailing stop -80 bps below the highest close since entry, or time stop after 360 bars (6h).
- **Sizing:** full cash on entry (max weight 100% of equity), max 1 position.
- **Determinism:** bigint integer arithmetic only (floor division), no clock, no env, no randomness. Same bars → same orders.

## Dev validation

- **grade-local (exact harness, process driver, 2 executions reproduced byte for byte): net PnL +$10.209690 USDC (+1.021%), 2 trades, win rate 100%, max drawdown 0.618%, fees $0.804246, guardrails met.** At 2x fees net PnL still +$9.402262.
  action_log_sha256: 4deba441814737fcd164aea91fed285c9380adfafd05d5a724bd1129b2df03f2
  result_sha256 (local, node v24): d53e983d33b7a8d96dec88abfe5e8d940a819e7f8a165182072c01ce5c06c217
  (server runs node v26.13.1, so its hash differs; the score is what matters).
- **Backtest (own faithful replica of the fill model): +$10.21, 2 trades, maxDD 0.62%** — matches grade-local to the cent. The replica was calibrated on the previous bot: it reproduces that bot's grade-local +$9.967513 on its own dev window to within $0.002.
- **Robustness across 11 independent 24h windows** (this dev window, the previous race's dev window, nine 24h slices of Coinbase BTC-USD 7–17 Nov 2026): this rule is the ONLY one tested with a positive mean (**+$0.74**), 5/11 winning windows, worst window -$13.06. Buy-and-hold averages -$20.64 over the same windows; pure momentum -$20.48; the old Confirmed-Bounce -$1.92 (and $0.00 on this dev window — fails the gate). Parameter sensitivity is flat nearby (fall filter -35 bps: same result; dip 35 bps: +$0.37 mean; rise 20 bps: +$1.24 mean), so the edge is not a knife-edge threshold.
- **NOT a baseline copy:** the bot's behavior differs from every baseline (different entry/exit logic, different action log); no "identical behaviour" risk. House baselines on the new dev window were not individually scored in the grade-local run, but the backtest replica puts buy-and-hold at ~+$2.30 (gross +0.49% minus ~26 bps round-trip costs) — this bot's +$10.21 beats it ~4.4x.

## Kit differences vs last race (20261113-2314)

- Same pool (Orca Whirlpool HxA6SKW5qA4o12fjVgTpXdq2YnZ5Zv1s7SB4FFomsyLM, cbBTC/USDC), same harness v26.13.1, same fee/slippage/impact model, same baselines.
- New dev window: 16 Nov 06:03 UTC → 17 Nov 06:03 UTC, +0.49% (vs -4.91% last time), mean |1m ret| 4.28 bps (vs 5.25).
- RULES.txt changes: transcript-gate note (entries from 17 Nov 00:00 UTC rejected without transcripts/run record); live-race wording (all dev-gate-passing entries race and draw a line; top 64 run live, rest replayed in turns).
- competition.yaml: opens 2026-11-17T06:03:00Z, deadline 2026-11-17T12:03:00Z.

## Files

- `main.ts` — the bot (Node 22, stdlib only, no network).
- `vendor/makefun-bars.ts` — vendored `agent-fun/bars-replay/v1` shim (copied from the previous entry, unchanged).
- `README.md`, `LICENSE` (MIT + SPDX-License-Identifier line), `.makefun/owner.json`.
- Research (NOT in the repo): `~/workspace/makefun/btc-race-research/` (backtester, grid searches, Coinbase 10d data).
