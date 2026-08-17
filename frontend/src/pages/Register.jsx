import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../redux/slices/authSlice";
import { UserPlus } from "lucide-react";

import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    companyName: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // Vanta references
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Vanta NET background
  useEffect(() => {
    vantaEffect.current = NET({
      el: vantaRef.current,
      THREE: THREE,

      // Same settings as your Vanta configuration
      mouseControls: true,
      touchControls: true,
      gyroControls: false,

      minHeight: 200.0,
      minWidth: 200.0,

      scale: 1.0,
      scaleMobile: 1.0,

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

    const result = await dispatch(registerUser(form));

    if (result.meta.requestStatus === "fulfilled") {
      const role = result.payload.user.role;

      navigate(
        role === "recruiter"
          ? "/recruiter/dashboard"
          : "/candidate/dashboard"
      );
    }
  };

  return (
    <div
      ref={vantaRef}
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      {/* Register Card */}
      <div className="w-full max-w-md">

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 text-white">

          {/* Logo / Heading */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#ff3f81] text-white flex items-center justify-center font-bold">
              R
            </div>

            <span className="font-bold text-xl">
              ResuMatch AI
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            Create your account
          </h2>

          <p className="text-white/70 text-sm mb-6">
            Join as a candidate or recruiter
          </p>

          {/* Role Selection */}
          <div className="flex gap-2 mb-5">
            {["candidate", "recruiter"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    role: r,
                  })
                }
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition ${
                  form.role === r
                    ? "bg-[#ff3f81] text-white border-[#ff3f81]"
                    : "border-white/20 text-white/70 bg-white/5 hover:bg-white/10"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium">
                Full Name
              </label>

              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff3f81]"
                placeholder="Jane Doe"
              />
            </div>

            {/* Company Name */}
            {form.role === "recruiter" && (
              <div>
                <label className="text-sm font-medium">
                  Company Name
                </label>

                <input
                  required
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      companyName: e.target.value,
                    })
                  }
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff3f81]"
                  placeholder="Acme Corp"
                />
              </div>
            )}

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
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff3f81]"
                placeholder="you@example.com"
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
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff3f81]"
                placeholder="Minimum 8 characters"
              />
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#ff3f81] hover:bg-[#ff2f75] text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <UserPlus size={18} />

              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-white/70 mt-6 text-center">
            Already have an account?{" "}

            <Link
              to="/login"
              className="text-[#ff3f81] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}