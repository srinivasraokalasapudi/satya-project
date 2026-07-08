import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import {
  ClipboardList,
  IndianRupee,
  UtensilsCrossed,
  ChefHat,
  BookOpenText,
  Boxes,
  Users,
  CalendarCheck2,
  UserCog,
  MonitorSmartphone,
  BarChart3,
  ReceiptText,
  FileSpreadsheet,
  FileOutput,
  LineChart,
  Contact,
  ShieldCheck,
  Truck,
  ClipboardCheck,
  PackageSearch,
  Bell,
  Settings2,
  DatabaseBackup,
  RefreshCcw,
  LifeBuoy,
  Info,
} from "lucide-react";

import BottomNav from "../components/shared/BottomNav";
import useOrdersOverview from "../hooks/useOrdersOverview";
import ProfileCard from "../components/more/ProfileCard";
import StatCard from "../components/more/StatCard";
import SectionHeader from "../components/more/SectionHeader";
import NavCard from "../components/more/NavCard";
import QuickActions from "../components/more/QuickActions";
import BusinessHealth from "../components/more/BusinessHealth";
import RecentActivity from "../components/more/RecentActivity";
import VersionFooter from "../components/more/VersionFooter";
import LogoutButton from "../components/more/LogoutButton";
import { logout } from "../https";

// ----------------------------------------------------------------------
// Section data. `path` must match an existing route in App.jsx — routes
// are never invented here. Cards without a live route fall back to a
// "coming soon" toast instead of breaking navigation.
// ----------------------------------------------------------------------

const operations = [
  { icon: BookOpenText, title: "Menu Management", description: "Manage restaurant menu items.", path: "/menu-management" },
  { icon: Boxes, title: "Inventory", description: "Track stock and ingredients.", path: "/inventory" },
  { icon: Users, title: "Customers", description: "Customer database and loyalty.", path: "/customers" },
  { icon: CalendarCheck2, title: "Reservations", description: "Manage table bookings.", path: "/tables" },
  { icon: UserCog, title: "Staff", description: "Employee management.", path: "/staff" },
  { icon: MonitorSmartphone, title: "Kitchen Display", description: "Monitor kitchen orders.", path: "/orders" },
];

const finance = [
  { icon: BarChart3, title: "Sales Reports", description: "Revenue and order trends.", path: "/reports" },
  { icon: ReceiptText, title: "Payment History", description: "Transaction records.", path: "/payments" },
  { icon: FileSpreadsheet, title: "GST Reports", description: "Tax filing summaries.", path: null },
  { icon: FileOutput, title: "Export Reports", description: "PDF / Excel exports.", path: "/export" },
  { icon: LineChart, title: "Analytics Dashboard", description: "Business performance insights.", path: "/dashboard" },
];

const management = [
  { icon: Contact, title: "Employees", description: "Staff records and shifts.", path: "/staff" },
  { icon: ShieldCheck, title: "Roles & Permissions", description: "Access control settings.", path: null },
  { icon: Truck, title: "Suppliers", description: "Vendor directory.", path: null },
  { icon: ClipboardCheck, title: "Purchase Orders", description: "Track incoming stock orders.", path: null },
  { icon: PackageSearch, title: "Stock Adjustment", description: "Correct inventory counts.", path: "/inventory" },
];

