import React, { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Layout/Navbar';
import DoorOverlay from '@/components/UI/DoorOverlay';
import { getDarkMode, getLanguage } from '@/utils/storage';
import EyeReveal from '@/components/UI/EyeReveal';
import ProtectedRoute from '@/components/Layout/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home'));
const Capture = lazy(() => import('@/pages/Capture'));
const Questionnaire = lazy(() => import('@/pages/Questionnaire'));
const Analysing = lazy(() => import('@/pages/Analysing'));
const Results = lazy(() => import('@/pages/Results'));
const History = lazy(() => import('@/pages/History'));
const Settings = lazy(() => import('@/pages/Settings'));
const HealthWorkerMode = lazy(() => import('@/pages/HealthWorkerMode'));
const Login = lazy(() => import('@/pages/Login'));
const CreateAccount = lazy(() => import('@/pages/CreateAccount'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));
const Door = lazy(() => import('@/pages/Door'));
const Profile = lazy(() => import('./pages/Profile'));

function Loading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-neutral">Loading...</span>
      </div>
    </div>
  );
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0F1117] dark:to-[#1a1d2e] transition-colors app-root">
      <Navbar />
      <DoorOverlay />
      <EyeReveal />
      <main>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dark = getDarkMode();
    if (dark) document.documentElement.classList.add('dark');
    const lang = getLanguage();
    i18n.changeLanguage(lang);
  }, [i18n]);

  const router = createBrowserRouter(
      [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
          { path: 'capture', element: <ProtectedRoute><Capture /></ProtectedRoute> },
          { path: 'questionnaire', element: <ProtectedRoute><Questionnaire /></ProtectedRoute> },
          { path: 'analysing', element: <ProtectedRoute><Analysing /></ProtectedRoute> },
          { path: 'results', element: <ProtectedRoute><Results /></ProtectedRoute> },
          { path: 'history', element: <ProtectedRoute><History /></ProtectedRoute> },
          { path: 'settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
          { path: 'health-worker', element: <ProtectedRoute><HealthWorkerMode /></ProtectedRoute> },
          { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },

          // public routes under root but not protected
          { path: 'login', element: <Login /> },
          { path: 'create', element: <CreateAccount /> },
          { path: 'door', element: <Door /> },
          { path: 'delete', element: <ProtectedRoute><DeleteAccount /></ProtectedRoute> },
        ],
      },
    ],
    ({ future: { v7_startTransition: true, v7_relativeSplatPath: true } } as any)
  );

  return <RouterProvider router={router} />;
}