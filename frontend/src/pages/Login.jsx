import React from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import { Input } from "../components/common/Input";
import { LoginButton } from "../components/common/Button";
import { toast } from "react-toastify";

const demoAccounts = [
  { label: "Admin", email: "admin@ems.com", password: "Admin@123" },
  { label: "Employee", email: "htet@ems.com", password: "Admin@123" },
];

const Login = observer(() => {
  const auth = useAuth();
  const navigate = useNavigate();

  const fillCredentials = (email, password) => {
    auth.handleChange({ target: { name: "email", value: email } });
    auth.handleChange({ target: { name: "password", value: password } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.validateForm(auth.formData)) return;

    try {
      const { email, password } = auth.formData;
      await auth.login(email, password);

      if (auth.user?.role === "admin") {
        toast.success("Welcome back, Admin!");
        navigate("/admin-dashboard");
      } else {
        toast.success("Successfully logged in!");
        navigate("/employee-dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <motion.div className="bg-gray-900 h-screen w-full flex justify-center items-center overflow-hidden relative">
      <div className="bg-gray-100 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-800 w-full sm:w-1/2 md:w-9/12 lg:w-1/2 flex flex-col md:flex-row items-center mx-5 sm:m-0">
        <div className="w-full md:w-1/2 hidden md:flex flex-col justify-center items-center">
          <img src="/Kumo.svg" alt="logo" />
        </div>
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md w-full md:w-1/2 flex flex-col items-center py-32 px-8 rounded-r-xl">
          <h3 className="text-3xl font-bold text-white mb-4">LOGIN</h3>
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <div className="mb-4">
              <Input
                name="email"
                title="Email"
                type="email"
                placeholder="Enter your email"
                value={auth.formData.email}
                handleChange={auth.handleChange}
                required={true}
                error={auth.errorMessage.email}
                disabled={auth.loading}
              />
            </div>

            <div className="mb-6">
              <Input
                name="password"
                title="Password"
                type="password"
                placeholder="Enter your password"
                value={auth.formData.password}
                handleChange={auth.handleChange}
                required={true}
                error={auth.errorMessage.password}
                disabled={auth.loading}
              />
            </div>

            <LoginButton name="Login" isLoading={auth.loading} />
          </form>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-xs text-center mb-3">Demo Credentials</p>
        <div className="flex flex-col gap-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillCredentials(acc.email, acc.password)}
              className="text-left px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
            >
              <span className="text-blue-400 font-medium">{acc.label}</span>
              <span className="text-gray-300 ml-2">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default Login;
