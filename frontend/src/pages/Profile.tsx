import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/UI/Button';
import { getCurrentUser, logout } from '@/utils/auth';

export default function Profile() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate('/login');
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0F1117] dark:to-[#1a1d2e]">
        <div className="text-center text-neutral text-lg">No profile available.</div>
      </div>
    );
  }

  const initials = user.username
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0F1117] dark:to-[#1a1d2e] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-[#1a1d2e]/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary via-primary-600 to-cyan-500 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Avatar Section */}
          <div className="px-6 pb-2">
            <div className="flex items-end -mt-16 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
              <div className="ml-4 pb-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Info Sections */}
          <div className="px-6 pb-6 space-y-6">
            {/* Account Details */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Account Details</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Username</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700/50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700/50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Account Status</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Scan History</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View past results</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Settings</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">App preferences</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="pt-2">
              <Button
                size="lg"
                className="w-full !py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                onClick={handleSignOut}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}