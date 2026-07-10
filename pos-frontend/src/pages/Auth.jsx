import React, { useEffect, useState } from "react";
import { FaUserTie, FaUserShield } from "react-icons/fa";
import restaurant from "../assets/images/restaurant-img.jpg"
import logo from "../assets/images/logo.png"
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";

const Auth = () => {

  useEffect(() => {
    document.title = "POS | Auth"
  }, [])

  const [isRegister, setIsRegister] = useState(false);
  // "employee" -> any account can sign in here (Waiter, Cashier, etc.)
  // "admin"    -> only an account with role "Admin" is accepted
  const [loginAs, setLoginAs] = useState("employee");

  const isAdminTab = loginAs === "admin";

  const switchTab = (tab) => {
    setLoginAs(tab);
    setIsRegister(false); // sign-up only makes sense on the Employee tab
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Section - hidden on mobile, visible from md breakpoint up */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center bg-cover">
        {/* BG Image */}
        <img className="w-full h-full object-cover" src={restaurant} alt="Restaurant Image" />

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>

        {/* Quote at bottom */}
        <blockquote className="absolute bottom-10 px-8 mb-10 text-2xl italic text-white">
          "More Than a Meal—An Unforgettable Experience."
          <br />
          <span className="block mt-4 text-yellow-400">- By "Satvik Kalasapudi"</span>
        </blockquote>
      </div>

      {/* Right Section - full width on mobile, half width from md up */}
      <div className="w-full md:w-1/2 min-h-screen bg-[#1a1a1a] px-6 py-10 sm:p-10">
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="Hotel Logo" className="h-14 w-14 border-2 rounded-full p-1" />
          <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide text-center">VASU 5-Star Hotel</h1>
        </div>

        {/* Employee / Admin tabs */}
        <div className="flex mt-8 bg-[#1f1f1f] rounded-xl p-1 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => switchTab("employee")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              !isAdminTab ? "bg-yellow-400 text-black" : "text-gray-400"
            }`}
          >
            <FaUserTie />
            Customer
          </button>
          <button
            type="button"
            onClick={() => switchTab("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              isAdminTab ? "bg-yellow-400 text-black" : "text-gray-400"
            }`}
          >
            <FaUserShield />
            Admin
          </button>
        </div>

        <h2 className="text-2xl sm:text-4xl text-center mt-8 font-semibold text-yellow-400 mb-10">
          {isAdminTab ? "Admin Login" : isRegister ? "Customer Sign Up" : "Customer Login"}
        </h2>

        {/* Components */}
        {isAdminTab ? (
          <Login requireRole="Admin" />
        ) : isRegister ? (
          <Register setIsRegister={setIsRegister} isAdminCreating={false} />
        ) : (
          <Login />
        )}

        {isAdminTab ? (
          <p className="text-sm text-[#ababab] text-center mt-6">
            Admin accounts are created by another Admin, or via the setup script - there's no public sign-up for Admin access.
          </p>
        ) : (
          <div className="flex justify-center mt-6">
            <p className="text-sm text-[#ababab]">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-yellow-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        )}


      </div>
    </div>
  );
};

export default Auth;
