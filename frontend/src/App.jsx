import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import ToastContainer from './components/ToastContainer';
import AddExpenseModal from './components/AddExpenseModal';
import CreateGroupModal from './components/CreateGroupModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import SettlementsPage from './pages/SettlementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function MainRouter() {
  const { isAuthenticated, groups } = useApp();

  // Route state
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (!path) return 'landing';
    return path;
  });

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      setCurrentRoute(path || 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route, params = {}) => {
    if (params.groupId) {
      setSelectedGroupId(params.groupId);
    }
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
    setCurrentRoute(cleanRoute);
    window.history.pushState({}, '', `/${cleanRoute}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render appropriate view
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'landing':
      case '':
        return (
          <LandingPage
            onGetStarted={() => navigateTo('register')}
            onExploreDashboard={() => navigateTo('dashboard')}
          />
        );

      case 'login':
        return (
          <LoginPage
            onNavigateRegister={() => navigateTo('register')}
            onLoginSuccess={() => navigateTo('dashboard')}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onNavigateLogin={() => navigateTo('login')}
            onRegisterSuccess={() => navigateTo('dashboard')}
          />
        );

      case 'dashboard':
        return <DashboardPage onNavigateRoute={navigateTo} />;

      case 'expenses':
        return <ExpensesPage />;

      case 'groups':
        return (
          <GroupsPage
            groups={groups}
            onSelectGroup={(id) => {
              setSelectedGroupId(id);
              navigateTo('group-details', { groupId: id });
            }}
          />
        );

      case 'group-details':
        return (
          <GroupDetailsPage
            groupId={selectedGroupId}
            onBack={() => navigateTo('groups')}
          />
        );

      case 'settlements':
        return <SettlementsPage />;

      case 'analytics':
        return <AnalyticsPage />;

      case 'profile':
        return <ProfilePage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <NotFoundPage onNavigateDashboard={() => navigateTo('dashboard')} />;
    }
  };

  const isPublicRoute =
    currentRoute === 'landing' ||
    currentRoute === '' ||
    currentRoute === 'login' ||
    currentRoute === 'register';

  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#070B14]">
        {renderCurrentPage()}
        <ToastContainer />
      </div>
    );
  }

  // Authenticated Layout (Sidebar + Top Navbar + Content + Mobile Bottom Nav)
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070B14] transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar currentRoute={currentRoute} setCurrentRoute={navigateTo} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Navbar currentRoute={currentRoute} setCurrentRoute={navigateTo} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav currentRoute={currentRoute} setCurrentRoute={navigateTo} />

      {/* Modals & Toasts */}
      <AddExpenseModal />
      <CreateGroupModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