const system = [
  { icon: Bell, title: "Notifications", description: "Alerts & updates.", path: "/notifications" },
  { icon: Settings2, title: "Settings", description: "Hotel configuration.", path: "/settings" },
  { icon: DatabaseBackup, title: "Backup Database", description: "Secure your data.", path: null },
  { icon: RefreshCcw, title: "Sync Data", description: "Sync menu and orders.", path: null },
  { icon: LifeBuoy, title: "Help & Support", description: "Get assistance.", path: null },
  { icon: Info, title: "About", description: "App and license info.", path: null },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const More = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  const {
    todaysOrdersCount,
    revenueToday,
    kitchenActive,
    readyToServe,
    occupiedTables,
    totalTables,
    recentActivity,
    isLoading: ordersLoading,
  } = useOrdersOverview();

  useEffect(() => {
    document.title = "Satya POS | More";
  }, []);

  const overviewStats = [
    {
      icon: ClipboardList,
      label: "Today's Orders",
      value: todaysOrdersCount,
    },
    {
      icon: IndianRupee,
      label: "Revenue",
      value: `\u20B9${revenueToday.toLocaleString("en-IN")}`,
      subtitle: "Today",
    },
    {
      icon: UtensilsCrossed,
      label: "Occupied Tables",
      value: `${occupiedTables} / ${totalTables}`,
    },
    {
      icon: ChefHat,
      label: "Kitchen Orders",
      value: kitchenActive,
      subtitle: "Active",
    },
  ];

  const goTo = (path, title) => {
    if (path) {
      navigate(path);
    } else {
      enqueueSnackbar(`${title} is coming soon`, { variant: "info" });
    }
  };

  const runQuickAction = (title) => {
    enqueueSnackbar(`${title}...`, { variant: "info" });
  };

  const handleLogout = async () => {
    try {
      await logout();

      localStorage.clear();
      sessionStorage.clear();

      enqueueSnackbar("Logged out successfully", {
        variant: "success",
      });

      navigate("/auth");
    } catch (error) {
      enqueueSnackbar("Logout failed", {
        variant: "error",
      });
    }
  };

  return (
    <section className="bg-obsidian min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          {/* 1. Restaurant Profile */}
          <ProfileCard userName={userData.name} userRole={userData.role} />

          {/* 2. Business Overview */}
          <motion.div variants={fadeUp}>
            <SectionHeader title="Business Overview" subtitle="Live snapshot of today's performance" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} loading={ordersLoading} />
              ))}
            </div>
          </motion.div>

          {/* 3. Operations */}
          <motion.div variants={fadeUp}>
            <SectionHeader title="Operations" subtitle="Day-to-day restaurant management" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {operations.map((item, i) => (
                <NavCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={
                    item.title === "Kitchen Display"
                      ? `${kitchenActive} order${kitchenActive === 1 ? "" : "s"} in progress`
                      : item.description
                  }
                  badge={item.title === "Kitchen Display" && kitchenActive > 0 ? kitchenActive : undefined}
                  index={i}
                  onClick={() => goTo(item.path, item.title)}
                />
              ))}
            </div>
          </motion.div>

          {/* 4. Finance */}
          <motion.div variants={fadeUp}>
            <SectionHeader title="Finance" subtitle="Revenue, payments and tax reporting" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {finance.map((item, i) => (
                <NavCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  index={i}
                  onClick={() => goTo(item.path, item.title)}
                />
              ))}
            </div>
          </motion.div>

          {/* 5. Management */}
          <motion.div variants={fadeUp}>
            <SectionHeader title="Management" subtitle="Teams, vendors and stock control" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {management.map((item, i) => (
                <NavCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  index={i}
                  onClick={() => goTo(item.path, item.title)}
                />
              ))}
            </div>
          </motion.div>

          {/* 6. System */}
          <motion.div variants={fadeUp}>
            <SectionHeader title="System" subtitle="Configuration and platform health" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {system.map((item, i) => (
                <NavCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={
                    item.title === "Notifications"
                      ? readyToServe > 0
                        ? `${readyToServe} order${readyToServe === 1 ? "" : "s"} ready to serve`
                        : "You're all caught up."
                      : item.description
                  }
                  badge={item.title === "Notifications" && readyToServe > 0 ? readyToServe : item.badge}
                  index={i}
                  onClick={() => goTo(item.path, item.title)}
                />
              ))}
            </div>
          </motion.div>

          {/* 7. Quick Actions */}
          <motion.div variants={fadeUp}>
            <QuickActions onAction={runQuickAction} />
          </motion.div>

          {/* 8. Business Health */}
          <motion.div variants={fadeUp}>
            <BusinessHealth />
          </motion.div>

          {/* 9. Recent Activity */}
          <motion.div variants={fadeUp}>
            <RecentActivity items={recentActivity} loading={ordersLoading} />
          </motion.div>

          {/* 10. Version Information */}
          <motion.div variants={fadeUp}>
            <VersionFooter />
          </motion.div>

          {/* 11. Logout */}
          <motion.div variants={fadeUp} className="max-w-md mx-auto w-full">
            <LogoutButton onConfirm={handleLogout} />
          </motion.div>
        </motion.div>
      </div>

      <BottomNav />
    </section>
  );
};

export default More;
