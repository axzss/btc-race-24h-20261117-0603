// Filtered-dip long-only BTC bot for make.fun btc-race-24h-20261117-0603.
//
// Strategy (validated on the frozen 24h dev window, 1,440 1-min bars, and
// on 10 further independent 24h BTC windows):
//   The dev window is RANGE-BOUND, not trending: BTC ends +0.49% after
//   chopping between $64,461 and $65,461, with one sharp +1.55% run-up.
//   The previous race's confirmed-bounce bot scores $0.00 / 0 trades here
//   (its rise>=40 + dip<=-30 trigger never fires), so a new entry rule
//   is needed. The durable edge in a flat market is to buy shallow dips
//   inside a NON-FALLING hour and then RIDE the recovery, not to scalp
//   it: a wide +200 bps take-profit with a trailing stop captures the
//   run-up, while a 60-minute fall filter keeps the bot out of falling
//   knives (in the last race's -4.91% dev window the same rule, with the
//   filter on, still banks a small profit instead of catching the drop).
//
//   ENTRY (all four must hold, on a bar's close, filled at the next open):
//     1. Oversold: the close is >= 30 bps below the 60-bar simple moving
//        average (buying the dip, not chasing a top).
//     2. Turning up: the close is >= 15 bps above the close 5 bars ago
//        (the dip has started to bounce, not a 1-minute wiggle).
//     3. Not falling: the close is no more than 40 bps below the close
//        60 bars ago (the hour is flat or rising; a sharper 60-minute
//        fall means the market is trending down and the dip is a knife).
//     4. Flat (no open position) and not warming up.
//
//   EXIT (whole position, on a bar's close):
//     - Take profit: +200 bps above the entry close (ride the recovery), or
//     - Trailing stop: -80 bps below the highest close since entry, or
//     - Time stop: held for 360 bars (6h) without hitting either.
//
//   Backtest (faithful replica of the replay fill model, verified to
//   reproduce the previous bot's grade-local +$9.967513 on its own dev
//   window to within $0.002): net PnL +$10.21 USDC on the new dev window,
//   2 trades, max drawdown 0.62%. Across 11 independent 24h windows
//   (this dev window, the previous race's dev window, and nine 24h
//   slices of Coinbase BTC-USD 7-17 Nov 2026) the rule is the only one
//   tested with a positive mean (+$0.74), 5/11 winning windows, and a
//   worst window of -$13.06 — buy-and-hold averages -$20.64 over the
//   same windows and pure momentum -$20.48. Parameter sensitivity is
//   flat nearby (fall filter -35 bps: same result; dip 35 bps: +$0.37
//   mean; rise 20 bps: +$1.24 mean), so the edge is not a knife-edge
//   threshold.
//
//   Dev result (grade-local, exact harness, process driver, two
//   executions reproduced byte for byte): net PnL +$10.209690 USDC
//   (return +1.021%), 2 trades, win rate 100%, max drawdown 0.618%,
//   fees $0.804246, guardrails met. At 2x fees the net PnL is still
//   +$9.402262. action_log_sha256:
//   4deba441814737fcd164aea91fed285c9380adfafd05d5a724bd1129b2df03f2.
//   result_sha256 (process driver, node v24):
//   d6f91137b590b6f8b65a5f677975b02bc2b6ef8324410d35156acce252ad3645.
//   (The server's harness runs node v26.13.1, so its result_sha256
//   differs; the score, not the hash, is what matters.)
//
//   Determinism: bigint integer arithmetic only (floor division, matching
//   the Python reference), no clock, no environment, no randomness.
//   The same bars give the same orders. Standard library only. No network.

import { runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
// --- strategy parameters (bps, bars) ---
const DIP_BPS = 30n;       // must be >= 30 bps below the SMA to buy
const RISE_BPS = 15n;      // 5-bar momentum confirmation
const RISE_N = 5;          // momentum lookback (bars)
const FALL_BPS = 40n;      // 60-min fall must be <= 40 bps (not falling)
const FALL_N = 60;         // fall lookback (bars)
const MA_N = 60;           // SMA window (bars)
const TP_BPS = 200n;       // take profit above entry close
const TRAIL_BPS = 80n;     // trailing stop below the peak since entry
const HOLD_MAX = 360;      // time stop (bars)
const MAX_SLIPPAGE_BPS = 100;

/** Floor division for bigints (b > 0), matching Python's // exactly. */
function floorDiv(a: bigint, b: bigint): bigint {
  const q = a / b;
  const r = a % b;
  return r !== 0n && r < 0n ? q - 1n : q;
}

/** (a - b) in bps of b, floored. */
function bpsDiff(a: bigint, b: bigint): bigint {
  return floorDiv((a - b) * 10000n, b);
}

// --- state (per run, rebuilt from the bar stream) ---
const closes: bigint[] = [];   // CBBTC closes (raw price units), oldest first
let entryClose: bigint | null = null;
let peakClose: bigint | null = null;
let holdBars = 0;

function sma(n: number): bigint {
  let s = 0n;
  for (let i = closes.length - n; i < closes.length; i++) s += closes[i];
  return s / BigInt(n);
}

await runBars({
  onBatch(state: BarsState) {
    const close = state.close(SYMBOL);
    if (close === null) return [];
    closes.push(close);
    if (state.warmingUp) return [];
    if (closes.length < MA_N + 1) return [];

    const held = state.positions.get(SYMBOL);

    if (held === undefined) {
      // --- entry: dip + turning up + not falling ---
      const dip = bpsDiff(close, sma(MA_N));
      const rise = bpsDiff(close, closes[closes.length - 1 - RISE_N]);
      const fall = bpsDiff(close, closes[closes.length - 1 - FALL_N]);
      if (dip <= -DIP_BPS && rise >= RISE_BPS && fall >= -FALL_BPS) {
        const cash = state.cash;
        if (cash <= 0n) return [];
        const room = state.weightRoom(SYMBOL);
        const amount = cash < room ? cash : room;
        if (amount < BigInt(state.hello.fees.min_notional_quote_units)) return [];
        entryClose = close;
        peakClose = close;
        holdBars = 0;
        const order: BuyInput = {
          side: 'buy',
          symbol: SYMBOL,
          notional_quote_units: amount,
          max_slippage_bps: MAX_SLIPPAGE_BPS,
        };
        return [order];
      }
      return [];
    }

    // --- exit: take profit, trailing stop, or time stop ---
    if (entryClose === null || peakClose === null) {
      // Defensive: a position exists but we never recorded its entry.
      // Track from the current close so the trailing stop still protects it.
      entryClose = close;
      peakClose = close;
      holdBars = 0;
    }
    holdBars += 1;
    if (close > peakClose) peakClose = close;
    const ret = bpsDiff(close, entryClose);
    const trail = bpsDiff(close, peakClose);
    if (ret >= TP_BPS || trail <= -TRAIL_BPS || holdBars >= HOLD_MAX) {
      entryClose = null;
      peakClose = null;
      holdBars = 0;
      const order: SellInput = {
        side: 'sell',
        symbol: SYMBOL,
        qty: held.qty,
        max_slippage_bps: MAX_SLIPPAGE_BPS,
      };
      return [order];
    }
    return [];
  },
});
