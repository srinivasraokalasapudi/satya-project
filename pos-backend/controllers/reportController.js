const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");
const Stats = require("../models/statsModel");

const startOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const startOfWeek = (date = new Date()) => {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = value.getDate() - day + (day === 0 ? -6 : 1);
  value.setDate(diff);
  return value;
};

const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const formatDay = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const formatMonth = (date) =>
  date.toLocaleDateString("en-US", { month: "short" });

const getStats = async () => {
  let stats = await Stats.findOne();

  if (!stats) {
    stats = await Stats.create({
      totalEarnings: 0,
      totalOrders: 0,
    });
  }

  return stats;
};

const sumOrders = async (from, to) => {
  const result = await Order.aggregate([
    {
      $match: {
        orderStatus: "Completed",
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: {
            $ifNull: ["$bills.totalWithTax", 0],
          },
        },
        tax: {
          $sum: {
            $ifNull: ["$bills.tax", 0],
          },
        },
        orders: {
          $sum: 1,
        },
      },
    },
  ]);

  return {
    revenue: result[0]?.revenue || 0,
    tax: result[0]?.tax || 0,
    orders: result[0]?.orders || 0,
  };
};

const sumPayments = async (from, to) => {
  const result = await Payment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 },
      },
    },
  ]);

  return {
    revenue: result[0]?.revenue || 0,
    orders: result[0]?.orders || 0,
  };
};

const mergeTotals = async (from, to) => {
  const [orders, payments] = await Promise.all([
    sumOrders(from, to),
    sumPayments(from, to),
  ]);

  return {
    revenue: orders.revenue,
    tax: orders.tax,
    orders: orders.orders,
};
};

const getTopItems = async (from, to, limit = 5) =>
  Order.aggregate([
    {
      $match: {
    orderStatus: "Completed",
    createdAt: {
        $gte: from,
        $lte: to,
    },
},
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        name: { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$items.quantity", "$items.price"],
          },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);

const getPaymentBreakdown = async (from, to) =>
  Payment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: "$method",
        method: { $first: "$method" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

const getDashboardReport = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const stats = await getStats();

    const [daily, weekly, monthly, topItems, payments] = await Promise.all([
      mergeTotals(todayStart, todayEnd),
      mergeTotals(weekStart, todayEnd),
      mergeTotals(monthStart, todayEnd),
      getTopItems(monthStart, todayEnd),
      getPaymentBreakdown(monthStart, todayEnd),
    ]);

    res.json({
      success: true,
      summary: {
        dailySales: daily.revenue,
        weeklySales: weekly.revenue,
        monthlySales: monthly.revenue,
        revenue: stats.totalEarnings || monthly.revenue,
        tax: monthly.tax,
        orders: monthly.orders,
      },
      sales: [
        { label: "Daily", value: daily.revenue, orders: daily.orders },
        { label: "Weekly", value: weekly.revenue, orders: weekly.orders },
        { label: "Monthly", value: monthly.revenue, orders: monthly.orders },
      ],
      payments,
      topItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDailySales = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days) || 7, 31));
    const chart = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const totals = await mergeTotals(startOfDay(date), endOfDay(date));

      chart.push({
        label: formatDay(date),
        date,
        value: totals.revenue,
        orders: totals.orders,
        tax: totals.tax,
      });
    }

    const total = chart.reduce(
      (sum, point) => ({
        revenue: sum.revenue + point.value,
        orders: sum.orders + point.orders,
        tax: sum.tax + point.tax,
      }),
      { revenue: 0, orders: 0, tax: 0 }
    );

    res.json({
      success: true,
      data: {
        revenue: total.revenue,
        orders: total.orders,
        tax: total.tax,
        chart,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWeeklySales = async (req, res) => {
  try {
    const weeks = Math.max(1, Math.min(Number(req.query.weeks) || 6, 12));
    const chart = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const from = startOfWeek(date);
      const to = endOfDay(new Date(from));
      to.setDate(from.getDate() + 6);
      const totals = await mergeTotals(from, to);

      chart.push({
        label: `W${weeks - i}`,
        from,
        to,
        value: totals.revenue,
        orders: totals.orders,
        tax: totals.tax,
      });
    }

    const total = chart.reduce(
      (sum, point) => ({
        revenue: sum.revenue + point.value,
        orders: sum.orders + point.orders,
        tax: sum.tax + point.tax,
      }),
      { revenue: 0, orders: 0, tax: 0 }
    );

    res.json({
      success: true,
      data: {
        revenue: total.revenue,
        orders: total.orders,
        tax: total.tax,
        chart,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const months = Math.max(1, Math.min(Number(req.query.months) || 6, 12));
    const chart = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const from = startOfMonth(date);
      const to = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      const totals = await mergeTotals(from, to);

      chart.push({
        label: formatMonth(date),
        from,
        to,
        value: totals.revenue,
        orders: totals.orders,
        tax: totals.tax,
      });
    }

    const total = chart.reduce(
      (sum, point) => ({
        revenue: sum.revenue + point.value,
        orders: sum.orders + point.orders,
        tax: sum.tax + point.tax,
      }),
      { revenue: 0, orders: 0, tax: 0 }
    );

    res.json({
      success: true,
      data: {
        revenue: total.revenue,
        orders: total.orders,
        tax: total.tax,
        chart,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalesReport = async (req, res) => getDashboardReport(req, res);
const getTopSellingItems = async (req, res) => {
  const now = new Date();
  res.json({
    success: true,
    data: await getTopItems(startOfMonth(now), endOfDay(now)),
  });
};
const getPaymentReport = async (req, res) => {
  const now = new Date();
  res.json({
    success: true,
    data: await getPaymentBreakdown(startOfMonth(now), endOfDay(now)),
  });
};

module.exports = {
  getDashboardReport,
  getSalesReport,
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getTopSellingItems,
  getPaymentReport,
};
