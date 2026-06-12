import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export default function SettingsModal({ open, onClose, onDelete }: Props) {
  if (!open) return null;

  function handleConfirm() {
    // add red fade overlay animation
    const root = document.querySelector('.app-root');
    if (root) root.classList.add('delete-fade');
    // slight delay to show animation
    setTimeout(() => {
      onDelete();
      if (root) root.classList.remove('delete-fade');
    }, 700);
  }

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass-card p-6 rounded-xl z-20 w-full max-w-md">
        <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
        <p className="text-sm text-neutral mb-4">Manage your account</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-md bg-white/6 text-white" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-md bg-red-600 text-white hover:brightness-110" onClick={handleConfirm}>Delete Account</button>
        </div>
      </motion.div>
    </div>
  );
}
