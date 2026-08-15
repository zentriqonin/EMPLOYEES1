import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setError('');
      setLoading(true);
      try {
        await login(values.username, values.password);
        navigate('/dashboard');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f6ff] via-[#f8faff] to-[#e1edff] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Dots Pattern - Left */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden md:block opacity-35 select-none pointer-events-none">
        <svg width="64" height="240" viewBox="0 0 64 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dotPatternLeft" x="0" y="0" width="16" height="20" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2.5" fill="#3B82F6" />
          </pattern>
          <rect width="64" height="240" fill="url(#dotPatternLeft)" />
        </svg>
      </div>

      {/* Decorative Dots Pattern - Right */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:block opacity-35 select-none pointer-events-none">
        <svg width="64" height="240" viewBox="0 0 64 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dotPatternRight" x="0" y="0" width="16" height="20" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2.5" fill="#3B82F6" />
          </pattern>
          <rect width="64" height="240" fill="url(#dotPatternRight)" />
        </svg>
      </div>

      {/* Modern Wave Shapes at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none select-none">
        <svg viewBox="0 0 1440 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-h-[140px]">
          <path d="M0,180 C320,280 640,160 960,220 C1280,280 1380,220 1440,200 L1440,260 L0,260 Z" fill="#D3E4FF" opacity="0.5" />
          <path d="M0,140 C280,210 560,110 840,180 C1120,250 1280,180 1440,140 L1440,260 L0,260 Z" fill="#C2D9FF" opacity="0.7" />
          <path d="M0,90 C400,160 800,60 1200,130 L1440,90 L1440,260 L0,260 Z" fill="#AECFFF" opacity="0.4" />
        </svg>
      </div>

      {/* Centered login form & logo container */}
      <div className="w-full max-w-lg z-10 flex flex-col items-center">
        {/* Logo block */}
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/zenlogo-removebg.png"
            alt="ZENTRIQON TECH SOLUTIONS"
            className="h-[84px] md:h-[96px] object-contain mb-2 select-none pointer-events-none"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Divider with Text: Payroll Management */}
        <div className="flex items-center justify-center my-4 w-full px-6">
          <div className="flex-grow border-t-2 border-[#A5C7F7] max-w-[80px]"></div>
          <span className="mx-4 text-xl md:text-2xl font-bold text-[#1E3A8A] tracking-wider font-sans">
            Payroll Management
          </span>
          <div className="flex-grow border-t-2 border-[#A5C7F7] max-w-[80px]"></div>
        </div>

        {/* Card */}
        <div className="w-full max-w-[480px] bg-white border border-[#E0E7FF] rounded-lg shadow-lg p-8 md:p-10 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Username Input Container */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-[#3B82F6]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <label className="text-sm font-semibold text-[#1F2937]">User Name</label>
              </div>
              <input
                type="text"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your user name"
                className="w-full border border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-sm text-[#374151] rounded-xl px-4 py-3.5 outline-none transition-all placeholder-[#9CA3AF] bg-[#FAFAFA]"
              />
              {formik.touched.username && formik.errors.username ? (
                <span className="text-red-500 text-xs font-medium mt-1">{formik.errors.username}</span>
              ) : null}
            </div>

            {/* Password Input Container */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-[#3B82F6]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <label className="text-sm font-semibold text-[#1F2937]">Password</label>
              </div>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your password"
                  className="w-full border border-[#D1D5DB] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-sm text-[#374151] rounded-xl pl-4 pr-12 py-3.5 outline-none transition-all placeholder-[#9CA3AF] bg-[#FAFAFA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a3 3 0 0 0-4.243-4.243m0 0-3.65-3.65m0 0a3 3 0 0 0-4.243 4.243m0 0 3.65 3.65" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <span className="text-red-500 text-xs font-medium mt-1">{formik.errors.password}</span>
              ) : null}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-[#0D62E0] hover:bg-[#0b51ba] text-white font-semibold text-lg rounded-xl shadow-[0_4px_12px_rgba(13,98,224,0.3)] hover:shadow-[0_6px_16px_rgba(13,98,224,0.4)] transition-all flex items-center justify-center gap-2 select-none"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Small hint section for testing */}
        <div className="text-center text-xs text-slate-500 font-medium z-10">
          {/* <p>Sample Accounts:</p>
          <div className="flex justify-center gap-4 mt-1">
            <span>Admin: <strong className="text-slate-700 font-semibold">admin / admin123</strong></span>
            <span>Employee: <strong className="text-slate-700 font-semibold">employee / employee123</strong></span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
