import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '@/utils/auth';
import Button from '@/components/UI/Button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = (data.get('email') as string) || '';
    const password = (data.get('password') as string) || '';
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      // small success feedback before transition
      // navigate back to the originally requested page (or dashboard)
      const dest = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(dest);
      // tiny delay to let route paint, then trigger the door-open cinematic
      setTimeout(() => window.dispatchEvent(new Event('playDoor')), 120);
    } else {
      setError(res.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-transparent">
      <div className="relative w-full max-w-3xl px-4">
        <div className="hero-overlay" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-section p-8 rounded-card shadow-glass"
        >
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl font-medium text-white mb-2">Welcome back</h2>
              <p className="text-sm text-white/80">Sign in to continue to IrisScan</p>

              <form name="loginForm" className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-xs text-white/80">Email</label>
                  <input name="email" type="email" required className="mt-2 w-full px-3 py-2 rounded-input bg-white/10 text-white placeholder-white/60 border border-white/10 focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs text-white/80">Password</label>
                  <input name="password" type="password" required className="mt-2 w-full px-3 py-2 rounded-input bg-white/10 text-white placeholder-white/60 border border-white/10 focus:ring-2 focus:ring-primary/30" placeholder="••••••••" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">
                    <input type="checkbox" className="mr-2 align-middle" /> Remember me
                  </label>
                </div>

                <div className="pt-2">
                  <Button size="lg" className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
                </div>
                {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
                <div className="pt-3 text-center">
                  <button type="button" onClick={() => navigate('/create')} className="text-sm text-primary underline">Create account</button>
                </div>
              </form>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-card bg-[radial-gradient(ellipse_at_top_left,_#7c3aed,_#06b6d4_30%)] opacity-90" />
                <svg viewBox="0 0 200 200" className="w-full h-full mix-blend-screen" aria-hidden>
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="url(#g)" opacity="0.18" />
                  <circle cx="100" cy="100" r="46" fill="#fff" opacity="0.04" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
