// reportUtils.js
// Formatting helpers + a demo-data generator for the Reports section.
// The generator is only used as a *fallback* when the /api/reports/*
// endpoints are unreachable (e.g. backend not running yet), so the UI
// always renders something meaningful instead of breaking.

export const formatCurrency = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const formatCompact = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const rand = (min, max) => Math.round(min + Math.random() * (max - min));

const buildSeries = (count, min, max, labelFn) =>
  Array.from({ length: count }, (_, i) => ({
    label: labelFn(i),
    value: rand(min, max),
  }));

export const PERIOD_META = {
  live: {
    title: "Live",
    subtitle: "Real-time snapshot \u00b7 auto-refreshes every 15s",
    goalLabel: "Today's Revenue Target",
    chartLabel: "Last 12 hours",
  },
  daily: {
    title: "Daily",
    subtitle: "Last 7 days of restaurant performance",
    goalLabel: "Weekly Revenue Target",
    chartLabel: "Revenue by day",
  },
  weekly: {
    title: "Weekly",
    subtitle: "Last 6 weeks of restaurant performance",
    goalLabel: "Monthly Revenue Target",
    chartLabel: "Revenue by week",
  },
  monthly: {
    title: "Monthly",
    subtitle: "Last 6 months of restaurant performance",
    goalLabel: "Yearly Revenue Target",
    chartLabel: "Revenue by month",
  },
};

// Demo fallback for the Recent Activity feed, used only when
// /api/order/recent is unreachable so the widget still renders something
// meaningful instead of an empty state during local development/demos.
export const generateMockActivity = () => {
  const statuses = ["In Progress", "Ready", "Completed"];
  const dishes = ["Butter Chicken", "Paneer Tikka", "Dal Makhani", "Biryani", "Tandoori Platter"];
  const now = Date.now();
  return Array.from({ length: 5 }, (_, i) => ({
    id: `demo-${i}`,
    title: `Table ${rand(1, 18)} · ${dishes[rand(0, dishes.length - 1)]}`,
    status: statuses[rand(0, statuses.length - 1)],
    time: new Date(now - i * rand(4, 20) * 60000).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
};

export const generateMockReport = (period) => {
  const now = new Date();

  if (period === "live") {
    const chart = buildSeries(12, 1500, 9500, (i) => {
      const h = new Date(now);
      h.setHours(now.getHours() - (11 - i), 0, 0, 0);
      const hour12 = h.getHours() % 12 === 0 ? 12 : h.getHours() % 12;
      return `${hour12}${h.getHours() >= 12 ? "P" : "A"}`;
    });
    const revenue = chart.reduce((s, d) => s + d.value, 0);
    return {
      period,
      revenue,
      orders: Math.max(1, Math.round(revenue / 850)),
      activeTables: rand(3, 12),
      avgPrepTime: rand(9, 18),
      goal: 150000,
      growth: +(rand(-8, 22)).toFixed(1),
      chart,
      topItems: [
        { name: "Butter Chicken", orders: rand(8, 24) },
        { name: "Paneer Tikka", orders: rand(6, 20) },
        { name: "Dal Makhani", orders: rand(5, 18) },
      ],
    };
  }

  if (period === "daily") {
    const chart = buildSeries(7, 55000, 125000, (i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d.toLocaleDateString("en-IN", { weekday: "short" });
    });
    const revenue = chart.reduce((s, d) => s + d.value, 0);
    const best = chart.reduce((a, b) => (b.value > a.value ? b : a));
    return {
      period,
      revenue,
      orders: Math.max(1, Math.round(revenue / 900)),
      bestDay: best.label,
      goal: 700000,
      growth: +(rand(-5, 20)).toFixed(1),
      chart,
      topItems: [
        { name: "Butter Chicken", orders: rand(60, 140) },
        { name: "Paneer Tikka", orders: rand(45, 120) },
        { name: "Biryani", orders: rand(50, 110) },
      ],
    };
  }

  if (period === "weekly") {
    const chart = buildSeries(6, 380000, 640000, (i) => `W${i + 1}`);
    const revenue = chart.reduce((s, d) => s + d.value, 0);
    return {
      period,
      revenue,
      orders: Math.max(1, Math.round(revenue / 900)),
      goal: 2800000,
      growth: +(rand(-4, 16)).toFixed(1),
      chart,
      topItems: [
        { name: "Butter Chicken", orders: rand(300, 600) },
        { name: "Biryani", orders: rand(280, 560) },
        { name: "Tandoori Platter", orders: rand(200, 480) },
      ],
    };
  }

  // monthly
  const chart = buildSeries(6, 1500000, 2400000, (i) => {
    const d = new Date(now);
    d.setMonth(now.getMonth() - (5 - i));
    return d.toLocaleDateString("en-IN", { month: "short" });
  });
  const revenue = chart.reduce((s, d) => s + d.value, 0);
  return {
    period,
    revenue,
    orders: Math.max(1, Math.round(revenue / 900)),
    goal: 12000000,
    growth: +(rand(-3, 25)).toFixed(1),
    chart,
    topItems: [
      { name: "Butter Chicken", orders: rand(1200, 2400) },
      { name: "Biryani", orders: rand(1100, 2200) },
      { name: "Tandoori Platter", orders: rand(900, 1900) },
    ],
  };
};
