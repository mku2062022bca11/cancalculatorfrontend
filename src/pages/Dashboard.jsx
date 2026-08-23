import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, 
  Truck, 
  IndianRupee, 
  AlertCircle,
  FileText,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingPaymentsTotal: 0,
    todayDeliveriesCount: 0,
    todayIncome: 0,
    totalMissingCans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, gradientClass, textColor }) => (
    <div className={`card bg-gradient-to-br ${gradientClass} border-none overflow-hidden relative group`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
        <Icon className={`h-24 w-24 ${textColor}`} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className={`text-xs font-bold uppercase tracking-wider ${textColor} leading-tight`}>{title}</p>
          <div className={`p-2 rounded-full bg-white/30 backdrop-blur-md`}>
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
        </div>
        <h3 className={`text-4xl font-black ${textColor}`}>
          {value}
        </h3>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading amazing data (காத்திருக்கவும்)...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard (முகப்பு)</h2>
        <p className="text-slate-500 mt-1">Welcome back. Here's your business at a glance today. (இன்றைய வணிக விவரங்கள்)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={<>Today Deliveries<br/><span className="text-[10px] opacity-80">(இன்றைய விநியோகம்)</span></>}
          value={stats.todayDeliveriesCount} 
          icon={Truck} 
          gradientClass="from-blue-500/10 to-indigo-600/20"
          textColor="text-blue-700"
        />
        <StatCard 
          title={<>Today Income<br/><span className="text-[10px] opacity-80">(இன்றைய வருமானம்)</span></>}
          value={`₹${stats.todayIncome.toLocaleString()}`} 
          icon={IndianRupee} 
          gradientClass="from-emerald-400/10 to-teal-500/20"
          textColor="text-emerald-700"
        />
        <StatCard 
          title={<>Total Customers<br/><span className="text-[10px] opacity-80">(மொத்த வாடிக்கையாளர்கள்)</span></>}
          value={stats.totalCustomers} 
          icon={Users} 
          gradientClass="from-purple-500/10 to-fuchsia-600/20"
          textColor="text-purple-700"
        />
        <StatCard 
          title={<>Pending Payments<br/><span className="text-[10px] opacity-80">(நிலுவைத் தொகை)</span></>}
          value={`₹${stats.pendingPaymentsTotal.toLocaleString()}`} 
          icon={AlertCircle} 
          gradientClass="from-red-500/10 to-rose-600/20"
          textColor="text-red-700"
        />
      </div>

      {stats.totalMissingCans > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 border border-orange-200/60 p-5 rounded-2xl flex items-start sm:items-center shadow-sm flex-col sm:flex-row gap-4 sm:gap-0">
          <div className="p-3 bg-orange-100 rounded-full sm:mr-4 shadow-inner shrink-0">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-orange-900 text-lg">Missing Empty Cans Alert (காலி கேன்கள் எச்சரிக்கை)</h4>
            <p className="text-sm text-orange-700 font-medium mt-1 sm:mt-0">There are currently <span className="font-bold text-orange-900 text-base">{stats.totalMissingCans}</span> pending empty 20L water cans to be collected from customers. (வாடிக்கையாளர்களிடம் இருந்து பெற வேண்டிய காலி கேன்கள்)</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-5">Quick Actions (விரைவான செயல்கள்)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/customers" className="card flex flex-col items-center justify-center p-6 sm:p-8 group hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50 cursor-pointer text-center h-full">
            <div className="p-4 bg-blue-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm sm:text-base">Add Customer</span>
            <span className="text-[10px] sm:text-xs text-slate-500 mt-1">புதிய வாடிக்கையாளர்</span>
          </Link>
          <Link to="/deliveries" className="card flex flex-col items-center justify-center p-6 sm:p-8 group hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 cursor-pointer text-center h-full">
            <div className="p-4 bg-indigo-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-indigo-700 text-sm sm:text-base">New Delivery</span>
            <span className="text-[10px] sm:text-xs text-slate-500 mt-1">புதிய விநியோகம்</span>
          </Link>
          <Link to="/payments" className="card flex flex-col items-center justify-center p-6 sm:p-8 group hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 cursor-pointer text-center h-full">
            <div className="p-4 bg-emerald-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-emerald-700 text-sm sm:text-base">Add Payment</span>
            <span className="text-[10px] sm:text-xs text-slate-500 mt-1">புதிய பணம்</span>
          </Link>
          <Link to="/reports" className="card flex flex-col items-center justify-center p-6 sm:p-8 group hover:bg-gradient-to-br hover:from-white hover:to-purple-50/50 cursor-pointer text-center h-full">
            <div className="p-4 bg-purple-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-purple-700 text-sm sm:text-base">View Reports</span>
            <span className="text-[10px] sm:text-xs text-slate-500 mt-1">அறிக்கைகள்</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
