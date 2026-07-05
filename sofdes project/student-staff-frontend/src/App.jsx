import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  { to: '/staff', label: 'Staff Menu', icon: ShieldCheck, roles: ['Staff', 'Admin'] },
  { to: '/report-lost', label: 'Report Lost', icon: FilePlus2 },
  { to: '/report-found', label: 'Report Found', icon: PackageOpen },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/claim', label: 'Claim', icon: ClipboardCheck },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function AppShell() {
  const navigate = useNavigate();

  // Get current user role
  let role = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    role = user?.role || '';
  } catch {
    role = '';
  }

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
              6NF
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-campus-green">6NF</p>
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
                `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                  isActive ? 'bg-campus-mist text-campus-green' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
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
              6NF
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-campus-green">6NF</p>
              <p className="font-bold">Lost & Found</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
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
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 py-6 lg:ml-72 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

