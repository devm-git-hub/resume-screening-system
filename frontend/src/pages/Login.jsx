// import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { loginUser } from "../redux/slices/authSlice";
// import { LogIn } from "lucide-react";

// import * as THREE from "three";
// import NET from "vanta/dist/vanta.net.min";

// export default function Login() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const vantaRef = useRef(null);
//   const vantaEffect = useRef(null);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { loading } = useSelector((state) => state.auth);

//   // Vanta NET background
//   useEffect(() => {
//     if (!vantaEffect.current) {
//       vantaEffect.current = NET({
//         el: vantaRef.current,
//         THREE: THREE,

//         mouseControls: true,
//         touchControls: true,
//         gyroControls: false,

//         minHeight: 200,
//         minWidth: 200,

//         scale: 1,
//         scaleMobile: 1,

//         // Your settings
//         color: 0xff3f81,
//         backgroundColor: 0x23153c,
//         points: 10,
//         maxDistance: 20,
//         spacing: 15,
//         showDots: true,
//       });
//     }

//     return () => {
//       if (vantaEffect.current) {
//         vantaEffect.current.destroy();
//         vantaEffect.current = null;
//       }
//     };
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const result = await dispatch(loginUser(form));

//     if (result.meta.requestStatus === "fulfilled") {
//       const role = result.payload.user.role;

//       navigate(
//         role === "recruiter"
//           ? "/recruiter/dashboard"
//           : role === "admin"
//           ? "/admin/dashboard"
//           : "/candidate/dashboard"
//       );
//     }
//   };

//   return (
//     <div
//       ref={vantaRef}
//       className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
//     >
//       {/* Dark overlay */}
//       <div className="absolute inset-0 bg-black/20 pointer-events-none" />

//       {/* Login Card */}
//       <div className="relative z-10 w-full max-w-md">
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white">

//           {/* Logo */}
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-10 h-10 rounded-lg bg-[#ff3f81] text-white flex items-center justify-center font-bold shadow-lg">
//               R
//             </div>

//             <span className="font-bold text-xl">
//               ResuMatch AI
//             </span>
//           </div>

//           {/* Heading */}
//           <h2 className="text-2xl font-bold mb-1">
//             Welcome back
//           </h2>

//           <p className="text-white/70 text-sm mb-6">
//             Sign in to continue to your dashboard
//           </p>

//           {/* Login Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">

//             {/* Email */}
//             <div>
//               <label className="text-sm font-medium text-white">
//                 Email
//               </label>

//               <input
//                 type="email"
//                 required
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     email: e.target.value,
//                   })
//                 }
//                 className="mt-1 w-full px-4 py-2.5 rounded-xl
//                 border border-white/20
//                 bg-white/10
//                 text-white
//                 placeholder-white/50
//                 focus:outline-none
//                 focus:ring-2
//                 focus:ring-[#ff3f81]"
//                 placeholder="you@example.com"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="text-sm font-medium text-white">
//                 Password
//               </label>

//               <input
//                 type="password"
//                 required
//                 value={form.password}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     password: e.target.value,
//                   })
//                 }
//                 className="mt-1 w-full px-4 py-2.5 rounded-xl
//                 border border-white/20
//                 bg-white/10
//                 text-white
//                 placeholder-white/50
//                 focus:outline-none
//                 focus:ring-2
//                 focus:ring-[#ff3f81]"
//                 placeholder="••••••••"
//               />
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex items-center justify-center gap-2
//               bg-[#ff3f81]
//               hover:bg-[#ff2f75]
//               text-white
//               font-medium
//               py-2.5
//               rounded-xl
//               transition-all
//               duration-300
//               hover:shadow-lg
//               hover:shadow-pink-500/30
//               disabled:opacity-60"
//             >
//               <LogIn size={18} />

//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>

//           {/* Register */}
//           <p className="text-sm text-white/70 mt-6 text-center">
//             Don't have an account?{" "}

//             <Link
//               to="/register"
//               className="text-[#ff3f81] font-medium hover:underline"
//             >
//               Create one
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../redux/slices/authSlice";
import { LogIn } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (result.meta.requestStatus === "fulfilled") {
      const role = result.payload.user.role;
      navigate(role === "recruiter" ? "/recruiter/dashboard" : role === "admin" ? "/admin/dashboard" : "/candidate/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">R</div>
          <span className="font-bold text-xl">ResuMatch AI</span>
        </div>

        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            <LogIn size={18} /> {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}