import React from "react";
import {
  Activity,
  BarChart3,
  ChefHat,
  Download,
  FileSpreadsheet,
  ReceiptText,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exportDashboardReport } from "../../https/dashboard";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const COLORS = ["#facc15", "#22c55e", "#38bdf8", "#fb7185", "#a78bfa"];

const Card = ({ children, className = "" }) => (
  <section className={`rounded-lg border border-[#343434] bg-[#262626] p-5 ${className}`}>
    {children}
  </section>
);

const Empty = ({ label }) => (
  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[#3b3b3b] text-sm text-gray-400">
    {label}
  </div>
);

const MetricTile = ({ icon: Icon, label, value, hint }) => (
  <Card>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
      </div>
      <div className="rounded-lg bg-[#1f1f1f] p-3 text-yellow-300">
        <Icon size={22} />
      </div>
    </div>
  </Card>
);

const Metrics = ({
  summary = {},
  weeklyRevenue = [],
  topSellingFoods = [],
  paymentMethods = [],
  recentOrders = [],
  waiterPerformance = [],
  kitchenAnalytics = {},
  refresh,
  realtimeConnected = false,
}) => {
  const payments = paymentMethods.map((method) => ({
    name: method.method || method._id || "Unknown",
    value: method.total || 0,
    count: method.count || 0,
    percentage: method.percentage || 0,
  }));

  return (
    <div className="container mx-auto px-6 pb-8">
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-[#343434] bg-[#262626] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              realtimeConnected ? "bg-green-400" : "bg-yellow-400"
            }`}
          />
          <div>
            <p className="font-semibold text-white">Live Orders Dashboard</p>
            <p className="text-sm text-gray-400">
              {realtimeConnected
                ? "Real-time Socket.IO updates are connected"
                : "Polling every 30 seconds until realtime connects"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#303030]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => exportDashboardReport("pdf")}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            onClick={() => exportDashboardReport("excel")}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          icon={Wallet}
          label="Live Revenue Counter"
          value={currency.format(summary.todayRevenue || 0)}
          hint={`${currency.format(summary.monthlyRevenue || 0)} this month`}
        />
        <MetricTile
          icon={ReceiptText}
          label="Orders Today"
          value={summary.todayOrders || 0}
          hint={`${summary.activeOrders || 0} active orders`}
        />
        <MetricTile
          icon={TrendingUp}
          label="Average Order Value"
          value={currency.format(summary.averageOrderValue || 0)}
          hint={`${summary.completedToday || 0} completed today`}
        />
        <MetricTile
          icon={Users}
          label="Guests & Tables"
          value={summary.totalCustomers || 0}
          hint={`${summary.totalTables || 0} tables tracked`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Sales Graph</h2>
              <p className="text-sm text-gray-400">Revenue across the last 7 days</p>
            </div>
            <BarChart3 className="text-yellow-300" size={22} />
          </div>
          {weeklyRevenue.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRevenue}>
                  <CartesianGrid stroke="#3a3a3a" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ background: "#1f1f1f", border: "1px solid #3a3a3a" }}
                    formatter={(value) => currency.format(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#facc15"
                    strokeWidth={3}
                    dot={{ fill: "#facc15", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty label="No sales data available" />
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Payment Breakdown</h2>
          <p className="mb-4 text-sm text-gray-400">Collected amount by payment method</p>
          {payments.length ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={payments}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {payments.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1f1f1f", border: "1px solid #3a3a3a" }}
                      formatter={(value) => currency.format(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {payments.map((method, index) => (
                  <div key={method.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: COLORS[index % COLORS.length] }}
                      />
                      {method.name}
                    </span>
                    <span className="font-semibold text-white">{method.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty label="No payment data available" />
          )}
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-white">Top Selling Items</h2>
          <p className="mb-4 text-sm text-gray-400">Most ordered menu items</p>
          {topSellingFoods.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingFoods} layout="vertical">
                  <CartesianGrid stroke="#3a3a3a" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="_id" type="category" width={92} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ background: "#1f1f1f", border: "1px solid #3a3a3a" }}
                  />
                  <Bar dataKey="orders" fill="#22c55e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty label="No item data available" />
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Recent Orders Feed</h2>
          <p className="mb-4 text-sm text-gray-400">Latest orders entering the floor</p>
          <div className="space-y-3">
            {recentOrders.length ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="rounded-lg bg-[#1f1f1f] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">
                      {order.customerDetails?.name || "Walk-in guest"}
                    </p>
                    <span className="rounded-full bg-[#333] px-2 py-1 text-xs text-yellow-300">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {order.items?.length || 0} items - {currency.format(order.bills?.totalWithTax || 0)}
                  </p>
                </div>
              ))
            ) : (
              <Empty label="No recent orders" />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Waiter Performance</h2>
          <p className="mb-4 text-sm text-gray-400">Active service team snapshot</p>
          <div className="space-y-3">
            {waiterPerformance.length ? (
              waiterPerformance.map((waiter) => (
                <div key={waiter._id} className="rounded-lg bg-[#1f1f1f] p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{waiter.name}</p>
                    <span className="flex items-center gap-1 text-sm text-yellow-300">
                      <Star size={14} fill="currentColor" />
                      {waiter.rating}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-400">{waiter.servedOrders} orders</span>
                    <span className="text-right text-gray-300">
                      {currency.format(waiter.revenue || 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <Empty label="No active waiters found" />
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Kitchen Analytics</h2>
            <p className="text-sm text-gray-400">Prep queue and ticket health</p>
          </div>
          <ChefHat className="text-yellow-300" size={24} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricTile
            icon={Activity}
            label="Active Kitchen Tickets"
            value={kitchenAnalytics.activeTickets || 0}
            hint={`${kitchenAnalytics.inProgressOrders || 0} in progress`}
          />
          <MetricTile
            icon={ReceiptText}
            label="Ready For Pickup"
            value={kitchenAnalytics.readyOrders || 0}
            hint="Orders waiting for service"
          />
          <MetricTile
            icon={ChefHat}
            label="Average Prep Time"
            value={`${kitchenAnalytics.averagePrepTime || 0} min`}
            hint="Based on open tickets"
          />
        </div>
      </Card>
    </div>
  );
};

export default Metrics;
