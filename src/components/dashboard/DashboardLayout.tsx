import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sprout,
  LayoutDashboard,
  MapPin,
  Settings,
  Calendar,
  Cloud,
  Newspaper,
  Eye,
  Droplet,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Package,
  Users,
  Wrench,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Parcels', href: '/dashboard/parcels', icon: MapPin },
  { name: 'Operations', href: '/dashboard/operations', icon: Settings },
  {
    name: 'Inventory',
    icon: Package,
    submenu: [
      { name: 'Personnel', href: '/dashboard/inventory/personnel', icon: Users },
      { name: 'Equipment', href: '/dashboard/inventory/equipment', icon: Wrench },
      { name: 'Inputs', href: '/dashboard/inventory/inputs', icon: Boxes },
    ],
  },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Weather', href: '/dashboard/weather', icon: Cloud },
  { name: 'News', href: '/dashboard/news', icon: Newspaper },
  { name: 'Parcel Monitoring', href: '/dashboard/monitoring', icon: Eye },
  { name: 'Olive Oil Chain', href: '/dashboard/olive-oil', icon: Droplet },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout(); // Call the signOut function from the AuthContext
      navigate('/signin', { replace: true }); // Redirect to sign-in page, replace history
    } catch (error) {
      console.error('Sign-out failed:', error);
      // Optionally, show a user-friendly error message (e.g., toast notification)
      alert('Failed to sign out. Please try again.');
    }
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sprout className="h-6 w-6 text-rose-600" />
            <span className="font-bold text-gray-900">Ztounti</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-64 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-rose-500 to-purple-600 p-2 rounded-lg">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-900">Zitounti</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                if (item.submenu) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => setInventoryOpen(!inventoryOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            inventoryOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {inventoryOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                isActive(subitem.href)
                                  ? 'bg-gradient-to-r from-rose-50 to-purple-50 text-rose-600'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <subitem.icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{subitem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-rose-50 to-purple-50 text-rose-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {user?.email || 'Farmer'}
              </p>
              <p className="text-xs text-gray-600">Premium Member</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              type="button" // Explicitly set button type
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}