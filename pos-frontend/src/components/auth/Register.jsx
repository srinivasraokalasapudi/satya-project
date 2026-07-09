import React, { useState } from "react";
import { register } from "../../https/index";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";

// Two ways this form gets used:
// 1. Public sign-up (Auth page, nobody logged in): isAdminCreating is
//    false. Role isn't shown/editable - the backend always assigns the
//    safe, view-only "Waiter" role for anonymous sign-ups. On success
//    the new user is signed straight in and sent into the app.
// 2. Admin creating a staff login (Staff Management screen):
//    isAdminCreating is true. The Admin can pick a role (including
//    "Admin"), and on success the modal just closes - the Admin's own
//    session is left untouched.
const Register = ({ setIsRegister, isAdminCreating = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Waiter",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });

      if (isAdminCreating) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "Waiter",
        });

        setTimeout(() => {
          setIsRegister(false);
        }, 1500);
        return;
      }

      // Public sign-up: log the new user straight in.
      const { _id, name, email, phone, role } = data.data;
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      dispatch(setUser({ _id, name, email, phone, role }));
      navigate(role === "Admin" ? "/dashboard" : "/");
    },
    onError: (error) => {
      const { response } = error;
      const message = response.data.message;
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Customer Name
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Customer Email
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter customer email"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Customer Phone
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter customer phone"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Password
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        {isAdminCreating && (
          <div>
            <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
              Role
            </label>
            <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Waiter, Cashier, Admin"
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
            <p className="text-xs text-[#777] mt-1">
              Only give the "Admin" role to people who should be able to add/edit/delete anything.
              Everyone else can view all content but can't make changes.
            </p>
          </div>
        )}

        {!isAdminCreating && (
          <p className="text-xs text-[#777] mt-3">
            New accounts can view everything but can't make changes.
            Ask your Admin if you need edit access.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
        >
          {isAdminCreating ? "Create Account" : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default Register;
