import React from "react";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
      // Even if the server call fails (expired token, network hiccup,
      // blocked cross-domain cookie, etc.), still clear the local
      // session so the user isn't stuck unable to log out.
      localStorage.removeItem("accessToken");
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex flex-wrap justify-between items-center gap-3 py-3 px-4 sm:px-8 bg-[#1a1a1a] shadow-md">

      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-3 sm:gap-4 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-yellow-400 shadow-lg bg-white flex items-center justify-center shrink-0">
          <img
            src={logo}
            alt="VASU 5-Star Hotel"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-base sm:text-2xl font-bold text-white tracking-wide leading-tight">
            VASU 5-Star Hotel
          </h1>
          <p className="text-[10px] sm:text-xs text-yellow-400 tracking-[0.2em] sm:tracking-[0.25em]">
            ★★★★★ PREMIUM DINING
          </p>
        </div>
      </div>

      {/* Search - hidden on small screens to avoid squeezing the layout */}
      <div className="hidden md:flex items-center gap-4 bg-[#242424] rounded-2xl px-5 py-3 flex-1 max-w-[500px] order-3 md:order-none">
        <FaSearch className="text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent w-full outline-none text-white placeholder:text-gray-500"
        />
      </div>

      {/* User */}
      <div className="flex items-center gap-2 sm:gap-4">

        {userData.role === "Admin" && (
          <div
            onClick={() => navigate("/dashboard")}
            role="button"
            tabIndex={0}
            aria-label="Open dashboard"
            className="bg-[#242424] hover:bg-[#323232] p-2 sm:p-3 rounded-xl cursor-pointer transition-all"
          >
            <MdDashboard className="text-white text-xl sm:text-2xl" />
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          aria-label="Notifications"
          className="bg-[#242424] hover:bg-[#323232] p-2 sm:p-3 rounded-xl cursor-pointer transition-all"
        >
          <FaBell className="text-white text-xl sm:text-2xl" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <FaUserCircle className="text-white text-3xl sm:text-5xl hidden xs:block" />

          <div className="hidden sm:block">
            <h1 className="text-white font-semibold">
              {userData.name || "Test User"}
            </h1>

            <p className="text-sm text-gray-400">
              {userData.role || "Role"}
            </p>
          </div>

          <IoLogOut
            onClick={handleLogout}
            role="button"
            tabIndex={0}
            aria-label="Log out"
            size={30}
            className="text-white hover:text-red-500 cursor-pointer transition-all shrink-0"
          />
        </div>

      </div>
    </header>
  );
};

export default Header;