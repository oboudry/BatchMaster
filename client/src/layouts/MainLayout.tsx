import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Layers, 
  Home, 
  ClipboardList, 
  FileText, 
  CheckCircle, 
  BarChart2, 
  Settings, 
  Menu, 
  Bell, 
  HelpCircle, 
  X
} from "lucide-react";
import { type User } from "@shared/schema";

// Navigation item type
interface NavItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

// Navigation items
const navItems: NavItem[] = [
  { 
    path: "/", 
    name: "Dashboard", 
    icon: <Home className="mr-3 h-6 w-6" />
  },
  { 
    path: "/work-orders", 
    name: "Work Orders", 
    icon: <ClipboardList className="mr-3 h-6 w-6" />
  },
  { 
    path: "/batch-records", 
    name: "Batch Records", 
    icon: <FileText className="mr-3 h-6 w-6" />
  },
  { 
    path: "/quality-control", 
    name: "Quality Control", 
    icon: <CheckCircle className="mr-3 h-6 w-6" />
  },
  { 
    path: "/reports", 
    name: "Reports", 
    icon: <BarChart2 className="mr-3 h-6 w-6" />
  },
  { 
    path: "/settings", 
    name: "Settings", 
    icon: <Settings className="mr-3 h-6 w-6" />
  }
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [notifications, setNotifications] = useState(3);

  // Get the current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/current-user'],
    staleTime: Infinity,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current page title
  const getPageTitle = () => {
    const currentNavItem = navItems.find(item => item.path === location);
    return currentNavItem ? currentNavItem.name : 'Not Found';
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Navigation */}
      <div 
        className={`md:flex fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg flex-col transition-all duration-300 transform md:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo and Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-md">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">BatchFlow</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a 
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer ${
                  location === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        
        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                {currentUser.fullName.split(' ').map(name => name[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">{currentUser.fullName}</h3>
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'quality_controller' ? 'Quality Controller' : 
                   currentUser.role === 'operator' ? 'Operator' : 'Admin'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-600 focus:outline-none md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* View Title */}
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
              {getPageTitle()}
            </h1>
            
            {/* Search */}
            <div className="relative w-full max-w-md mx-4 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="Search work orders, batch records..." 
              />
            </div>
            
            {/* Right Navigation Items */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-800 focus:outline-none relative">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <button className="text-gray-600 hover:text-gray-800 focus:outline-none hidden md:block">
                <HelpCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
