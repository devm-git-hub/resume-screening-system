import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../redux/slices/authSlice";
import { LogIn } from "lucide-react";

import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  // VANTA NET
  useEffect(() => {
    vantaEffect.current = NET({
      el: vantaRef.current,
      THREE: THREE,

      mouseControls: true,
      touchControls: true,
      gyroControls: false,

      minHeight: 200.0,
      minWidth: 200.0,

      scale: 1.0,
      scaleMobile: 1.0,

      // EXACT SETTINGS
      color: 0xff3f81,
      backgroundColor: 0x23153c,
      points: 10,
      maxDistance: 20,
      spacing: 15,
      showDots: true,
    });

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(form));

    if (result.meta.requestStatus === "fulfilled") {
      const role = result.payload.user.role;

      navigate(
        role === "recruiter"
          ? "/recruiter/dashboard"
          : role === "admin"
          ? "/admin/dashboard"
          : "/candidate/dashboard"
      );
    }
  };

  return (
    <div
      ref={vantaRef}
      className="min-h-screen flex items-center justify-center px-4"
    >
      {/* Login Card */}
      <div className="w-full max-w-md">

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 text-white">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#ff3f81] text-white flex items-center justify-center font-bold">
              R
            </div>

            <span className="font-bold text-xl">
              ResuMatch AI
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-1">
            Welcome back
          </h2>

          <p className="text-white/70 text-sm mb-6">
            Sign in to continue to your dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
                className="
                  mt-1
                  w-full
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  text-white
                  placeholder-white/50
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#ff3f81]
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="••••••••"
                className="
                  mt-1
                  w-full
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  text-white
                  placeholder-white/50
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#ff3f81]
                "
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                bg-[#ff3f81]
                hover:bg-[#ff2f75]
                text-white
                font-medium
                py-2.5
                rounded-xl
                transition
                disabled:opacity-60
              "
            >
              <LogIn size={18} />

              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register */}
          <p className="text-sm text-white/70 mt-6 text-center">
            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-[#ff3f81] font-medium hover:underline"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}