import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/UI/Button';
import { createUser } from '@/utils/auth';
import { motion } from 'framer-motion';


export default function CreateAccount() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const username = (data.get('username') as string) || '';
    const email = (data.get('email') as string) || '';
    const password = (data.get('password') as string) || '';
    const res = await createUser({ username, email, password });
    setLoading(false);
    if (res.ok) {
      setSuccess('Account created');
      // brief success feedback then navigate and play door
      setTimeout(() => {
        navigate('/dashboard');
        setTimeout(() => window.dispatchEvent(new Event('playDoor')), 80);
      }, 700);
    } else {
      alert(res.error || 'Failed to create account');
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="w-full max-w-2xl p-6">
        <div className="glass-section p-6 rounded-card">
          <form name="createForm" onSubmit={handleCreate} className="space-y-4">
            <input name="username" required placeholder="Username" className="w-full px-3 py-2 rounded-input bg-white/6" />
            <input name="email" type="email" required placeholder="Email" className="w-full px-3 py-2 rounded-input bg-white/6" />
            <input name="password" type="password" required placeholder="Password" className="w-full px-3 py-2 rounded-input bg-white/6" />
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
            </motion.div>
            {success && <div className="text-sm text-green-400 mt-2">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
