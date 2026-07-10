import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { registerCustomerSelf, loginCustomerSelf } from "../../https";
import { setDiner } from "../../redux/slices/dinerSlice";

const CustomerAuth = ({ tableNo }) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.password || (mode === "signup" && !formData.name)) {
      enqueueSnackbar("Please fill in all fields.", { variant: "warning" });
      return;
    }

    setIsSubmitting(true);

    try {
      const apiCall = mode === "signup" ? registerCustomerSelf : loginCustomerSelf;
      const { data } = await apiCall(formData);

      if (data.accessToken) {
        localStorage.setItem("customerAccessToken", data.accessToken);
      }

      dispatch(setDiner(data.data));

      enqueueSnackbar(
        mode === "signup" ? "Account created!" : "Welcome back!",
        { variant: "success" }
      );
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wide">
            VASU 5-Star Restaurant
          </h1>
          {tableNo && (
            <p className="text-[#f6b100] font-semibold mt-1">
              Table {tableNo}
            </p>
          )}
          <p className="text-[#ababab] text-sm mt-3">
            {mode === "signup"
              ? "Create an account to order from your seat"
              : "Log in to order from your seat"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-[#ababab] text-sm mb-1 block">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              className="w-full bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-[#ababab] text-sm mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-[#2a2a2a] text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#f6b100] text-black font-bold rounded-lg py-3 mt-2"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signup"
              ? "Create Account & Continue"
              : "Log In & Continue"}
          </button>
        </form>

        <p className="text-center text-[#ababab] text-sm mt-6">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="text-[#f6b100] font-semibold"
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default CustomerAuth;
