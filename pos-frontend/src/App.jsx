import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { Home, Auth, Orders, Tables, Menu } from "./pages";

// Less-frequently-visited pages are code-split so their JS only
// downloads when someone actually navigates there, instead of being
// part of the bundle every visitor loads just to sign in and take an
// order.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const More = lazy(() => import("./pages/More"));
const Reports = lazy(() => import("./pages/Management/Reports"));
const StaffManagement = lazy(() => import("./pages/Management/StaffManagement"));
const Inventory = lazy(() => import("./pages/Management/Inventory"));
const PaymentHistory = lazy(() => import("./pages/Management/PaymentHistory"));
const Customers = lazy(() => import("./pages/Management/Customers"));
const Settings = lazy(() => import("./pages/Management/Settings"));
const ExportReports = lazy(() => import("./pages/Management/ExportReports"));
const MenuManagement = lazy(() => import("./pages/Management/MenuManagement"));
const Notifications = lazy(() => import("./pages/Management/Notifications"));

import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];
  const { isAuth } = useSelector((state) => state.user);

  if (isLoading) return <FullScreenLoader />;

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}

      <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/auth"
          element={isAuth ? <Navigate to="/" /> : <Auth />}
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoutes>
              <Tables />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoutes>
              <Menu />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/more"
          element={
            <ProtectedRoutes>
              <More />
            </ProtectedRoutes>
          }
        />

        {/* Management Routes */}

        <Route
          path="/reports"
          element={
            <ProtectedRoutes>
              <Reports />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/menu-management"
          element={
            <ProtectedRoutes>
              <MenuManagement />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoutes>
              <Inventory />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoutes>
              <StaffManagement />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoutes>
              <Customers />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoutes>
              <PaymentHistory />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoutes>
              <Settings />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/export"
          element={
            <ProtectedRoutes>
              <ExportReports />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoutes>
              <Notifications />
            </ProtectedRoutes>
          }
        />

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
      </Suspense>
    </>
  );
}

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;