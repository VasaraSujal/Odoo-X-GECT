import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { loginUser } from "../../Redux/Slice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ CLEAR OLD TOKEN WHEN LOGIN PAGE LOADS
  useEffect(() => {
    console.log("🧹 Clearing old token...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  const handelLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userData = { username, password, id };

    try {
      const response = await fetch("https://attendance-and-payroll-management.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed", {
          position: "bottom-right",
        });
        return;
      }

      const role = (data?.user?.role || "").toLowerCase();

      // ✅ Update Redux
      dispatch(loginUser({ user: data.user, token: data.token }));

      // ✅ Save new token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      toast.success("Login successful!", {
        position: "bottom-right",
      });

      // ✅ Navigate after login
      setTimeout(() => {
        if (role === "employee") {
          navigate("/emhome");
        } else if (role === "hr") {
          navigate("/hrhome");
        }
      }, 1500); // wait for toast to show

    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred while logging in. Please try again.", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left Side (Logo + Form + Footer) */}
      <div className="flex flex-col justify-center items-center w-full md:w-5/12 lg:w-4/12 px-6 py-12 relative z-10">

        {/* LOGO */}
        <div className="absolute top-8 left-8">
          <img
            src="https://res.cloudinary.com/doqzxuxb1/image/upload/v1748249798/Attendance%20And%20Payroll%20Managment/eanj5h57izb4wsvgkzhc.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Welcome back</h1>
            <p className="text-text-sub">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-5" onSubmit={handelLogin}>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">ID</label>
              <input
                type="text"
                placeholder="Enter your ID"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-text-main placeholder-gray-400"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-text-main placeholder-gray-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-text-main placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold text-lg hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 ${loading ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary-hover"
                }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            <span className="cursor-pointer hover:text-primary transition-colors">Terms and Conditions</span>
            <span className="mx-2">•</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Right Side (Image/Art) */}
      <div className="hidden md:flex md:w-7/12 lg:w-8/12 bg-accent relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20" />
        <div className="relative z-10 w-full max-w-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <img
            src="https://res.cloudinary.com/doqzxuxb1/image/upload/v1748238957/Attendance%20And%20Payroll%20Managment/y45ltl4yfgxsksuetayk.png"
            alt="Login Illustration"
            className="w-full h-auto drop-shadow-2xl rounded-2xl"
          />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
