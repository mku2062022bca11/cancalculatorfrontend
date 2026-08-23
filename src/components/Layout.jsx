import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, 
  Users, 
  Truck, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  FileText
} from 'lucide-react';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard (முகப்பு)', href: '/', icon: Home },
    { name: 'Customers (வாடிக்கையாளர்கள்)', href: '/customers', icon: Users },
    { name: 'Deliveries (விநியோகங்கள்)', href: '/deliveries', icon: Truck },
    { name: 'Payments (பணப்பரிவர்த்தனைகள்)', href: '/payments', icon: CreditCard },
    { name: 'Reports (அறிக்கைகள்)', href: '/reports', icon: FileText },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SS Water & Plates</h1>
          <button onClick={closeSidebar} className="ml-auto lg:hidden p-2 rounded-full hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                )}
              >
                <div className={clsx("p-2 rounded-lg mr-3 transition-colors", isActive ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600")}>
                  <Icon className="h-5 w-5" />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center mb-4 px-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold text-slate-800">{user?.name}</div>
              <div className="text-xs font-medium text-slate-500">Admin</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout (வெளியேறு)
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden h-16 flex items-center px-4 border-b border-slate-200 bg-white shadow-sm z-30 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-3 font-bold text-slate-800 truncate">
            {navigation.find(n => n.href === location.pathname)?.name || 'App'}
          </span>
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
