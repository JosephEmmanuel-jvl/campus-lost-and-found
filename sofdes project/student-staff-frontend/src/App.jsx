import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Bell,
  ClipboardCheck,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const allNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report-lost', label: 'Report Lost', icon: FilePlus2 },
  { to: '/report-found', label: 'Report Found', icon: PackageOpen },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/claim', label: 'Claim', icon: ClipboardCheck },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function AppShell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get current user role
  let role = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    role = user?.role || '';
  } catch {
    role = '';
  }

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://127.0.0.1:5000/api/v1/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data && Array.isArray(data.data.notifications)) {
          const count = data.data.notifications.filter((n) => !n.is_read).length;
          setUnreadCount(count);
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);


  // Filter navigation items by role
  const navItems = allNavItems.filter(item => {
    if (item.roles) {
      return item.roles.includes(role);
    }
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-campus-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-campus-green text-sm font-bold text-white">
              5NF
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-campus-green">5NF</p>
              <h2 className="text-xl font-bold">Lost & Found</h2>
            </div>
          </div>
        </div>
        <nav className="space-y-1 px-4 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium ${
                  isActive ? 'bg-campus-mist text-campus-green' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-campus-green text-xs font-bold text-white">
              5NF
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-campus-green">5NF</p>
              <p className="font-bold">Lost & Found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/notifications"
              className="relative rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-1 ring-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-campus-green text-white' : 'bg-slate-100 text-slate-600'
                }`
              }
            >
              <div className="relative flex items-center">
                <item.icon className="h-4 w-4" />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                )}
                <span className="ml-1">{item.label}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Desktop Notification Bell at Upper Right */}
      <div className="fixed top-6 right-8 z-40 hidden lg:block">
        <NavLink
          to="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-campus-green hover:bg-slate-50 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </NavLink>
      </div>

      <main className="px-4 py-6 lg:ml-72 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

