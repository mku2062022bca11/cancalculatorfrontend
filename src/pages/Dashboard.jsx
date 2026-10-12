import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, 
  Truck, 
  IndianRupee, 
  AlertCircle,
  FileText,
  ArrowRight,
  Wallet,
  TrendingUp,
  Fuel
} from 'lucide-react';

const StatCard = ({ title, value, icon: _Icon, gradientClass, textColor }) => (
  <div className={`card bg-gradient-to-br ${gradientClass} border-none overflow-hidden relative group`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
      <_Icon className={`h-24 w-24 ${textColor}`} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <p className={`text-xs font-bold uppercase tracking-wider ${textColor} leading-tight`}>{title}</p>
        <div className={`p-2 rounded-full bg-white/30 backdrop-blur-md`}>
          <_Icon className={`h-5 w-5 ${textColor}`} />
        </div>
      </div>
      <h3 className={`text-4xl font-black ${textColor}`}>
        {value}
      </h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingPaymentsTotal: 0,
    todayDeliveriesCount: 0,
    todayIncome: 0,
    todayExpense: 0,
    todayNetProfit: 0,
    thisMonthNetProfit: 0,
    thisYearNetProfit: 0,
    totalExpense: 0,
    totalMissingCans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        let data = response.data;
        
        // If todayExpense isn't in response, check local storage cache
        if (data.todayExpense === undefined || data.thisMonthNetProfit === undefined) {
          const cached = localStorage.getItem('ss_water_expenses_cache');
          if (cached) {
            try {
              const exps = JSON.parse(cached);
              const now = new Date();
              const todayStr = now.toISOString().split('T')[0];
              const curMonth = now.getMonth();
              const curYear = now.getFullYear();

              const tExp = exps
                .filter(e => e.date && e.date.startsWith(todayStr))
                .reduce((s, e) => s + (Number(e.amount) || 0), 0);
              
              const mExp = exps
                .filter(e => {
                  const d = new Date(e.date);
                  return d.getMonth() === curMonth && d.getFullYear() === curYear;
                })
                .reduce((s, e) => s + (Number(e.amount) || 0), 0);

              const yExp = exps
                .filter(e => new Date(e.date).getFullYear() === curYear)
                .reduce((s, e) => s + (Number(e.amount) || 0), 0);

              data.todayExpense = data.todayExpense || tExp;
              data.todayNetProfit = (data.todayIncome || 0) - (data.todayExpense || tExp);
              data.thisMonthNetProfit = data.thisMonthNetProfit !== undefined ? data.thisMonthNetProfit : ((data.thisMonthIncome || data.todayIncome || 0) - mExp);
              data.thisYearNetProfit = data.thisYearNetProfit !== undefined ? data.thisYearNetProfit : ((data.thisYearIncome || data.todayIncome || 0) - yExp);
            } catch (e) {
              console.error(e);
            }
          }
        }
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading amazing data (காத்திருக்கவும்)...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard (முகப்பு)</h2>
        <p className="text-slate-500 mt-1">Welcome back. Here's your business at a glance today. (இன்றைய வணிக விவரங்கள்)</p>
      </div>

      {/* Monthly & Yearly Profit Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard 
          title={<>Monthly Net Profit (இந்த மாத லாபம்)<br/><span className="text-[10px] opacity-80">(This Month Collections - Expenses)</span></>}
          value={`₹${(stats.thisMonthNetProfit !== undefined ? stats.thisMonthNetProfit : ((stats.todayIncome || 0) - (stats.todayExpense || 0))).toLocaleString()}`} 
          icon={TrendingUp} 
          gradientClass="from-emerald-500/15 via-teal-500/15 to-emerald-600/25 border border-emerald-300"
          textColor="text-emerald-800"
        />
        <StatCard 
          title={<>Yearly Net Profit (வருடாந்திர லாபம்)<br/><span className="text-[10px] opacity-80">(Year {new Date().getFullYear()} Total Profit)</span></>}
          value={`₹${(stats.thisYearNetProfit !== undefined ? stats.thisYearNetProfit : ((stats.todayIncome || 0) - (stats.todayExpense || 0))).toLocaleString()}`} 
          icon={TrendingUp} 
          gradientClass="from-indigo-500/15 via-blue-500/15 to-indigo-600/25 border border-indigo-300"
          textColor="text-indigo-800"
        />
      </div>

      {/* Daily Stats Cards */}
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
          title={<>Today Expense<br/><span className="text-[10px] opacity-80">(இன்றைய செலவு)</span></>}
          value={`₹${(stats.todayExpense || 0).toLocaleString()}`} 
          icon={Fuel} 
          gradientClass="from-rose-500/10 to-red-600/20"
          textColor="text-rose-700"
        />
        <StatCard 
          title={<>Today Profit<br/><span className="text-[10px] opacity-80">(இன்றைய லாபம்)</span></>}
          value={`₹${((stats.todayIncome || 0) - (stats.todayExpense || 0)).toLocaleString()}`} 
          icon={TrendingUp} 
          gradientClass="from-indigo-500/10 to-purple-600/20"
          textColor="text-indigo-700"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard 
          title={<>Total Customers<br/><span className="text-[10px] opacity-80">(மொத்த வாடிக்கையாளர்கள்)</span></>}
          value={stats.totalCustomers} 
          icon={Users} 
          gradientClass="from-purple-500/10 to-fuchsia-600/20"
          textColor="text-purple-700"
        />
        <StatCard 
          title={<>Pending Payments Due<br/><span className="text-[10px] opacity-80">(நிலுவைத் தொகை)</span></>}
          value={`₹${stats.pendingPaymentsTotal.toLocaleString()}`} 
          icon={AlertCircle} 
          gradientClass="from-amber-500/10 to-orange-600/20"
          textColor="text-amber-700"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link to="/customers" className="card flex flex-col items-center justify-center p-5 group hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50 cursor-pointer text-center h-full">
            <div className="p-3.5 bg-blue-50 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">Add Customer</span>
            <span className="text-[10px] text-slate-500 mt-0.5">புதிய வாடிக்கையாளர்</span>
          </Link>

          <Link to="/deliveries" className="card flex flex-col items-center justify-center p-5 group hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 cursor-pointer text-center h-full">
            <div className="p-3.5 bg-indigo-50 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-indigo-700 text-sm">New Delivery</span>
            <span className="text-[10px] text-slate-500 mt-0.5">புதிய விநியோகம்</span>
          </Link>

          <Link to="/payments" className="card flex flex-col items-center justify-center p-5 group hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 cursor-pointer text-center h-full">
            <div className="p-3.5 bg-emerald-50 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
              <IndianRupee className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-emerald-700 text-sm">Add Payment</span>
            <span className="text-[10px] text-slate-500 mt-0.5">புதிய பணம்</span>
          </Link>

          <Link to="/expenses" className="card flex flex-col items-center justify-center p-5 group hover:bg-gradient-to-br hover:from-white hover:to-rose-50/50 cursor-pointer text-center h-full border border-rose-100">
            <div className="p-3.5 bg-rose-50 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
              <Wallet className="h-6 w-6 text-rose-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-rose-700 text-sm">Expenses & Profit</span>
            <span className="text-[10px] text-rose-500 mt-0.5 font-semibold">செலவு & லாப கணக்கீடு</span>
          </Link>

          <Link to="/reports" className="card flex flex-col items-center justify-center p-5 group hover:bg-gradient-to-br hover:from-white hover:to-purple-50/50 cursor-pointer text-center h-full col-span-2 sm:col-span-1">
            <div className="p-3.5 bg-purple-50 rounded-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-sm">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-purple-700 text-sm">View Reports</span>
            <span className="text-[10px] text-slate-500 mt-0.5">அறிக்கைகள்</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
