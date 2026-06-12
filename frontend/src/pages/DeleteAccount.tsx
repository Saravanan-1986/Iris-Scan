import React from 'react';
import { deleteUser, getCurrentUser } from '@/utils/auth';
import Button from '@/components/UI/Button';
import { useNavigate } from 'react-router-dom';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleDelete() {
    if (!user) return navigate('/login');
    deleteUser(user.email);
    alert('Account deleted');
    navigate('/login');
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="glass-section p-6 rounded-card text-center">
          <p className="mb-4">Delete account for <strong>{user?.username}</strong></p>
          <Button onClick={handleDelete} className="w-full" variant="danger">Delete account</Button>
        </div>
      </div>
    </div>
  );
}
