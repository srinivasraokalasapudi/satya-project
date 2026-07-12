// Small dependency-free fixed-window rate limiter. Good enough to blunt
// accidental retry storms and basic abuse against payment endpoints
// without pulling in a new package for a single-process POS backend.
//
// For a multi-instance deployment this would need a shared store (e.g.
// Redis) instead of an in-memory Map, since each instance would
// otherwise track its own counters.

const createRateLimiter = ({ windowMs, max, message }) => {
  const hits = new Map(); // key -> { count, resetAt }

  // Periodically drop expired entries so the map doesn't grow forever.
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    // Prefer the authenticated identity when we have one so one IP with
    // many diners (e.g. shared restaurant wifi) doesn't get lumped
    // together; fall back to IP for unauthenticated requests.
    const key = req.customer?._id?.toString() || req.user?._id?.toString() || req.ip;

    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      res.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000).toString());
      return res.status(429).json({
        success: false,
        message: message || "Too many requests, please try again shortly.",
      });
    }

    entry.count += 1;
    next();
  };
};

module.exports = { createRateLimiter };
