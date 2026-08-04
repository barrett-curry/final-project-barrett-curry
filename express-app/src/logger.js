// The app's logger.
//
// Four functions, in increasing order of "someone needs to know about this":
//   devLog -> noisy detail that is only useful while developing; silent in production
//   log    -> normal operational events (server started)
//   warn   -> something is off but the request continues
//   error  -> something failed and needs attention
//
// Why not just console.log? Three reasons this module exists:
//   1. `devLog` can be sprinkled freely without shipping noise to production.
//   2. Every line gets a timestamp and a level, so production output is greppable.
//   3. One place to change if we ever swap in a real log aggregator — callers
//      keep calling logger.error() and nothing else moves.

// Numeric priorities let LOG_LEVEL filter everything below the chosen level.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

// Resolved per call rather than cached at import time, so tests (and anything
// else that flips NODE_ENV/LOG_LEVEL at runtime) see the change immediately.
// Caching this at module load was tempting and would have been a bug: Jest sets
// NODE_ENV after the imports have already run.
function threshold() {
  const override = process.env.LOG_LEVEL;
  if (override && LEVELS[override] !== undefined) return LEVELS[override];

  const env = process.env.NODE_ENV || "development";
  // Tests assert on behavior, not output: staying quiet keeps expected error
  // paths from filling the reporter with stack traces that are not failures.
  if (env === "test") return LEVELS.silent;
  // Production drops debug; everything info and above is kept.
  if (env === "production") return LEVELS.info;
  return LEVELS.debug;
}

export function isEnabled(level) {
  return LEVELS[level] >= threshold();
}

// console.error for warn/error so they land on stderr, where hosting platforms
// and log collectors expect problems to be.
function emit(level, consoleMethod, args) {
  if (!isEnabled(level)) return;
  consoleMethod(`[${new Date().toISOString()}] [${level.toUpperCase()}]`, ...args);
}

/** Development-only detail. Safe to leave in the code rather than deleting it. */
export function devLog(...args) {
  emit("debug", console.log, args);
}

export function log(...args) {
  emit("info", console.log, args);
}

export function warn(...args) {
  emit("warn", console.error, args);
}

export function error(...args) {
  emit("error", console.error, args);
}

export { LEVELS };

export default { devLog, log, warn, error, isEnabled, LEVELS };
