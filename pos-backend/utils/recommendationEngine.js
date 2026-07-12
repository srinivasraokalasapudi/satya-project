// Lightweight, dependency-free recommendation engine built on order
// history that already lives in Mongo. No external AI API key is
// required, so this works out of the box; it combines three classic
// recommendation signals:
//
//   1. Personal favorites - items this specific customer re-orders often.
//   2. Frequently bought together - association mining ("customers who
//      ordered X also ordered Y") over everyone's order history, scoped
//      to whatever is currently in the cart.
//   3. Trending now - most-ordered items store-wide in the recent window,
//      used as a cold-start fallback when we have no personal signal yet.
//
// Results from all three signals are merged and de-duplicated into a
// single ranked list, each tagged with the reason it was picked.

const Order = require("../models/orderModel");

const RECENT_WINDOW_DAYS = 30;
const MAX_RECOMMENDATIONS = 8;

const normalizeName = (name) => (name || "").trim().toLowerCase();

// Top items a specific customer keeps re-ordering.
const getPersonalFavorites = async (customerId, excludeSet, limit = 5) => {
  if (!customerId) return [];

  const rows = await Order.aggregate([
    { $match: { customer: customerId } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        qty: { $sum: { $ifNull: ["$items.quantity", 1] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: limit + excludeSet.size },
  ]);

  return rows
    .filter((r) => r._id && !excludeSet.has(normalizeName(r._id)))
    .slice(0, limit)
    .map((r) => ({
      name: r._id,
      reason: "One of your favorites",
      source: "personal",
      weight: 3 + Math.min(r.orders, 5) * 0.1,
    }));
};

// "Frequently bought together" - looks at every order that contains at
// least one of the items currently in the cart, then tallies whatever
// else showed up alongside them.
const getFrequentlyBoughtTogether = async (cartNames, excludeSet, limit = 6) => {
  if (!cartNames.length) return [];

  const rows = await Order.aggregate([
    { $match: { "items.name": { $in: cartNames } } },
    { $unwind: "$items" },
    { $match: { "items.name": { $nin: cartNames } } },
    {
      $group: {
        _id: "$items.name",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit + excludeSet.size },
  ]);

  return rows
    .filter((r) => r._id && !excludeSet.has(normalizeName(r._id)))
    .slice(0, limit)
    .map((r) => ({
      name: r._id,
      reason: "Pairs well with your order",
      source: "pairing",
      weight: 4 + Math.min(r.count, 10) * 0.1,
    }));
};

// Store-wide popularity over a recent window. This is what a brand new
// customer sees before we have any personal data on them at all.
const getTrendingNow = async (excludeSet, limit = 6) => {
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await Order.aggregate([
    { $match: { orderDate: { $gte: since } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        qty: { $sum: { $ifNull: ["$items.quantity", 1] } },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: limit + excludeSet.size },
  ]);

  return rows
    .filter((r) => r._id && !excludeSet.has(normalizeName(r._id)))
    .slice(0, limit)
    .map((r) => ({
      name: r._id,
      reason: "Trending now",
      source: "trending",
      weight: 1 + Math.min(r.qty, 20) * 0.05,
    }));
};

/**
 * Builds a ranked list of recommended dish names.
 *
 * @param {Object} opts
 * @param {mongoose.Types.ObjectId|null} opts.customerId - logged-in diner, if any.
 * @param {string[]} opts.cartNames - names of items already in the cart.
 * @param {number} opts.limit - max recommendations to return.
 */
const buildRecommendations = async ({ customerId, cartNames = [], limit = MAX_RECOMMENDATIONS }) => {
  const excludeSet = new Set(cartNames.map(normalizeName));

  const [pairing, personal, trending] = await Promise.all([
    getFrequentlyBoughtTogether(cartNames, excludeSet),
    getPersonalFavorites(customerId, excludeSet),
    getTrendingNow(excludeSet),
  ]);

  const merged = new Map();

  for (const item of [...pairing, ...personal, ...trending]) {
    const key = normalizeName(item.name);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, item);
    } else if (item.weight > existing.weight) {
      // Keep the highest-weighted reason, but note it also matched
      // another signal so the UI can show a richer badge if it wants.
      merged.set(key, { ...item, alsoMatched: existing.source });
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map(({ name, reason, source }) => ({ name, reason, source }));
};

module.exports = { buildRecommendations };
