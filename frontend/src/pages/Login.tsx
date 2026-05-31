import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, ShieldAlert, KeyRound, Building2, UserCircle2, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Where to route after logging in
  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data: any) => {
    setIsSubmittingLocal(true);
    setFormError(null);
    try {
      const loggedUser = await login(data.email, data.password, data.rememberMe);
      showSuccess(`Welcome back, ${loggedUser.name}! Secure session established successfully as ${loggedUser.role}.`);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Failed to authenticate. Incorrect email/password combo.';
      setFormError(msg);
      showError(msg);
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  // Helper presets for fast user review
  const handleQuickLogin = (role: 'Admin' | 'Manager' | 'User') => {
    setFormError(null);
    if (role === 'Admin') {
      setValue('email', 'admin@stockmanager.com');
      setValue('password', 'admin123');
    } else if (role === 'Manager') {
      setValue('email', 'manager@stockmanager.com');
      setValue('password', 'manager123');
    } else {
      setValue('email', 'user@stockmanager.com');
      setValue('password', 'user123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
      
      {/* 1. Brand Banner Panel (Left side on desktop screens) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        
        {/* Upper Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white leading-none">StockManager</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Asset Management</span>
          </div>
        </div>

        {/* Highlight content */}
        <div className="z-10 py-12">
          <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold tracking-wider rounded-full uppercase mb-4">
            Security Verified
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Streamlined Inventory & Stock Flow Controller
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-md">
            Manage corporate products, track stock locations, fulfill exits, log arrivals, and view robust metric configurations under strict secure JWT validation.
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-slate-500 font-mono">
          <span>Secure AES/JWT Authentication Shield active.</span>
        </div>
      </div>

      {/* 2. Login Module Card Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:w-1/2">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/20">
          
          {/* Logo on Mobile (hidden on desktop) */}
          <div className="flex md:hidden items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">StockManager</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Account Login</h2>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Verify your system credentials with JWT signing endpoints.
            </p>
          </div>

          {/* Form Top Error Notification */}
          {formError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-100 flex items-start gap-2.5 animate-shake">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-medium">{formError}</div>
            </div>
          )}

          {/* Core React Hook Form login */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', { 
                    required: 'Email address is required.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please provide a valid email format.'
                    }
                  })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  id="input_email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">
                System Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  {...register('password', { 
                    required: 'Please enter a password password.' 
                  })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  id="input_password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Remember and Recovery options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded text-blue-600 border-gray-300 focus:ring-blue-500/40 focus:ring-offset-0 focus:ring-2 cursor-pointer h-4 w-4"
                  id="chk_remember_me"
                />
                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                  Remember my session
                </span>
              </label>
              <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-semibold">
                Forgot credentials?
              </span>
            </div>

            {/* Submit Security Action Button */}
            <button
              type="submit"
              disabled={isSubmittingLocal}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-75 disabled:cursor-not-allowed select-none mt-2"
              id="btn_login_submit"
            >
              {isSubmittingLocal ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing JWT Keys...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox Login Presets (Review Helper) */}
          <div className="mt-8 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-1.5 mb-3.5">
              <KeyRound className="h-4 w-4 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-400 font-mono tracking-wider uppercase">
                Sandbox Presets (Auto-Fill)
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-red-100 bg-red-50/20 hover:bg-red-50/50 cursor-pointer text-left transition-colors group"
                id="preset_login_admin"
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="w-5 h-5 text-red-500" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-none">System Admin</h5>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Full management control</p>
                  </div>
                </div>
                <span className="bg-red-500/10 text-red-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase font-semibold">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Manager')}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-blue-100 bg-blue-50/20 hover:bg-blue-50/50 cursor-pointer text-left transition-colors group"
                id="preset_login_manager"
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-none">Stock Manager</h5>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Manage stock entries & exits</p>
                  </div>
                </div>
                <span className="bg-blue-500/10 text-blue-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase font-semibold">
                  Manager
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('User')}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/30 hover:bg-gray-50/70 cursor-pointer text-left transition-colors group"
                id="preset_login_user"
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-none">Simple User</h5>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Read-only catalogs access</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-650 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase font-semibold">
                  Staff
                </span>
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-4">
              All credentials are secure. Passwords for quick selection are <code>&lt;role&gt;123</code>.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
