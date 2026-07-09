import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query"
import { login, logout } from "../../https/index"
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

// When requireRole="Admin" (the "Admin" tab on the Auth page), a
// successful login is only accepted if the account's role is
// actually Admin. Anything else is signed back out immediately and
// shown an error, so the Admin tab can't be used as a backdoor into a
// regular staff account.
const Login = ({ requireRole } = {}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const[formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
    const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
    }

  
    const handleSubmit = (e) => {
      e.preventDefault();
      loginMutation.mutate(formData);
    }

    const loginMutation = useMutation({
      mutationFn: (reqData) => login(reqData),
      onSuccess: async (res) => {
          const { data } = res;
          const { _id, name, email, phone, role } = data.data;

          if (requireRole && role !== requireRole) {
            // Wrong tab for this account - undo the login the server
            // just performed instead of leaving them silently signed in.
            localStorage.removeItem("accessToken");
            try {
              await logout();
            } catch (e) {
              // best-effort cleanup, ignore failures
            }
            enqueueSnackbar(
              `This account isn't an ${requireRole}. Use Customer Login instead.`,
              { variant: "error" }
            );
            return;
          }

          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
          }
          dispatch(setUser({ _id, name, email, phone, role }));
          navigate(role === "Admin" ? "/dashboard" : "/");
      },
      onError: (error) => {
        const { response } = error;
        enqueueSnackbar(response.data.message, { variant: "error" });
      }
    })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            {requireRole === "Admin" ? "Admin Email" : "Customer Email"}
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={requireRole === "Admin" ? "Enter admin email" : "Enter customer email"}
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

        <button
          type="submit"
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;
