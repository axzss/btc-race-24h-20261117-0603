# btc-race-24h — Filtered-Dip Long-Only BTC Bot

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/axzss/btc-race-24h-20261117-0603/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/axzss/btc-race-24h-20261117-0603/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

Entry for the make.fun competition `btc-race-24h-20261117-0603`: race a BTC
trading bot live for 24 hours on paper money. The bot trades cbBTC vs USDC
on Solana, long-only, starting from $1,000.

## Strategy

The dev window is range-bound, not trending: BTC ends +0.49% after chopping
between $64,461 and $65,461, with one sharp +1.55% run-up. The previous
race's confirmed-bounce bot scores $0.00 / 0 trades here (its trigger never
fires), so this bot buys shallow dips inside a **non-falling hour** and then
**rides** the recovery instead of scalping it.

**Entry** (all four must hold, on a bar's close, filled at the next open):

1. Oversold: the close is >= 30 bps below the 60-bar simple moving average
   (buying the dip, not chasing a top).
2. Turning up: the close is >= 15 bps above the close 5 bars ago (the dip
   has started to bounce).
3. Not falling: the close is no more than 40 bps below the close 60 bars
   ago (the hour is flat or rising; a sharper 60-minute fall means the
   market is trending down and the dip is a falling knife).
4. Flat (no open position) and not warming up.

**Exit** (whole position, on a bar's close):

- Take profit: +200 bps above the entry close (ride the recovery), or
- Trailing stop: -80 bps below the highest close since entry, or
- Time stop: held for 360 bars (6h) without hitting either.

## Dev result

Backtest (faithful replica of the replay fill model, verified to reproduce
the previous bot's grade-local +$9.967513 on its own dev window to within
$0.002): **net PnL +$10.21 USDC, 2 trades, max drawdown 0.62%**.

Across 11 independent 24h windows (this dev window, the previous race's
dev window, and nine 24h slices of Coinbase BTC-USD 7–17 Nov 2026) this
rule is the only one tested with a positive mean (**+$0.74**), 5/11 winning
windows, and a worst window of -$13.06. Buy-and-hold averages -$20.64 over
the same windows and pure momentum -$20.48. Parameter sensitivity is flat
nearby (fall filter -35 bps: same result; dip 35 bps: +$0.37 mean; rise
20 bps: +$1.24 mean), so the edge is not a knife-edge threshold.

Exact grade-local numbers (exact harness) are recorded in NOTES.md.

## Implementation

- `main.ts` — the bot (Node 22, standard library only, no network).
  Uses the vendored `agent-fun/bars-replay/v1` shim in `vendor/`.
- Determinism: bigint integer arithmetic only (floor division), no clock,
  no environment, no randomness. The same bars give the same orders, run
  after run.
- Position sizing: full cash on entry (max weight is 100% of equity),
  whole position on exit. At most 1 open position, at most 1 order per bar.

## Run it

```sh
node cli/makefun.mjs grade-local --kit . --bot <repository> --driver docker
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=1409h78a&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>

## License

MIT. See `LICENSE`.
