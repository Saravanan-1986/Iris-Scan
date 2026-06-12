import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/UI/Button';
import { getCurrentUser, logout, deleteUser } from '@/utils/auth';
import SettingsModal from '@/components/UI/SettingsModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleDeleteAccount() {
    if (!user) return;
    // play delete flow: deletion handled as async server call
    await deleteUser(user.email);
    navigate('/login');
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Welcome{user ? `, ${user.username}` : ''}</h1>
            <p className="text-sm text-white/70">Your AI-powered dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>Settings</Button>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <motion.div key={i} className="glass-card p-6 rounded-xl" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 120 }}>
              <div className="text-sm text-white/80 mb-2">Widget {i}</div>
              <div className="h-36 bg-gradient-to-br from-[#0f1724]/30 to-[#0b1220]/20 rounded-lg border border-white/6" />
            </motion.div>
          ))}
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onDelete={handleDeleteAccount} />
    </div>
  );
}
