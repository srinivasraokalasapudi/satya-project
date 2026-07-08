import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Users2,
  UtensilsCrossed,
  Boxes,
  CreditCard,
  Settings,
  FileBarChart2,
} from "lucide-react";

import BottomNav from "../../components/shared/BottomNav";
import ProfileCard from "../../components/more/ProfileCard";
import ReportsSection from "../../components/more/ReportsSection";
import BusinessHealth from "../../components/more/BusinessHealth";
import QuickActions from "../../components/more/QuickActions";
import RecentActivity from "../../components/more/RecentActivity";
import VersionFooter from "../../components/more/VersionFooter";
import LogoutButton from "../../components/more/LogoutButton";
import SectionHeader from "../../components/more/SectionHeader";
import NavCard from "../../components/more/NavCard";
import { getRecentActivity } from "../../https/dashboardHttp";
import { generateMockActivity } from "../../components/more/reportUtils";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";

const navLinks = [
  { title: "Staff", description: "Manage roles & shifts", icon: Users2, path: "/management/staff" },
  { title: "Menu", description: "Edit dishes & pricing", icon: UtensilsCrossed, path: "/management/menu" },
  { title: "Inventory", description: "Stock & suppliers", icon: Boxes, path: "/management/inventory" },
  { title: "Payments", description: "Transactions & payouts", icon: CreditCard, path: "/management/payments" },
  { title: "Full Reports", description: "Export & schedule reports", icon: FileBarChart2, path: "/management/reports" },
  { title: "Settings", description: "Restaurant preferences", icon: Settings, path: "/settings" },
];

// Resolves the real recent-orders endpoint first; falls back to demo data
// (clearly labeled) so the widget is still useful while the backend route
// is being built, same convention as ReportsSection.
const fetchRecentActivity = async () => {
  try {
    const res = await getRecentActivity(6);
    return { items: res.data, isDemo: false };
  } catch (err) {
    return { items: generateMockActivity(), isDemo: true };
  }
};

const MorePage = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
    refetchInterval: 20000,
    staleTime: 10000,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
      // Even if the server call fails, clear the local session so the
      // user isn't stuck signed in on a device they meant to log out of.
      localStorage.removeItem("accessToken");
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <section className="min-h-screen bg-obsidian pb-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10 flex flex-col gap-8">
        <ProfileCard userName={userData?.name} userRole={userData?.role} />

        <ReportsSection />

        <div>
          <SectionHeader title="Management" subtitle="Jump into other areas of the restaurant" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navLinks.map((link, i) => (
              <NavCard
                key={link.title}
                index={i}
                icon={link.icon}
                title={link.title}
                description={link.description}
                onClick={() => navigate(link.path)}
              />
            ))}
          </div>
        </div>

        <QuickActions />

        <RecentActivity
          items={activityData?.items ?? []}
          loading={activityLoading}
          isDemo={activityData?.isDemo ?? false}
        />

        <BusinessHealth />

        <VersionFooter />

        <LogoutButton onConfirm={handleLogout} />
      </div>

      <BottomNav />
    </section>
  );
};

export default MorePage;
