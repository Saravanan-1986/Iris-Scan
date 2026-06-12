import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center text-neutral">No profile available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="glass-section p-6 rounded-card">
          <h2 className="text-xl font-medium mb-4">Profile</h2>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-neutral/80">Username</div>
              <div className="text-base">{user.username}</div>
            </div>
            <div>
              <div className="text-xs text-neutral/80">Email</div>
              <div className="text-base">{user.email}</div>
            </div>
          </div>

          <div className="mt-6">
            <Button size="lg" className="w-full" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
